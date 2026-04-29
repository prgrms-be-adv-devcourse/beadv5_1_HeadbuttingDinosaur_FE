import { Card } from '@/components';

interface TransactionsSkeletonProps {
  rows?: number;
}

export function TransactionsSkeleton({ rows = 8 }: TransactionsSkeletonProps) {
  return (
    <Card
      variant="solid"
      padding="none"
      className="tx-list-card tx-list-skeleton"
      aria-busy="true"
      aria-live="polite"
    >
      <ul className="tx-list">
        {Array.from({ length: rows }).map((_, i) => (
          <li key={i} className="tx-row tx-row-skeleton" aria-hidden="true">
            <span className="tx-skeleton-bar tx-skeleton-bar-chip" />
            <span className="tx-skeleton-bar tx-skeleton-bar-related" />
            <span className="tx-skeleton-bar tx-skeleton-bar-amount" />
            <span className="tx-skeleton-bar tx-skeleton-bar-date" />
          </li>
        ))}
      </ul>
    </Card>
  );
}
