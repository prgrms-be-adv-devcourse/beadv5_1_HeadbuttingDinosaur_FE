import { useEffect, useState } from 'react';
import { unwrapApiData } from '@/api/client';
import { getOrderDetail } from '@/api/orders.api';
import type { OrderDetailItem } from '@/api/types';
import { Button } from '@/components';
import { RefundDialog } from '../../../shared/RefundDialog';

interface OrderItemsPanelProps {
  orderId: string;
  canRefund: boolean;
  onRefunded: () => void;
}

type State =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; items: OrderDetailItem[] };

const formatKrw = (n: number) => `${n.toLocaleString()}원`;

interface TicketRefundButtonProps {
  ticketId: string;
  eventTitle: string;
  canRefund: boolean;
  onRefunded: () => void;
}

function TicketRefundButton({
  ticketId,
  eventTitle,
  canRefund,
  onRefunded,
}: TicketRefundButtonProps) {
  const [open, setOpen] = useState(false);
  if (!canRefund) return null;
  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        환불
      </Button>
      <RefundDialog
        open={open}
        target={{ kind: 'ticket', ticketId, eventTitle }}
        onClose={() => setOpen(false)}
        onSuccess={() => {
          setOpen(false);
          onRefunded();
        }}
      />
    </>
  );
}

export function OrderItemsPanel({
  orderId,
  canRefund,
  onRefunded,
}: OrderItemsPanelProps) {
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    setState({ status: 'loading' });
    getOrderDetail(orderId)
      .then((res) => {
        if (cancelled) return;
        const detail = unwrapApiData(res.data);
        setState({ status: 'ready', items: detail.items ?? [] });
      })
      .catch(() => {
        if (cancelled) return;
        setState({ status: 'error' });
      });
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  if (state.status === 'loading') {
    return <div className="order-items-panel order-items-panel--loading">불러오는 중…</div>;
  }
  if (state.status === 'error') {
    return <div className="order-items-panel order-items-panel--error">주문 항목을 불러오지 못했습니다.</div>;
  }
  if (state.items.length === 0) {
    return <div className="order-items-panel order-items-panel--empty">표시할 티켓이 없습니다.</div>;
  }

  return (
    <ul className="order-items-list">
      {state.items.flatMap((item) => {
        const ticketIds = item.ticketIds ?? [];
        if (ticketIds.length > 0) {
          // 1주문 내 동일 이벤트 quantity 만큼 티켓이 있을 때 — 티켓별 환불.
          return ticketIds.map((ticketId) => (
            <li
              key={ticketId}
              className="order-items-list__row"
            >
              <div className="order-items-list__title">{item.eventTitle}</div>
              <div className="order-items-list__meta">
                티켓 {ticketId.slice(0, 8)} · {formatKrw(item.unitPrice)}
              </div>
              <div className="order-items-list__action">
                <TicketRefundButton
                  ticketId={ticketId}
                  eventTitle={item.eventTitle}
                  canRefund={canRefund}
                  onRefunded={onRefunded}
                />
              </div>
            </li>
          ));
        }
        return [
          <li key={item.eventId} className="order-items-list__row">
            <div className="order-items-list__title">{item.eventTitle}</div>
            <div className="order-items-list__meta">
              {item.quantity}매 · {formatKrw(item.totalPrice)}
            </div>
            <div className="order-items-list__action" />
          </li>,
        ];
      })}
    </ul>
  );
}
