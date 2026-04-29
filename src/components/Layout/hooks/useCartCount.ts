import { useCallback, useEffect, useState } from 'react';
import { getCart } from '@/api/cart.api';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Source: docs/archive/v2-cutover/layout.plan.md §4-4 (1차 안).
 *
 * Layout-internal cart badge feed. Reads `isLoggedIn` from AuthContext, fetches
 * `/cart` on login transition, returns 0 while logged out (no API call).
 *
 * Limitation acknowledged in §4-4: in-page mutations (addCartItem / clearCart)
 * are not observed — count refreshes only when the caller explicitly invokes
 * `refresh()` or when `isLoggedIn` flips. The follow-up PR promotes this to a
 * shared `CartContext` so Cart.tsx can dispatch refreshes after mutations.
 */
export interface UseCartCountResult {
  count: number;
  refresh: () => Promise<void>;
  isLoading: boolean;
}

export function useCartCount(): UseCartCountResult {
  const { isLoggedIn } = useAuth();
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!isLoggedIn) {
      setCount(0);
      return;
    }
    setIsLoading(true);
    try {
      const res = await getCart();
      const items = res.data?.items ?? [];
      setCount(items.length);
    } catch {
      // Cart fetch is non-critical chrome data — swallow errors so the
      // Layout never blocks on a transient cart endpoint failure.
      setCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn) {
      void refresh();
    } else {
      setCount(0);
    }
  }, [isLoggedIn, refresh]);

  return { count, refresh, isLoading };
}
