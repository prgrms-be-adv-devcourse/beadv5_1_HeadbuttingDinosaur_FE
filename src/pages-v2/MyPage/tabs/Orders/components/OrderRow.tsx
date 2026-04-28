import { StatusChip } from '@/components-v2';
import type { OrderRowVM } from '../types';

interface OrderRowProps {
  row: OrderRowVM;
}

export function OrderRow({ row }: OrderRowProps) {
  return (
    <tr className="order-row">
      <td className="order-cell order-cell-id" title={row.orderId}>
        {row.displayId}
      </td>
      <td className="order-cell order-cell-amount">{row.amountLabel}</td>
      <td className="order-cell order-cell-status">
        <StatusChip variant={row.statusVariant}>{row.statusLabel}</StatusChip>
      </td>
      <td className="order-cell order-cell-date">{row.dateLabel}</td>
    </tr>
  );
}
