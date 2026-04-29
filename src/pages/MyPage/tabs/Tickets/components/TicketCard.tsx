import { useState } from 'react';
import { Button, Card } from '@/components';
import type { TicketVM } from '../types';
import { TicketStripe } from './TicketStripe';
import { TicketInfo } from './TicketInfo';
import { RefundDialog } from '../../../shared/RefundDialog';

interface TicketCardProps {
  ticket: TicketVM;
  onRefunded?: () => void;
}

export function TicketCard({ ticket, onRefunded }: TicketCardProps) {
  const [open, setOpen] = useState(false);
  const canRefund = ticket.status === 'VALID';

  return (
    <Card variant="solid" padding="none" className="ticket-card">
      <TicketStripe accent={ticket.accent} />
      <div className="ticket-card-body">
        <TicketInfo
          statusVariant={ticket.statusVariant}
          statusLabel={ticket.statusLabel}
          title={ticket.title}
          dateLabel={ticket.dateLabel}
        />
        {canRefund && (
          <div className="ticket-card-actions">
            <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
              환불 요청
            </Button>
          </div>
        )}
      </div>
      <RefundDialog
        open={open}
        target={{ kind: 'ticket', ticketId: ticket.ticketId, eventTitle: ticket.title }}
        onClose={() => setOpen(false)}
        onSuccess={() => onRefunded?.()}
      />
    </Card>
  );
}
