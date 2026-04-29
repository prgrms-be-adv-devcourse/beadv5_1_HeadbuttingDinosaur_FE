import type { EventStatus } from '@/types/event';

const KNOWN_STATUSES: readonly EventStatus[] = [
  'ON_SALE',
  'SOLD_OUT',
  'SALE_ENDED',
  'CANCELLED',
  'ENDED',
];

const pad2 = (n: number) => String(n).padStart(2, '0');

export const toStatus = (raw: string): EventStatus =>
  (KNOWN_STATUSES as readonly string[]).includes(raw)
    ? (raw as EventStatus)
    : 'ENDED';

export const toDateTimeLabels = (
  iso: string,
): { dateLabel: string; timeLabel: string } => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { dateLabel: '', timeLabel: '' };
  return {
    dateLabel: `${d.getFullYear()}.${pad2(d.getMonth() + 1)}.${pad2(d.getDate())}`,
    timeLabel: `${pad2(d.getHours())}:${pad2(d.getMinutes())}`,
  };
};

export const isFree = (price: number): boolean => price === 0;

// §8-항목3 결정: EventList(<10) ↔ EventDetail 임계값을 <5 로 통일.
export const isLowStock = (remaining: number): boolean =>
  remaining > 0 && remaining < 5;
