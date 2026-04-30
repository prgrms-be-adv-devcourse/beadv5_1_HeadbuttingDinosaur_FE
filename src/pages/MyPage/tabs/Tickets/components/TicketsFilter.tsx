import type { TicketStatus } from '../types';

export type TicketStatusFilter = 'ALL' | TicketStatus;

interface TabDef {
  key: TicketStatusFilter;
  label: string;
}

const TABS: readonly TabDef[] = [
  { key: 'ALL', label: '전체' },
  { key: 'ISSUED', label: '사용 가능' },
  { key: 'USED', label: '사용 완료' },
  { key: 'REFUNDED', label: '환불됨' },
  { key: 'CANCELLED', label: '취소됨' },
  { key: 'EXPIRED', label: '만료됨' },
] as const;

interface TicketsFilterProps {
  active: TicketStatusFilter;
  onChange: (next: TicketStatusFilter) => void;
  counts: Record<TicketStatusFilter, number>;
}

export function TicketsFilter({ active, onChange, counts }: TicketsFilterProps) {
  return (
    <div className="tickets-filter" role="tablist" aria-label="티켓 상태 필터">
      {TABS.map((tab) => {
        const c = counts[tab.key] ?? 0;
        const isActive = active === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={
              isActive ? 'tickets-filter__tab is-active' : 'tickets-filter__tab'
            }
            onClick={() => onChange(tab.key)}
          >
            {tab.label}
            <span className="tickets-filter__count">{c}</span>
          </button>
        );
      })}
    </div>
  );
}
