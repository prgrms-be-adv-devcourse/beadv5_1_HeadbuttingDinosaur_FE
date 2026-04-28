import { Card } from '@/components-v2';
import type { TicketVM } from '../types';
import { TicketStripe } from './TicketStripe';
import { TicketInfo } from './TicketInfo';

interface TicketCardProps {
  ticket: TicketVM;
}

export function TicketCard({ ticket }: TicketCardProps) {
  return (
    <Card variant="solid" padding="none" className="ticket-card">
      <TicketStripe accent={ticket.accent} />
      <TicketInfo
        statusVariant={ticket.statusVariant}
        statusLabel={ticket.statusLabel}
        title={ticket.title}
        dateLabel={ticket.dateLabel}
      />
    </Card>
  );
}
