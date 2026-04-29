export type TicketStatus =
  | 'ISSUED'
  | 'USED'
  | 'CANCELLED'
  | 'REFUNDED'
  | 'EXPIRED'
  | 'UNKNOWN';

export interface TicketVM {
  ticketId: string;
  eventId: string;
  title: string;
  dateLabel: string;
  status: TicketStatus;
  statusVariant: 'ok' | 'end' | 'sold';
  statusLabel: string;
  accent: string;
}
