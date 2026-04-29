import { Card } from '@/components';
import { OrdersTableHeader } from './OrdersTableHeader';

interface OrdersSkeletonProps {
  rows?: number;
}

export function OrdersSkeleton({ rows = 8 }: OrdersSkeletonProps) {
  return (
    <Card
      variant="solid"
      padding="none"
      className="orders-card orders-skeleton"
      aria-busy="true"
      aria-live="polite"
    >
      <table className="orders-table">
        <OrdersTableHeader />
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i} className="order-row order-row-skeleton" aria-hidden="true">
              <td className="order-cell order-cell-id">
                <span className="orders-skeleton-bar orders-skeleton-bar-sm" />
              </td>
              <td className="order-cell order-cell-amount">
                <span className="orders-skeleton-bar orders-skeleton-bar-md" />
              </td>
              <td className="order-cell order-cell-status">
                <span className="orders-skeleton-bar orders-skeleton-bar-chip" />
              </td>
              <td className="order-cell order-cell-date">
                <span className="orders-skeleton-bar orders-skeleton-bar-md" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
