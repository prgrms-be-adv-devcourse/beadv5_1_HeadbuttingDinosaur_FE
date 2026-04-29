import { useState } from 'react';
import { Button, StatusChip } from '@/components';
import type { OrderRowVM } from '../types';
import { RefundDialog } from '../../../shared/RefundDialog';

interface OrderRowProps {
  row: OrderRowVM;
  onRefunded?: () => void;
}

export function OrderRow({ row, onRefunded }: OrderRowProps) {
  const [open, setOpen] = useState(false);
  const canRefund = row.status === 'PAID';

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
      <td className="order-cell order-cell-action">
        {canRefund && (
          <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
            환불
          </Button>
        )}
        <RefundDialog
          open={open}
          target={{
            kind: 'order',
            orderId: row.orderId,
            amountLabel: row.amountLabel,
            orderLabel: row.displayId,
          }}
          onClose={() => setOpen(false)}
          onSuccess={() => onRefunded?.()}
        />
      </td>
    </tr>
  );
}
