/**
 * Cart 페이지 훅.
 *
 * Cart.plan.md § 3 / § 5 / § 10.2.
 *
 * - `useCart` — 마운트 시 1회 `getCart()` → `toCartVM` → `CartQuery` 상태 머신.
 *   `refetch()` 와 `mutate(updater)` 를 노출. `mutate` 는 `useCartMutations` 가
 *   낙관적 업데이트/롤백 시 데이터 차원만 갱신하기 위해 쓴다 (`fetchedAt` 보존).
 * - `useCartMutations` — `pendingItemIds: Set<string>` 가드 + PATCH/DELETE 낙관적
 *   업데이트 + 실패 시 snapshot 롤백 + 409 시 `refetch()` 1 회 호출.
 *   `addCartItem` 은 EventDetail/`usePurchaseActions` 에서 처리하므로 여기 미포함.
 * - `useCheckout` 는 후속 커밋에서 추가.
 *
 * 401/403/PROFILE_NOT_COMPLETED 는 `apiClient` 인터셉터가 페이지 도달 전에
 * 처리하므로 본 훅들은 그 외 케이스만 분기 (§ 4 표 4).
 */

import axios from 'axios';
import { useCallback, useEffect, useRef, useState } from 'react';

import { deleteCartItem, getCart, updateCartItemQuantity } from '@/api/cart.api';
import { unwrapApiData } from '@/api/client';
import { useToast } from '@/contexts/ToastContext';

import { mergeQuantityUpdate, toCartVM } from './adapters';
import type { CartItemVM, CartQuery, CartVM } from './types';

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
