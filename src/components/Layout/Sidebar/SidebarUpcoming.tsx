import type { KeyboardEvent } from 'react';
import { Icon } from '../../Icon';
import type { UpcomingEventVM } from '../types';

/**
 * Source: docs/redesign/layout.plan.md §3-8.
 *
 * Header is a <button> per §6-6 (aria-expanded + aria-controls); list is a
 * <ul role="list"> matching the controls id. Each row is two stacked lines
 * (title + date · price) — block content inside a <button> is invalid HTML,
 * so the row is a <div role="button" tabIndex={0}> with Enter/Space handling
 * (mirrors the TabBar tab-row pattern).
 */
export interface SidebarUpcomingProps {
  open: boolean;
  onToggle: () => void;
  events: UpcomingEventVM[];
  onSelectEvent: (eventId: string) => void;
  className?: string;
}

const LIST_ID = 'side-upcoming-group';

export function SidebarUpcoming({
  open,
  onToggle,
  events,
  onSelectEvent,
  className,
}: SidebarUpcomingProps) {
  const groupCls = className ? `side-group ${className}` : 'side-group';

  const handleItemKey = (e: KeyboardEvent<HTMLDivElement>, eventId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelectEvent(eventId);
    }
  };

  return (
    <>
      <button
        type="button"
        className="side-header"
        aria-expanded={open}
        aria-controls={LIST_ID}
        onClick={onToggle}
      >
        <span>다가오는 이벤트</span>
        <Icon name={open ? 'chevd' : 'chev'} size={10} />
      </button>
      {open && (
        <ul id={LIST_ID} className={groupCls} role="list">
          {events.map((event) => (
            <li key={event.eventId}>
              <div
                className="side-item side-item--card"
                role="button"
                tabIndex={0}
                onClick={() => onSelectEvent(event.eventId)}
                onKeyDown={(ke) => handleItemKey(ke, event.eventId)}
              >
                <div className="side-card-title">{event.title}</div>
                <div className="side-card-meta">
                  {event.dateText} · {event.priceText}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
