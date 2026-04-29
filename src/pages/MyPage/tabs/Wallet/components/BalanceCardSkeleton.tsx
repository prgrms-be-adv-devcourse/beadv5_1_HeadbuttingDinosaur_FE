import { Card } from '@/components';

export function BalanceCardSkeleton() {
  return (
    <Card
      variant="solid"
      padding={28}
      className="balance-card balance-card-skeleton"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="balance-skeleton-label" aria-hidden="true" />
      <div className="balance-skeleton-amount" aria-hidden="true" />
      <div className="balance-skeleton-actions" aria-hidden="true">
        <span className="balance-skeleton-button" />
        <span className="balance-skeleton-button" />
      </div>
    </Card>
  );
}
