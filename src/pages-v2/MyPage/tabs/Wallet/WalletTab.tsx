import { useSearchParams } from 'react-router-dom';
import { TabErrorBox } from '../../shared/TabErrorBox';
import { TabFetchState } from '../../shared/TabFetchState';
import { useWalletBalance } from '../../shared/walletBalance';
import { BalanceCard } from './components/BalanceCard';
import { BalanceCardSkeleton } from './components/BalanceCardSkeleton';
import { EmptyTransactions } from './components/EmptyTransactions';
import { TransactionList } from './components/TransactionList';
import { TransactionsPager } from './components/TransactionsPager';
import { TransactionsSkeleton } from './components/TransactionsSkeleton';
import { useWalletTransactions } from './hooks';

export function WalletTab() {
  const balance = useWalletBalance();
  const [sp, setSp] = useSearchParams();
  const rawPage = Number(sp.get('page') ?? '1');
  const page = Number.isFinite(rawPage) && rawPage >= 1 ? rawPage : 1;
  const txState = useWalletTransactions(page);

  const onPageChange = (next: number) => {
    setSp((prev) => {
      const nextSp = new URLSearchParams(prev);
      if (next <= 1) nextSp.delete('page');
      else nextSp.set('page', String(next));
      return nextSp;
    });
  };

  return (
    <div className="wallet-tab">
      {balance.status === 'loading' && <BalanceCardSkeleton />}
      {balance.status === 'error' && (
        <TabErrorBox onRetry={balance.refresh} />
      )}
      {balance.status === 'ready' && (
        <BalanceCard
          balance={balance.data.amount}
          lastUpdatedAtLabel={null}
          onCharge={() => alert('충전 — 준비 중입니다')}
          onWithdraw={() => alert('출금 — 준비 중입니다')}
        />
      )}

      <TabFetchState
        state={txState}
        skeleton={<TransactionsSkeleton rows={8} />}
        empty={{
          when: (data) => data.rows.length === 0,
          render: <EmptyTransactions />,
        }}
      >
        {(data) => (
          <>
            <TransactionList txs={data.rows} />
            {data.totalPages > 1 && (
              <TransactionsPager
                page={page}
                totalPages={data.totalPages}
                onPageChange={onPageChange}
              />
            )}
          </>
        )}
      </TabFetchState>
    </div>
  );
}
