import { useNavigate, useSearchParams } from 'react-router-dom';
import { TabFetchState } from '../../shared/TabFetchState';
import { useTickets } from './hooks';
import { EmptyTickets } from './components/EmptyTickets';
import { TicketGrid } from './components/TicketGrid';
import { TicketsHeader } from './components/TicketsHeader';
import { TicketsPager } from './components/TicketsPager';
import { TicketsSkeleton } from './components/TicketsSkeleton';

export function TicketsTab() {
  const [sp, setSp] = useSearchParams();
  const navigate = useNavigate();
  const rawPage = Number(sp.get('page') ?? '1');
  const page = Number.isFinite(rawPage) && rawPage >= 1 ? rawPage : 1;
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

  return (
    <TabFetchState
      state={state}
      skeleton={<TicketsSkeleton count={6} />}
      empty={{
        when: (data) => data.tickets.length === 0,
        render: <EmptyTickets onBrowse={() => navigate('/')} />,
      }}
    >
      {(data) => (
        <>
          <TicketsHeader
            total={data.total}
            validCount={data.validCount}
            usedCount={data.usedCount}
          />
          <TicketGrid tickets={data.tickets} onRefunded={refetch} />
          {data.totalPages > 1 && (
            <TicketsPager
              page={page}
              totalPages={data.totalPages}
              onPageChange={onPageChange}
            />
          )}
        </>
      )}
    </TabFetchState>
  );
}
