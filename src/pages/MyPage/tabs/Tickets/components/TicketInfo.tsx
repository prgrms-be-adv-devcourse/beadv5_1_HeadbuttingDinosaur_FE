import { StatusChip } from '@/components';

interface TicketInfoProps {
  statusVariant: 'ok' | 'end' | 'sold';
  statusLabel: string;
  title: string;
  dateLabel: string;
}

export function TicketInfo({
  statusVariant,
  statusLabel,
  title,
  dateLabel,
}: TicketInfoProps) {
  return (
    <div className="ticket-info">
      <StatusChip variant={statusVariant}>{statusLabel}</StatusChip>
      <h3 className="ticket-info-title">{title}</h3>
      <div className="ticket-info-meta">
        <span aria-hidden="true">📅</span> {dateLabel}
      </div>
    </div>
  );
}
