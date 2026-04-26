/**
 * Cart 페이지 훅.
 *
 * Cart.plan.md § 3 / § 10.2.
 *
 * - `useCart` — 마운트 시 1회 `getCart()` → `toCartVM` → `CartQuery` 상태 머신
 *   (loading / success / error). `refetch()` 노출.
 * - `useCartMutations` / `useCheckout` 는 후속 커밋에서 추가.
 *
 * 페치 실패 시 401/403/PROFILE_NOT_COMPLETED 는 `apiClient` 인터셉터가
 * 페이지 도달 전에 처리하므로 본 훅은 그 외 케이스만 `error` 로 분기 (§ 4 표 4).
 *
 * 반환 타입은 `CartQuery & { refetch }` — `useEventDetail` 와 동일 패턴.
 * 프레젠테이션(`<Cart query={...} />`)에 그대로 전달 가능하며, mutation/checkout
 * 훅이 `status === 'success'` 분기로 `data` 에 접근.
 */

import { useCallback, useEffect, useState } from 'react';

import { getCart } from '@/api/cart.api';
import { unwrapApiData } from '@/api/client';

import { toCartVM } from './adapters';
import type { CartQuery, CartVM } from './types';

export type UseCartReturn = CartQuery & { refetch: () => void };

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

  return { ...state, refetch };
}
