import { Card } from '@/components-v2';
import type { WalletTxVM } from '../types';
import { TransactionRow } from './TransactionRow';

interface TransactionListProps {
  txs: WalletTxVM[];
}

export function TransactionList({ txs }: TransactionListProps) {
  return (
    <Card variant="solid" padding="none" className="tx-list-card">
      <ul className="tx-list">
        {txs.map((tx) => (
          <TransactionRow key={tx.transactionId} tx={tx} />
        ))}
      </ul>
    </Card>
  );
}
