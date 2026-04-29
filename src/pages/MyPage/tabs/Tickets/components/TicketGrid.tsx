import type { TicketVM } from '../types';
import { TicketCard } from './TicketCard';

interface TicketGridProps {
  tickets: TicketVM[];
}

export function TicketGrid({ tickets }: TicketGridProps) {
  return (
    <div className="ticket-grid">
      {tickets.map((ticket) => (
        <TicketCard key={ticket.ticketId} ticket={ticket} />
      ))}
    </div>
  );
}
