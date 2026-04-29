import { useCallback, useEffect, useState } from 'react';
import { getOrders } from '@/api/orders.api';
import { unwrapApiData } from '@/api/client';
import type { FetchState } from '../../shared/TabFetchState';
import { toOrderRowVM } from './adapters';
import type { OrderRowVM } from './types';

const PAGE_SIZE = 20;

export interface OrdersData {
  rows: OrderRowVM[];
  page: number;
  totalPages: number;
  totalElements: number;
}

export type UseOrdersReturn = FetchState<OrdersData> & {
  refetch: () => void;
};

export function useOrders(page: number): UseOrdersReturn {
  const [state, setState] = useState<FetchState<OrdersData>>({
    status: 'loading',
  });
  const [tick, setTick] = useState(0);
  const refetch = useCallback(() => setTick((n) => n + 1), []);

  useEffect(() => {
    let cancelled = false;
    setState({ status: 'loading' });

    getOrders({ page: page - 1, size: PAGE_SIZE })
      .then((res) => {
        if (cancelled) return;
        const list = unwrapApiData(res.data);
        const rows = list.content.map(toOrderRowVM);
        setState({
          status: 'ready',
          data: {
            rows,
            page,
            totalPages: list.totalPages,
            totalElements: list.totalElements,
          },
        });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        const err = error instanceof Error ? error : new Error(String(error));
        setState({ status: 'error', error: err, retry: refetch });
      });

    return () => {
      cancelled = true;
    };
  }, [page, tick, refetch]);

  return { ...state, refetch };
}
