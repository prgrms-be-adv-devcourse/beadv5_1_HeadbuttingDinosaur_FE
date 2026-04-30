import { StatusChip } from '@/components/StatusChip';
import { accent } from '@/styles/accent';
import type { EventVM } from '../types';

export interface EventCardProps {
  event: EventVM;
  onOpen: () => void;
}

const STACK_LIMIT = 3;

function statusChip(vm: EventVM) {
  if (vm.status === 'SOLD_OUT') {
    return <StatusChip variant="sold">매진</StatusChip>;
  }
  if (vm.status === 'SCHEDULED') {
    return <StatusChip variant="ok">판매 예정</StatusChip>;
  }
  if (vm.status === 'ON_SALE') {
    return vm.isFree ? (
      <StatusChip variant="free">무료</StatusChip>
    ) : (
      <StatusChip variant="ok">판매중</StatusChip>
    );
  }
  return <StatusChip variant="end">판매 종료</StatusChip>;
}

export function EventCard({ event, onOpen }: EventCardProps) {
  const accentColor = accent(event.eventId);
  const sold = event.status === 'SOLD_OUT';
  const stacks = event.techStacks.slice(0, STACK_LIMIT);
  const extraStacks = event.techStacks.length - stacks.length;

  return (
    <article
      className="el-card"
      style={{ ['--el-card-accent' as string]: accentColor }}
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen();
        }
      }}
      aria-label={`${event.title} 상세 보기`}
    >
      <div className="el-card__accent" aria-hidden="true" />
      <div className="el-card__chrome">
        <span className="el-card__category">#{event.category}</span>
        <span className="el-card__sep">·</span>
        <span className="el-card__time">{event.timeLabel}</span>
        <span className="el-card__chrome-spacer" />
        {statusChip(event)}
      </div>
      <div className="el-card__body">
        <h3 className="el-card__title">{event.title}</h3>
        <div className="el-card__meta">
          <div className="el-card__meta-row">
            <span className="el-card__meta-label">일시</span>
            <span className="el-card__meta-value">
              {event.dateLabel} · {event.timeLabel}
            </span>
          </div>
        </div>
        {stacks.length > 0 && (
          <div className="el-card__stacks">
            {stacks.map((s) => (
              <span key={s} className="el-card__stack">
                {s}
              </span>
            ))}
            {extraStacks > 0 && (
              <span className="el-card__stack-more">+{extraStacks}</span>
            )}
          </div>
        )}
        <div className="el-card__footer">
          <div>
            <div className="el-card__footer-label">PRICE</div>
            <div
              className={`el-card__price${event.isFree ? ' is-free' : ''}`}
            >
              {event.isFree ? '무료' : `${event.price.toLocaleString()}원`}
            </div>
          </div>
          <div className="el-card__footer-right">
            <div className="el-card__footer-label">STOCK</div>
            <div
              className={`el-card__stock${
                sold ? ' is-sold' : event.isLowStock ? ' is-low' : ''
              }`}
            >
              {sold
                ? '0석'
                : event.isLowStock
                  ? `⚡ ${event.remainingQuantity}석`
                  : `${event.remainingQuantity}석`}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
