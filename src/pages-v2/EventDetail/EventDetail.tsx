import { accent } from '@/styles-v2/accent';

import { Breadcrumb } from './components/Breadcrumb';
import { EventDescription } from './components/EventDescription';
import { EventHeader } from './components/EventHeader';
import { HeroBanner } from './components/HeroBanner';
import { InfoCard } from './components/InfoCard';
import { PurchasePanel } from './components/PurchasePanel';
import { useEventDetail } from './hooks';

export interface EventDetailProps {
  eventId: string;
}

export function EventDetail({ eventId }: EventDetailProps) {
  const query = useEventDetail(eventId);

  // PR 1 한정 — stub hook 이 항상 success. loading/error/not-found/forbidden
  // 분기는 PR 2 의 §5 상태 처리에서 추가.
  if (query.status !== 'success') return null;
  const vm = query.data;
  const accentColor = accent(eventId);

  return (
    <div className="editor-scroll">
      <div className="gutter" aria-hidden="true">
        {Array.from({ length: 60 }, (_, i) => (
          <span key={i} className={`ln${i === 0 ? ' active' : ''}`}>
            {i + 1}
          </span>
        ))}
      </div>
      <div className="editor-body">
        <Breadcrumb title={vm.title} />
        <div className="ed-grid">
          <div className="ed-main">
            <HeroBanner accent={accentColor} />
            <EventHeader vm={vm} accent={accentColor} />
            <InfoCard vm={vm} />
            <EventDescription description={vm.description} />
          </div>
          <PurchasePanel vm={vm} />
        </div>
      </div>
    </div>
  );
}

EventDetail.displayName = 'EventDetail';
