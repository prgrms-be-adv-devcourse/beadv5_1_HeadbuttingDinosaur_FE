import { Card } from '@/components-v2';
import type { OrderRowVM } from '../types';
import { OrderRow } from './OrderRow';
import { OrdersTableHeader } from './OrdersTableHeader';

interface OrdersTableProps {
  rows: OrderRowVM[];
}

export function OrdersTable({ rows }: OrdersTableProps) {
  return (
    <Card variant="solid" padding="none" className="orders-card">
      <table className="orders-table">
        <OrdersTableHeader />
        <tbody>
          {rows.map((row) => (
            <OrderRow key={row.orderId} row={row} />
          ))}
        </tbody>
      </table>
    </Card>
  );
}
