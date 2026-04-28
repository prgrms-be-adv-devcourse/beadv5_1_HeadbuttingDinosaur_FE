import { useCallback, useEffect, useState } from 'react';
import { getTickets } from '@/api/tickets.api';
import type { FetchState } from '../../shared/TabFetchState';
import { toTicketVM } from './adapters';
import type { TicketVM } from './types';

const PAGE_SIZE = 20;

export interface TicketsData {
  tickets: TicketVM[];
  total: number;
  totalPages: number;
  validCount: number;
  usedCount: number;
}

export type UseTicketsReturn = FetchState<TicketsData> & {
  refetch: () => void;
};

export function useTickets(page: number): UseTicketsReturn {
  const [state, setState] = useState<FetchState<TicketsData>>({
    status: 'loading',
  });
  const [tick, setTick] = useState(0);
  const refetch = useCallback(() => setTick((n) => n + 1), []);

  useEffect(() => {
    let cancelled = false;
    setState({ status: 'loading' });

    getTickets({ page: page - 1, size: PAGE_SIZE })
      .then((res) => {
        if (cancelled) return;
        const tickets = res.data.tickets.map(toTicketVM);
        setState({
          status: 'ready',
          data: {
            tickets,
            total: res.data.totalElements,
            totalPages: res.data.totalPages,
            validCount: tickets.filter((t) => t.status === 'VALID').length,
            usedCount: tickets.filter((t) => t.status === 'USED').length,
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
