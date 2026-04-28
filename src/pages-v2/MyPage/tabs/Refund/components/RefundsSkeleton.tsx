import { Card } from '@/components-v2';
import { RefundTableHeader } from './RefundTableHeader';

interface RefundsSkeletonProps {
  rows?: number;
}

export function RefundsSkeleton({ rows = 6 }: RefundsSkeletonProps) {
  return (
    <Card
      variant="solid"
      padding="none"
      className="refunds-card refunds-skeleton"
      aria-busy="true"
      aria-live="polite"
    >
      <table className="refunds-table">
        <RefundTableHeader />
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i} className="refund-row refund-row-skeleton" aria-hidden="true">
              <td className="refund-cell refund-cell-id">
                <span className="refunds-skeleton-bar refunds-skeleton-bar-sm" />
              </td>
              <td className="refund-cell refund-cell-id">
                <span className="refunds-skeleton-bar refunds-skeleton-bar-sm" />
              </td>
              <td className="refund-cell refund-cell-amount">
                <span className="refunds-skeleton-bar refunds-skeleton-bar-md" />
              </td>
              <td className="refund-cell refund-cell-status">
                <span className="refunds-skeleton-bar refunds-skeleton-bar-chip" />
              </td>
              <td className="refund-cell refund-cell-date">
                <span className="refunds-skeleton-bar refunds-skeleton-bar-md" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
