import { Card } from '@/components';
import type { OrderRowVM } from '../types';
import { OrderRow } from './OrderRow';
import { OrdersTableHeader } from './OrdersTableHeader';

interface OrdersTableProps {
  rows: OrderRowVM[];
  onRefunded?: () => void;
}

export function OrdersTable({ rows, onRefunded }: OrdersTableProps) {
  return (
    <Card variant="solid" padding="none" className="orders-card">
      <table className="orders-table">
        <OrdersTableHeader />
        <tbody>
          {rows.map((row) => (
            <OrderRow key={row.orderId} row={row} onRefunded={onRefunded} />
          ))}
        </tbody>
      </table>
    </Card>
  );
}
