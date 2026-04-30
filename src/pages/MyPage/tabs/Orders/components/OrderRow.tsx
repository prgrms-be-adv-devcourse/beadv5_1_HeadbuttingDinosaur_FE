import { useState } from 'react';
import { Button, StatusChip } from '@/components';
import type { OrderRowVM } from '../types';
import { RefundDialog } from '../../../shared/RefundDialog';
import { OrderItemsPanel } from './OrderItemsPanel';

interface OrderRowProps {
  row: OrderRowVM;
  onRefunded?: () => void;
}

const COLSPAN = 5;

export function OrderRow({ row, onRefunded }: OrderRowProps) {
  const [refundOpen, setRefundOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const canRefund = row.status === 'PAID';

  const toggle = () => setExpanded((v) => !v);

  return (
    <>
      <tr
        className={
          expanded ? 'order-row order-row--expanded' : 'order-row'
        }
      >
        <td className="order-cell order-cell-id" title={row.orderId}>
          <button
            type="button"
            className="order-row__toggle"
            aria-expanded={expanded}
            aria-controls={`order-items-${row.orderId}`}
            onClick={toggle}
          >
            <span
              className={`order-row__chevron${expanded ? ' is-open' : ''}`}
              aria-hidden="true"
            >
              ▸
            </span>
            {row.displayId}
          </button>
        </td>
        <td className="order-cell order-cell-amount">{row.amountLabel}</td>
        <td className="order-cell order-cell-status">
          <StatusChip variant={row.statusVariant}>{row.statusLabel}</StatusChip>
        </td>
        <td className="order-cell order-cell-date">{row.dateLabel}</td>
        <td className="order-cell order-cell-action">
          {canRefund && (
            <Button variant="ghost" size="sm" onClick={() => setRefundOpen(true)}>
              전체 환불
            </Button>
          )}
          <RefundDialog
            open={refundOpen}
            target={{
              kind: 'order',
              orderId: row.orderId,
              amountLabel: row.amountLabel,
              orderLabel: row.displayId,
            }}
            onClose={() => setRefundOpen(false)}
            onSuccess={() => onRefunded?.()}
          />
        </td>
      </tr>
      {expanded && (
        <tr className="order-row__expanded-row">
          <td colSpan={COLSPAN} className="order-row__expanded-cell">
            <div id={`order-items-${row.orderId}`}>
              <OrderItemsPanel
                orderId={row.orderId}
                canRefund={canRefund}
                onRefunded={() => onRefunded?.()}
              />
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
