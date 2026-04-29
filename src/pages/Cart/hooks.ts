/**
 * Cart 페이지 훅.
 *
 * v1 백엔드 스펙: 단건 삭제 API 가 없고 전체 삭제(`DELETE /cart`)만 존재.
 * 따라서 단건 삭제는 백엔드 호출 없이 로컬 상태에서만 제거하고, 결제 시
 * `cartItemIds` 에서 자연스럽게 빠지도록 둔다 (페이지 재진입 시 다시
 * 나타나는 비영속 상태가 의도). 전체 삭제만 백엔드와 동기화한다.
 *
 * 401/403/PROFILE_NOT_COMPLETED 는 `apiClient` 인터셉터가 페이지 도달 전에
 * 처리하므로 본 훅들은 그 외 케이스만 분기.
 */

import axios from 'axios';
import { useCallback, useEffect, useRef, useState } from 'react';

import { clearCart, getCart, updateCartItemQuantity } from '@/api/cart.api';
import {
  apiClient,
  idempotencyConfig,
  unwrapApiData,
  type ApiResponse,
} from '@/api/client';
import type { OrderRequest, OrderResponse } from '@/api/types';
import { useToast } from '@/contexts/ToastContext';

import {
  toRecommendedCards,
  type RecommendationResponse,
  type RecommendedCardVM,
} from '@/pages/_shared/recommendation';

import { mergeQuantityUpdate, toCartVM, toOrderResultVM } from './adapters';
import type { CartItemVM, CartQuery, CartVM, OrderResultVM } from './types';

// ── useCart ──────────────────────────────────────────────────────────────────

export type UseCartReturn = CartQuery & {
  refetch: () => void;
  mutate: (updater: (prev: CartVM) => CartVM) => void;
};

const previousFrom = (prev: CartQuery): CartVM | undefined => {
  if (prev.status === 'success') return prev.data;
  return prev.previous;
};

export function useCart(): UseCartReturn {
  const [state, setState] = useState<CartQuery>({ status: 'loading' });
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    const ctrl = new AbortController();
    setState((prev) => ({ status: 'loading', previous: previousFrom(prev) }));

    getCart()
      .then((res) => {
        if (ctrl.signal.aborted) return;
        const data = toCartVM(unwrapApiData(res.data));
        setState({ status: 'success', data, fetchedAt: Date.now() });
      })
      .catch((err) => {
        if (ctrl.signal.aborted) return;
        setState((prev) => ({
          status: 'error',
          error: err,
          previous: previousFrom(prev),
        }));
      });

    return () => ctrl.abort();
  }, [refreshTick]);

  const refetch = useCallback(() => {
    setRefreshTick((n) => n + 1);
  }, []);

  const mutate = useCallback((updater: (prev: CartVM) => CartVM) => {
    setState((prev) =>
      prev.status === 'success'
        ? { ...prev, data: updater(prev.data) }
        : prev,
    );
  }, []);

  return { ...state, refetch, mutate };
}

// ── useCartMutations ─────────────────────────────────────────────────────────

const recomputeTotals = (items: CartItemVM[], fee: number, discount: number) => {
  const subtotal = items.reduce((sum, i) => sum + i.lineTotal, 0);
  return { subtotal, total: subtotal + fee - discount };
};

const applyQuantityDelta = (
  prev: CartVM,
  cartItemId: string,
  delta: number,
): CartVM => {
  const idx = prev.items.findIndex((i) => i.cartItemId === cartItemId);
  if (idx === -1) return prev;
  const target = prev.items[idx];
  const nextQty = target.quantity + delta;
  if (nextQty < 1) return prev;
  const items = prev.items.slice();
  items[idx] = {
    ...target,
    quantity: nextQty,
    lineTotal: target.unitPrice * nextQty,
  };
  return { ...prev, items, ...recomputeTotals(items, prev.fee, prev.discount) };
};

const applyRemove = (prev: CartVM, cartItemId: string): CartVM => {
  const items = prev.items.filter((i) => i.cartItemId !== cartItemId);
  if (items.length === prev.items.length) return prev;
  return { ...prev, items, ...recomputeTotals(items, prev.fee, prev.discount) };
};

const isStatus = (err: unknown, status: number): boolean =>
  axios.isAxiosError(err) && err.response?.status === status;

export interface UseCartMutationsReturn {
  pendingItemIds: Set<string>;
  setQuantityDelta: (cartItemId: string, delta: 1 | -1) => Promise<void>;
  /**
   * 단건 삭제 — v1 백엔드 스펙엔 단건 삭제 API 가 없다. 로컬 상태에서만
   * 제거하고 결제 시 `cartItemIds` 에서 빠지도록 둔다.
   */
  removeItem: (cartItemId: string) => void;
  /** 전체 삭제 — `DELETE /cart` 호출 + 로컬 비우기. */
  clearAll: () => Promise<void>;
  clearing: boolean;
}

export function useCartMutations(cart: UseCartReturn): UseCartMutationsReturn {
  const { toast } = useToast();
  const [pendingItemIds, setPendingItemIds] = useState<Set<string>>(
    () => new Set(),
  );
  const pendingRef = useRef<Set<string>>(pendingItemIds);

  const lockItem = useCallback((id: string) => {
    pendingRef.current = new Set(pendingRef.current).add(id);
    setPendingItemIds(pendingRef.current);
  }, []);
  const unlockItem = useCallback((id: string) => {
    const next = new Set(pendingRef.current);
    next.delete(id);
    pendingRef.current = next;
    setPendingItemIds(next);
  }, []);

  const handleError = useCallback(
    (err: unknown, fallbackMsg: string) => {
      if (isStatus(err, 409)) {
        cart.refetch();
        toast('재고 상태가 변경되었습니다. 장바구니를 다시 불러옵니다.', 'error');
        return;
      }
      toast(fallbackMsg, 'error');
    },
    [cart, toast],
  );

  const setQuantityDelta = useCallback(
    async (cartItemId: string, delta: 1 | -1): Promise<void> => {
      if (pendingRef.current.has(cartItemId)) return;
      if (cart.status !== 'success') return;
      const snapshot = cart.data;
      const target = snapshot.items.find((i) => i.cartItemId === cartItemId);
      if (!target) return;
      if (delta === -1 && target.quantity <= 1) return;

      lockItem(cartItemId);
      cart.mutate((prev) => applyQuantityDelta(prev, cartItemId, delta));
      try {
        const res = await updateCartItemQuantity(cartItemId, { quantity: delta });
        cart.mutate((prev) => mergeQuantityUpdate(prev, res.data));
      } catch (err) {
        cart.mutate(() => snapshot);
        handleError(err, '수량을 변경하지 못했습니다.');
      } finally {
        unlockItem(cartItemId);
      }
    },
    [cart, handleError, lockItem, unlockItem],
  );

  const removeItem = useCallback(
    (cartItemId: string): void => {
      if (cart.status !== 'success') return;
      cart.mutate((prev) => applyRemove(prev, cartItemId));
    },
    [cart],
  );

  const [clearing, setClearing] = useState(false);
  const clearAll = useCallback(async (): Promise<void> => {
    if (cart.status !== 'success') return;
    if (clearing) return;
    const snapshot = cart.data;
    setClearing(true);
    cart.mutate((prev) => ({
      ...prev,
      items: [],
      subtotal: 0,
      total: prev.fee - prev.discount,
    }));
    try {
      await clearCart();
    } catch (err) {
      cart.mutate(() => snapshot);
      handleError(err, '전체 삭제에 실패했습니다.');
    } finally {
      setClearing(false);
    }
  }, [cart, clearing, handleError]);

  return { pendingItemIds, setQuantityDelta, removeItem, clearAll, clearing };
}

// ── useCheckout ──────────────────────────────────────────────────────────────

export type CheckoutState = 'idle' | 'submitting' | 'error';

export interface UseCheckoutReturn {
  checkoutState: CheckoutState;
  paymentTarget: OrderResultVM | null;
  inlineError: string | null;
  submit: () => Promise<void>;
  closeModal: () => void;
}

const submitCreateOrder = (body: OrderRequest) =>
  apiClient.post<ApiResponse<OrderResponse>>('/orders', body, idempotencyConfig());

const isStatusCode = (err: unknown, status: number): boolean =>
  axios.isAxiosError(err) && err.response?.status === status;

export function useCheckout(
  items: CartItemVM[],
  refetch: () => void,
): UseCheckoutReturn {
  const { toast } = useToast();
  const [checkoutState, setCheckoutState] = useState<CheckoutState>('idle');
  const [paymentTarget, setPaymentTarget] = useState<OrderResultVM | null>(null);
  const [inlineError, setInlineError] = useState<string | null>(null);

  const itemsRef = useRef(items);
  itemsRef.current = items;
  const stateRef = useRef(checkoutState);
  stateRef.current = checkoutState;

  const submit = useCallback(async (): Promise<void> => {
    const list = itemsRef.current;
    if (list.length === 0) return;
    if (stateRef.current === 'submitting') return;

    setInlineError(null);
    setCheckoutState('submitting');
    try {
      const res = await submitCreateOrder({
        cartItemIds: list.map((i) => i.cartItemId),
      });
      const order = toOrderResultVM(unwrapApiData(res.data));
      setPaymentTarget(order);
      setCheckoutState('idle');
    } catch (err) {
      if (isStatusCode(err, 409)) {
        refetch();
        setInlineError('재고가 부족하거나 일부 항목이 변경되었습니다. 장바구니를 다시 확인해주세요.');
      } else {
        toast('결제를 시작하지 못했습니다.', 'error');
      }
      setCheckoutState('error');
    }
  }, [refetch, toast]);

  const closeModal = useCallback(() => {
    setPaymentTarget(null);
  }, []);

  return { checkoutState, paymentTarget, inlineError, submit, closeModal };
}

// ── useRecommendedEvents ─────────────────────────────────────────────────────

export type RecommendedQuery =
  | { status: 'loading' }
  | { status: 'ready'; cards: RecommendedCardVM[] }
  | { status: 'hidden' };

const RECOMMEND_STALE_MS = 60_000;
let cartRecommendCache: {
  api: RecommendationResponse;
  fetchedAt: number;
} | null = null;

const deriveCartRecommended = (): RecommendedQuery => {
  if (!cartRecommendCache) return { status: 'loading' };
  const cards = toRecommendedCards(cartRecommendCache.api, '');
  return cards.length > 0 ? { status: 'ready', cards } : { status: 'hidden' };
};

const fetchCartRecommendations = async (
  signal: AbortSignal,
): Promise<RecommendationResponse> => {
  const res = await apiClient.get<ApiResponse<RecommendationResponse>>(
    '/events/user/recommendations',
    { signal },
  );
  return unwrapApiData(res.data);
};

export function useRecommendedEvents(): RecommendedQuery {
  const [state, setState] = useState<RecommendedQuery>(() => {
    if (
      cartRecommendCache &&
      Date.now() - cartRecommendCache.fetchedAt < RECOMMEND_STALE_MS
    ) {
      return deriveCartRecommended();
    }
    return { status: 'loading' };
  });

  useEffect(() => {
    const fresh =
      cartRecommendCache &&
      Date.now() - cartRecommendCache.fetchedAt < RECOMMEND_STALE_MS;
    if (fresh) {
      setState(deriveCartRecommended());
      return;
    }
    setState({ status: 'loading' });

    const ctrl = new AbortController();
    fetchCartRecommendations(ctrl.signal)
      .then((api) => {
        cartRecommendCache = { api, fetchedAt: Date.now() };
        setState(deriveCartRecommended());
      })
      .catch(() => {
        if (ctrl.signal.aborted) return;
        setState({ status: 'hidden' });
      });

    return () => ctrl.abort();
  }, []);

  return state;
}
