import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { TabFetchState } from '../../shared/TabFetchState';
import { useTickets } from './hooks';
import { EmptyTickets } from './components/EmptyTickets';
import { TicketGrid } from './components/TicketGrid';
import {
  TicketsFilter,
  type TicketStatusFilter,
} from './components/TicketsFilter';
import { TicketsHeader } from './components/TicketsHeader';
import { TicketsPager } from './components/TicketsPager';
import { TicketsSkeleton } from './components/TicketsSkeleton';
import type { TicketStatus, TicketVM } from './types';

const STATUS_KEYS: readonly TicketStatus[] = [
  'ISSUED',
  'USED',
  'CANCELLED',
  'REFUNDED',
  'EXPIRED',
  'UNKNOWN',
];

const buildCounts = (
  tickets: TicketVM[],
  total: number,
): Record<TicketStatusFilter, number> => {
  const base: Record<TicketStatusFilter, number> = {
    ALL: total,
    ISSUED: 0,
    USED: 0,
    CANCELLED: 0,
    REFUNDED: 0,
    EXPIRED: 0,
    UNKNOWN: 0,
  };
  for (const t of tickets) {
    const k = STATUS_KEYS.includes(t.status) ? t.status : 'UNKNOWN';
    base[k] += 1;
  }
  return base;
};

const isFilter = (v: string | null): v is TicketStatusFilter =>
  v === 'ALL' ||
  v === 'ISSUED' ||
  v === 'USED' ||
  v === 'CANCELLED' ||
  v === 'REFUNDED' ||
  v === 'EXPIRED';

export function TicketsTab() {
  const [sp, setSp] = useSearchParams();
  const navigate = useNavigate();
  const rawPage = Number(sp.get('page') ?? '1');
  const page = Number.isFinite(rawPage) && rawPage >= 1 ? rawPage : 1;
  const rawStatus = sp.get('status');
  const statusFilter: TicketStatusFilter = isFilter(rawStatus) ? rawStatus : 'ALL';
  const state = useTickets(page);
  const refetch = state.refetch;

  const onPageChange = (next: number) => {
    setSp(
      (prev) => {
        const nextSp = new URLSearchParams(prev);
        if (next <= 1) nextSp.delete('page');
        else nextSp.set('page', String(next));
        return nextSp;
      },
      { replace: true },
    );
  };

  const onStatusChange = (next: TicketStatusFilter) => {
    setSp((prev) => {
      const nextSp = new URLSearchParams(prev);
      if (next === 'ALL') nextSp.delete('status');
      else nextSp.set('status', next);
      // 상태 필터 변경은 새 viewport — 1페이지로 리셋.
      nextSp.delete('page');
      return nextSp;
    });
  };

  return (
    <TabFetchState
      state={state}
      skeleton={<TicketsSkeleton count={6} />}
      empty={{
        when: (data) => data.tickets.length === 0,
        render: <EmptyTickets onBrowse={() => navigate('/events')} />,
      }}
    >
      {(data) => (
        <TicketsTabContent
          data={data}
          page={page}
          statusFilter={statusFilter}
          onStatusChange={onStatusChange}
          onPageChange={onPageChange}
          refetch={refetch}
        />
      )}
    </TabFetchState>
  );
}

interface TicketsTabContentProps {
  data: {
    tickets: TicketVM[];
    total: number;
    totalPages: number;
    validCount: number;
    usedCount: number;
  };
  page: number;
  statusFilter: TicketStatusFilter;
  onStatusChange: (next: TicketStatusFilter) => void;
  onPageChange: (next: number) => void;
  refetch: () => void;
}

function TicketsTabContent({
  data,
  page,
  statusFilter,
  onStatusChange,
  onPageChange,
  refetch,
}: TicketsTabContentProps) {
  const counts = useMemo(
    () => buildCounts(data.tickets, data.total),
    [data.tickets, data.total],
  );
  const visible =
    statusFilter === 'ALL'
      ? data.tickets
      : data.tickets.filter((t) => t.status === statusFilter);
  return (
    <>
      <TicketsHeader
        total={data.total}
        validCount={data.validCount}
        usedCount={data.usedCount}
      />
      <TicketsFilter
        active={statusFilter}
        onChange={onStatusChange}
        counts={counts}
      />
      <TicketGrid tickets={visible} onRefunded={refetch} />
      {data.totalPages > 1 && (
        <TicketsPager
          page={page}
          totalPages={data.totalPages}
          onPageChange={onPageChange}
        />
      )}
    </>
  );
}
