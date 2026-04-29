import axios from 'axios';
import type { ReactNode } from 'react';

import { accent } from '@/styles/accent';

import { Breadcrumb } from './components/Breadcrumb';
import { ErrorState } from './components/ErrorState';
import { EventDescription } from './components/EventDescription';
import { EventDetailSkeleton } from './components/EventDetailSkeleton';
import { EventHeader } from './components/EventHeader';
import { EventMap } from './components/EventMap';
import { ForbiddenCard } from './components/ForbiddenCard';
import { HeroBanner } from './components/HeroBanner';
import { InfoCard } from './components/InfoCard';
import { NotFoundCard } from './components/NotFoundCard';
import { PurchasePanel } from './components/PurchasePanel';
import { RecommendedSection } from './components/RecommendedSection';
import { useEventDetail, useRecommendedEvents } from './hooks';

export interface EventDetailProps {
  eventId: string;
}

/* Shared chrome for non-success branches. Skeleton owns its own chrome
 * (it was authored standalone in N1) so it stays out of this helper. */
function PageShell({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
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
        <Breadcrumb title={title} />
        {children}
      </div>
    </div>
  );
}

const ERROR_NETWORK_TITLE = '네트워크 연결을 확인해주세요';
const ERROR_NETWORK_MESSAGE = '잠시 후 다시 시도해주세요.';
const ERROR_GENERIC_TITLE = '이벤트 정보를 불러올 수 없습니다';
const ERROR_GENERIC_MESSAGE = '일시적인 오류입니다. 잠시 후 다시 시도해주세요.';

function describeError(err: unknown): { title: string; message: string } {
  if (axios.isAxiosError(err)) {
    if (err.code === 'ERR_NETWORK' || err.code === 'ECONNABORTED') {
      return { title: ERROR_NETWORK_TITLE, message: ERROR_NETWORK_MESSAGE };
    }
    const status = err.response?.status;
    const data = err.response?.data as { message?: string } | undefined;
    /* 5xx 는 서버 메시지 무시 (§5-(2) 표). 그 외 4xx 는 server message 우선. */
    if (status && status < 500 && data?.message) {
      return { title: ERROR_GENERIC_TITLE, message: data.message };
    }
  }
  return { title: ERROR_GENERIC_TITLE, message: ERROR_GENERIC_MESSAGE };
}

export function EventDetail({ eventId }: EventDetailProps) {
  const query = useEventDetail(eventId);
  const recommended = useRecommendedEvents(eventId);

  /* §5 우선순위: loading → not-found → forbidden → error → success.
   * Recommended section only renders inside the success branch. */

  if (query.status === 'loading') {
    return <EventDetailSkeleton />;
  }

  if (query.status === 'not-found') {
    return (
      <PageShell title="이벤트">
        <NotFoundCard />
      </PageShell>
    );
  }

  if (query.status === 'forbidden') {
    return (
      <PageShell title="이벤트">
        <ForbiddenCard message={query.message} />
      </PageShell>
    );
  }

  if (query.status === 'error') {
    const { title, message } = describeError(query.error);
    return (
      <PageShell title="이벤트">
        <ErrorState
          title={title}
          message={message}
          onRetry={query.refetch}
        />
      </PageShell>
    );
  }

  const vm = query.data;
  const accentColor = accent(eventId);

  return (
    <PageShell title={vm.title}>
      <div className="ed-grid">
        <div className="ed-main">
          <HeroBanner accent={accentColor} />
          <EventHeader vm={vm} accent={accentColor} />
          <InfoCard vm={vm} />
          {vm.location && <EventMap location={vm.location} />}
          <EventDescription description={vm.description} />
        </div>
        <PurchasePanel vm={vm} />
      </div>
      {recommended.status === 'ready' && (
        <RecommendedSection cards={recommended.cards} />
      )}
    </PageShell>
  );
}

EventDetail.displayName = 'EventDetail';
