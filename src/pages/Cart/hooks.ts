/**
 * Cart 페이지 훅.
 *
 * Cart.plan.md § 3 / § 5 / § 7 / § 10.2.
 *
 * - `useCart` — 마운트 시 1회 `getCart()` → `toCartVM` → `CartQuery` 상태 머신.
 *   `refetch()` 와 `mutate(updater)` 를 노출. `mutate` 는 `useCartMutations` 가
 *   낙관적 업데이트/롤백 시 데이터 차원만 갱신하기 위해 쓴다 (`fetchedAt` 보존).
 * - `useCartMutations` — `pendingItemIds: Set<string>` 가드 + PATCH/DELETE 낙관적
 *   업데이트 + 실패 시 snapshot 롤백 + 409 시 `refetch()` 1 회 호출.
 *   `addCartItem` 은 EventDetail/`usePurchaseActions` 에서 처리하므로 여기 미포함.
 * - `useCheckout` — `createOrder` (POST `/orders`) + `idempotencyConfig()` 헤더 부착.
 *   성공 시 `paymentTarget(OrderResultVM)` 노출 → 컨테이너가 `<PaymentModal>` 마운트.
 *
 * 401/403/PROFILE_NOT_COMPLETED 는 `apiClient` 인터셉터가 페이지 도달 전에
 * 처리하므로 본 훅들은 그 외 케이스만 분기 (§ 4 표 4).
 */

import axios from 'axios';
import { useCallback, useEffect, useRef, useState } from 'react';

import { deleteCartItem, getCart, updateCartItemQuantity } from '@/api/cart.api';
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
  /**
   * `success` 일 때만 의미 있는 데이터 차원 갱신. `fetchedAt` 등 메타는 유지.
   * mutation 훅이 낙관적 업데이트/응답 머지/롤백에서 사용.
   */
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
  removeItem: (cartItemId: string) => Promise<void>;
}

export function useCartMutations(cart: UseCartReturn): UseCartMutationsReturn {
  const { toast } = useToast();
  const [pendingItemIds, setPendingItemIds] = useState<Set<string>>(
    () => new Set(),
  );
  /** 가드를 동기적으로 읽기 위한 mirror — setState 비동기성으로 인한 동시 클릭 race 방지. */
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
      // 401/403/PROFILE_NOT_COMPLETED 는 인터셉터가 처리 → 도달하지 않음 가정.
      toast(fallbackMsg, 'error');
    },
    [cart, toast],
  );

  const setQuantityDelta = useCallback(
    async (cartItemId: string, delta: 1 | -1): Promise<void> => {
      if (pendingRef.current.has(cartItemId)) return;
      if (cart.status !== 'success') return;
      const snapshot = cart.data;
      // min=1 가드 (서버에 -1 보내 422 받기 전에 클라에서 차단)
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
    async (cartItemId: string): Promise<void> => {
      if (pendingRef.current.has(cartItemId)) return;
      if (cart.status !== 'success') return;
      const snapshot = cart.data;

      lockItem(cartItemId);
      cart.mutate((prev) => applyRemove(prev, cartItemId));
      try {
        await deleteCartItem(cartItemId);
        // DELETE 응답은 { success } 만 → 추가 머지 없음. 낙관적 상태 유지.
      } catch (err) {
        cart.mutate(() => snapshot);
        handleError(err, '삭제하지 못했습니다.');
      } finally {
        unlockItem(cartItemId);
      }
    },
    [cart, handleError, lockItem, unlockItem],
  );

  return { pendingItemIds, setQuantityDelta, removeItem };
}

// ── useCheckout ──────────────────────────────────────────────────────────────

export type CheckoutState = 'idle' | 'submitting' | 'error';

export interface UseCheckoutReturn {
  checkoutState: CheckoutState;
  /** 성공 시 set → 컨테이너가 `<PaymentModal>` 을 마운트하는 트리거. */
  paymentTarget: OrderResultVM | null;
  /** 409 시 `OrderSummary` 영역에 표시할 인라인 메시지 (§ 4 표 4 (b)). */
  inlineError: string | null;
  /** 결제하기 버튼 핸들러. items / pending 가드 후 createOrder 호출. */
  submit: () => Promise<void>;
  /** PaymentModal close — paymentTarget clear (idempotency 키는 호출당 새로 발급). */
  closeModal: () => void;
}

/**
 * § 9.2-15: `createOrder` 에 `idempotencyConfig()` 헤더 부착.
 * `src/api/orders.api.ts :: createOrder` 가 config 인자를 받지 않으므로
 * (api 레이어 freeze — § 4 헤더 주석 참고) `apiClient.post` 를 직접 호출.
 */
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

  // 최신 items 를 submit 클로저로 흘려보내기 위한 ref. 의존성으로 잡으면
  // 매 mutation 마다 submit 인스턴스가 재생성되어 부수효과가 큼.
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

/**
 * 카트 하단 "이런 이벤트는 어떠세요?" 섹션의 데이터 훅.
 *
 * Cart.plan.md § 10.3 PR 4. EventDetail 의 동명 훅과 유사하지만
 *  - `currentEventId` 인자 없음 (카트엔 단일 "현재 이벤트" 가 없음 → 필터 패스)
 *  - 모듈 캐시 미공유 (의도적 분리 — EventDetail 와 카트가 같은 사이트
 *    세션에 동시에 존재하는 흐름은 드뭄. 향후 `_shared` 로 끌어올리는 건
 *    별도 정리 PR)
 *
 * 페치 실패 (401 / 5xx / network) 는 모두 `'hidden'` 으로 흡수해 메인 카트
 * 동작을 침해하지 않는다 (§ 10.3.6 PR 4 시나리오).
 */
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
  // currentEventId 자리에 빈 문자열 — eventId 가 비는 경우는 없으므로 필터 무효.
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
