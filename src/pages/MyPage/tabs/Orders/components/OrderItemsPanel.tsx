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
        setState({ status: 'ready', items: detail.orderItems ?? [] });
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
        const tickets = item.tickets ?? [];
        if (tickets.length > 0) {
          return tickets.map((ticket) => {
            const isRefunded = ticket.status === 'REFUNDED';
            const ticketRefundable = canRefund && ticket.status === 'ISSUED';
            return (
              <li key={ticket.ticketId} className="order-items-list__row">
                <div className="order-items-list__title">{item.eventTitle}</div>
                <div className="order-items-list__meta">
                  티켓 {ticket.ticketId.slice(0, 8)} · {formatKrw(item.price)}
                  {isRefunded ? ' · 환불됨' : ''}
                </div>
                <div className="order-items-list__action">
                  <TicketRefundButton
                    ticketId={ticket.ticketId}
                    eventTitle={item.eventTitle}
                    canRefund={ticketRefundable}
                    onRefunded={onRefunded}
                  />
                </div>
              </li>
            );
          });
        }
        return [
          <li key={item.eventId} className="order-items-list__row">
            <div className="order-items-list__title">{item.eventTitle}</div>
            <div className="order-items-list__meta">
              {item.quantity}매 · {formatKrw(item.price * item.quantity)}
            </div>
            <div className="order-items-list__action" />
          </li>,
        ];
      })}
    </ul>
  );
}
