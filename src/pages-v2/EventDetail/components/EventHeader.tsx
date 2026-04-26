import { StatusChip, type StatusVariant } from '@/components-v2/StatusChip';
import type { EventStatus } from '@/types-v2/event';

import type { EventDetailVM } from '../types';

const STATUS_DISPLAY: Record<EventStatus, { variant: StatusVariant; label: string }> = {
  ON_SALE: { variant: 'ok', label: '판매중' },
  SOLD_OUT: { variant: 'sold', label: '매진' },
  SALE_ENDED: { variant: 'end', label: '판매 종료' },
  CANCELLED: { variant: 'end', label: '취소됨' },
  ENDED: { variant: 'end', label: '종료됨' },
};

export interface EventHeaderProps {
  vm: EventDetailVM;
  accent: string;
}

export function EventHeader({ vm, accent }: EventHeaderProps) {
  const { variant, label } = STATUS_DISPLAY[vm.status];
  return (
    <header>
      <div className="ed-header__row">
        <span className="ed-header__category" style={{ color: accent }}>
          {vm.category}
        </span>
        <StatusChip variant={variant}>{label}</StatusChip>
      </div>
      <h1 className="ed-header__title">{vm.title}</h1>
      <div className="ed-header__chips">
        {vm.techStacks.map((name) => (
          <span key={name} className="chip ed-tech-chip">
            {name}
          </span>
        ))}
      </div>
    </header>
  );
}

EventHeader.displayName = 'EventHeader';
