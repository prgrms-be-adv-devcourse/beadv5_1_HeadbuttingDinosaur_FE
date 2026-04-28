import { TX_TYPE_MAP } from '../adapters';
import type { WalletTxVM } from '../types';

interface TransactionRowProps {
  tx: WalletTxVM;
}

export function TransactionRow({ tx }: TransactionRowProps) {
  const entry = tx.type === 'UNKNOWN' ? null : TX_TYPE_MAP[tx.type];
  const label = entry?.label ?? '기타';
  const sign = entry?.sign ?? '';
  const amountClass =
    sign === '+'
      ? 'tx-amount tx-amount-positive'
      : sign === '-'
        ? 'tx-amount tx-amount-negative'
        : 'tx-amount';

  return (
    <li className="tx-row">
      <span className={`tx-type-chip tx-type-${tx.type.toLowerCase()}`}>
        {label}
      </span>
      <span className="tx-related">{tx.relatedLabel}</span>
      <span
        className={amountClass}
        style={entry ? { color: entry.color } : undefined}
      >
        {sign}
        {tx.amount.toLocaleString()}원
      </span>
      <span className="tx-date">{tx.dateLabel}</span>
    </li>
  );
}
