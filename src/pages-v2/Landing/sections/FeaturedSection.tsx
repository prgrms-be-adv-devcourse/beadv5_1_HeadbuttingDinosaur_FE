/**
 * Featured 섹션 — 5 rows + 상태 분기.
 * PR 3 (Categories + Featured) — Landing.plan.md §12.3 / §6.4.
 *
 * 상태 매트릭스 (§6.4):
 *  - 로딩 (previous 없음): 5 × FeaturedRowSkeleton.
 *  - 로딩 (previous 보유): 이전 행 유지 (refetch 깜빡임 방지).
 *  - 정상 (1~5건): 받은 만큼 행 노출 (5건 미만이어도 그대로).
 *  - 빈 (0건): 본문을 EmptyState 로 교체 (SectionHead 유지). 섹션 숨기지 X.
 *  - 에러 (success 없음 & previous 없음): 인라인 에러 박스 + 다시 시도.
 *
 * 라우팅:
 *  - 행 클릭 → `/events/:eventId?v=2` (§12.3 검증 7)
 *  - "전체 보기 →" → `/events?v=2`
 *  - useNavigate 섹션 내부 사용 (CategoriesSection 과 동일, §8.5).
 *
 * 접근성:
 *  - <section aria-busy> 로딩 토글, 스켈레톤은 aria-hidden.
 *  - 에러 메시지는 role="status" aria-live="polite".
 *  - "전체 보기" 는 button (앵커 아님 — SPA 내부 nav, EventList plan 컨벤션).
 */

import { useNavigate } from 'react-router-dom';
import { EmptyState, SectionHead } from '@/components-v2';
import { FeaturedRow } from '../components/FeaturedRow';
import type { UseFeaturedEventsReturn } from '../hooks';

export interface FeaturedSectionProps {
  query: UseFeaturedEventsReturn;
}

const SKELETON_COUNT = 5;

export function FeaturedSection({ query }: FeaturedSectionProps) {
  const navigate = useNavigate();
  const previous =
    'previous' in query && query.previous ? query.previous : undefined;
  const data = query.status === 'success' ? query.data : previous;
  const isError = query.status === 'error' && !data;
  const isLoading = query.status === 'loading' && !data;
  const isEmpty = query.status === 'success' && data && data.length === 0;

  const handleSeeAll = (): void => {
    navigate('/events?v=2');
  };
  const handleRowClick = (eventId: string): void => {
    navigate(`/events/${eventId}?v=2`);
  };

  return (
    <section
      className="featured-section"
      aria-label="이번 주 주목할 이벤트"
      aria-busy={query.status === 'loading' || undefined}
    >
      <SectionHead
        title="이번 주 주목할 이벤트"
        hint="featured"
        caption="마감 임박 및 신규 오픈 순"
        action={
          <button
            type="button"
            className="featured-section__see-all"
            onClick={handleSeeAll}
          >
            전체 보기 →
          </button>
        }
      />

      {isLoading && (
        <div className="featured-section__list">
          {Array.from({ length: SKELETON_COUNT }, (_, i) => (
            <FeaturedRowSkeleton key={i} />
          ))}
        </div>
      )}

      {data && !isEmpty && (
        <div className="featured-section__list">
          {data.map((ev) => (
            <FeaturedRow
              key={ev.eventId}
              ev={ev}
              onClick={() => handleRowClick(ev.eventId)}
            />
          ))}
        </div>
      )}

      {isEmpty && (
        <EmptyState
          className="featured-section__empty"
          title="곧 새로운 이벤트가 등록될 예정입니다"
          message="현재 판매중인 이벤트가 없습니다"
          action={
            <button
              type="button"
              className="featured-section__empty-action"
              onClick={handleSeeAll}
            >
              전체 이벤트 보기 →
            </button>
          }
        />
      )}

      {isError && (
        <div
          className="featured-section__error"
          role="status"
          aria-live="polite"
        >
          <span className="featured-section__error-text">
            <span className="featured-section__error-prefix">
              // featured unavailable
            </span>{' '}
            추천 이벤트를 불러올 수 없습니다
          </span>
          <button
            type="button"
            className="featured-section__retry"
            onClick={query.refetch}
          >
            다시 시도
          </button>
        </div>
      )}
    </section>
  );
}

/**
 * 스켈레톤. FeaturedRow 와 같은 grid 구조 (`36px 56px 1fr auto`) 유지.
 * aria-hidden — 섹션 차원의 aria-busy 가 SR 에 알림.
 */
function FeaturedRowSkeleton() {
  return (
    <div className="featured-row featured-row--skeleton" aria-hidden="true">
      <div className="featured-row-skeleton__rank" />
      <div className="featured-row-skeleton__media" />
      <div className="featured-row-skeleton__main">
        <div className="featured-row-skeleton__line featured-row-skeleton__line--meta" />
        <div className="featured-row-skeleton__line featured-row-skeleton__line--title" />
        <div className="featured-row-skeleton__line featured-row-skeleton__line--sub" />
      </div>
      <div className="featured-row-skeleton__price" />
    </div>
  );
}
