import { useCallback, useEffect, useState } from 'react';
import { getWalletTransactions } from '@/api/wallet.api';
import { unwrapApiData } from '@/api/client';
import type { FetchState } from '../../shared/TabFetchState';
import { toWalletTxVM } from './adapters';
import type { WalletTxVM } from './types';

const PAGE_SIZE = 20;

export interface WalletTxData {
  rows: WalletTxVM[];
  page: number;
  totalPages: number;
  totalElements: number;
}

export type UseWalletTransactionsReturn = FetchState<WalletTxData> & {
  refetch: () => void;
};

export function useWalletTransactions(page: number): UseWalletTransactionsReturn {
  const [state, setState] = useState<FetchState<WalletTxData>>({
    status: 'loading',
  });
  const [tick, setTick] = useState(0);
  const refetch = useCallback(() => setTick((n) => n + 1), []);

  useEffect(() => {
    let cancelled = false;
    setState({ status: 'loading' });

    getWalletTransactions({ page: page - 1, size: PAGE_SIZE })
      .then((res) => {
        if (cancelled) return;
        const list = unwrapApiData(res.data);
        const rows = list.items.map(toWalletTxVM);
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
