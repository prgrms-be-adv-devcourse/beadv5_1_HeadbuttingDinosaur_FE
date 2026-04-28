import type { TicketItem } from '@/api/types';
import { fmtDate } from '@/lib/format';
import { accent } from '@/styles-v2/accent';
import type { TicketStatus, TicketVM } from './types';

type StatusEntry = { variant: TicketVM['statusVariant']; label: string };

export const TICKET_STATUS_MAP: Record<Exclude<TicketStatus, 'UNKNOWN'>, StatusEntry> = {
  VALID: { variant: 'ok', label: '사용 가능' },
  USED: { variant: 'end', label: '사용 완료' },
  CANCELLED: { variant: 'sold', label: '취소됨' },
  EXPIRED: { variant: 'end', label: '만료' },
};

export function toTicketVM(api: TicketItem): TicketVM {
  const known = (TICKET_STATUS_MAP as Record<string, StatusEntry | undefined>)[api.status];
  const status: TicketStatus = known ? (api.status as TicketStatus) : 'UNKNOWN';
  return {
    ticketId: String(api.ticketId),
    eventId: api.eventId,
    title: api.eventTitle,
    dateLabel: fmtDate(api.eventDate),
    status,
    statusVariant: known?.variant ?? 'end',
    statusLabel: known?.label ?? api.status,
    accent: accent(api.eventId),
  };
}
