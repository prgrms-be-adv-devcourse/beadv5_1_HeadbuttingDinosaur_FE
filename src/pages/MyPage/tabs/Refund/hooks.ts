import { useCallback, useEffect, useState } from 'react';
import { getRefunds } from '@/api/refunds.api';
import type { FetchState } from '../../shared/TabFetchState';
import { toRefundRowVM } from './adapters';
import type { RefundRowVM } from './types';

const PAGE_SIZE = 20;

export interface RefundsData {
  rows: RefundRowVM[];
  page: number;
  totalPages: number;
  totalElements: number;
}

export type UseRefundsReturn = FetchState<RefundsData> & {
  refetch: () => void;
};

export function useRefunds(page: number): UseRefundsReturn {
  const [state, setState] = useState<FetchState<RefundsData>>({
    status: 'loading',
  });
  const [tick, setTick] = useState(0);
  const refetch = useCallback(() => setTick((n) => n + 1), []);

  useEffect(() => {
    let cancelled = false;
    setState({ status: 'loading' });

    getRefunds({ page: page - 1, size: PAGE_SIZE })
      .then((res) => {
        if (cancelled) return;
        const list = res.data;
        const rows = list.content.map(toRefundRowVM);
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
