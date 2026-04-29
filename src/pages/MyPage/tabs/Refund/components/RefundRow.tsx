import { StatusChip } from '@/components';
import type { RefundRowVM } from '../types';

interface RefundRowProps {
  row: RefundRowVM;
}

export function RefundRow({ row }: RefundRowProps) {
  return (
    <tr className="refund-row">
      <td className="refund-cell refund-cell-id" title={row.refundId}>
        {row.displayRefundId}
      </td>
      <td className="refund-cell refund-cell-id" title={row.orderId}>
        {row.displayOrderId}
      </td>
      <td className="refund-cell refund-cell-amount">{row.amountLabel}</td>
      <td className="refund-cell refund-cell-status">
        <StatusChip variant={row.statusVariant}>{row.statusLabel}</StatusChip>
      </td>
      <td className="refund-cell refund-cell-date">{row.dateLabel}</td>
    </tr>
  );
}
