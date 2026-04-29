import { useSearchParams } from 'react-router-dom';
import { TabFetchState } from '../../shared/TabFetchState';
import { useRefunds } from './hooks';
import { EmptyRefunds } from './components/EmptyRefunds';
import { RefundList } from './components/RefundList';
import { RefundsPager } from './components/RefundsPager';
import { RefundsSkeleton } from './components/RefundsSkeleton';

export function RefundTab() {
  const [sp, setSp] = useSearchParams();
  const rawPage = Number(sp.get('page') ?? '1');
  const page = Number.isFinite(rawPage) && rawPage >= 1 ? rawPage : 1;
  const state = useRefunds(page);

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
      skeleton={<RefundsSkeleton rows={6} />}
      empty={{
        when: (data) => data.rows.length === 0,
        render: <EmptyRefunds />,
      }}
    >
      {(data) => (
        <>
          <RefundList rows={data.rows} />
          {data.totalPages > 1 && (
            <RefundsPager
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
