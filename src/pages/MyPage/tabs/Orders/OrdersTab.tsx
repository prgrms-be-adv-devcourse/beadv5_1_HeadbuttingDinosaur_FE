import { useNavigate, useSearchParams } from 'react-router-dom';
import { TabFetchState } from '../../shared/TabFetchState';
import { useOrders } from './hooks';
import { EmptyOrders } from './components/EmptyOrders';
import { OrdersPager } from './components/OrdersPager';
import { OrdersSkeleton } from './components/OrdersSkeleton';
import { OrdersTable } from './components/OrdersTable';

export function OrdersTab() {
  const [sp, setSp] = useSearchParams();
  const navigate = useNavigate();
  const rawPage = Number(sp.get('page') ?? '1');
  const page = Number.isFinite(rawPage) && rawPage >= 1 ? rawPage : 1;
  const state = useOrders(page);
  const refetch = state.refetch;

  const onPageChange = (next: number) => {
    setSp((prev) => {
      const nextSp = new URLSearchParams(prev);
      if (next <= 1) nextSp.delete('page');
      else nextSp.set('page', String(next));
      return nextSp;
    });
  };

  return (
    <TabFetchState
      state={state}
      skeleton={<OrdersSkeleton rows={8} />}
      empty={{
        when: (data) => data.rows.length === 0,
        render: <EmptyOrders onBrowse={() => navigate('/')} />,
      }}
    >
      {(data) => (
        <>
          <OrdersTable rows={data.rows} onRefunded={refetch} />
          {data.totalPages > 1 && (
            <OrdersPager
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
