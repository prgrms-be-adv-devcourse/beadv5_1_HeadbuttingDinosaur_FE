/**
 * Categories 섹션 — 6 타일 그리드 + 상태 분기.
 * PR 3 (Categories + Featured) — Landing.plan.md §12.3 / §6.3 / §8.
 *
 * 상태 매트릭스 (§6.3):
 *  - 로딩 (previous 없음): 6 × CategoryTileSkeleton.
 *  - 로딩 (previous 보유): 이전 6 타일 그대로 노출 (refetch 깜빡임 방지).
 *  - 정상: 6 × CategoryTile.
 *  - 부분 에러: 타일 단계의 `count: null` → '—' (CategoryTile 내부 처리).
 *  - 전체 에러 (success 없음 & previous 없음): 인라인 에러 박스 + 다시 시도.
 *
 * 라우팅 (§8.2 / §8.5):
 *  - useNavigate 를 섹션 내부에서 사용. props 끌어올리지 않음 (불필요한 추상화 회피).
 *  - URL: `/events?v=2&cat={한국어카테고리명}` (encodeURIComponent).
 *
 * 접근성:
 *  - <section aria-busy> 로 로딩 상태 노출, 스켈레톤은 aria-hidden.
 *  - 에러 메시지는 role="status" aria-live="polite" 로 1회 알림.
 *  - 로딩 중 타일 클릭 핸들러는 미결선 (스켈레톤만 렌더).
 *  - hover 모션은 landing.css 의 @media (prefers-reduced-motion: reduce) 가드.
 */

import { useNavigate } from 'react-router-dom';
import { SectionHead } from '@/components';
import { CategoryTile } from '../components/CategoryTile';
import type { UseLandingCategoriesReturn } from '../hooks';

export interface CategoriesSectionProps {
  query: UseLandingCategoriesReturn;
}

export function CategoriesSection({ query }: CategoriesSectionProps) {
  const navigate = useNavigate();
  const previous =
    'previous' in query && query.previous ? query.previous : undefined;
  const data = query.status === 'success' ? query.data : previous;
  const isError = query.status === 'error' && !data;
  const isLoading = query.status === 'loading' && !data;

  const handleSelect = (cat: string): void => {
    navigate(`/events?v=2&cat=${encodeURIComponent(cat)}`);
  };

  return (
    <section
      className="categories-section"
      aria-label="카테고리별 이벤트"
      aria-busy={query.status === 'loading' || undefined}
    >
      <SectionHead
        title="카테고리별 이벤트"
        hint="category"
        caption="관심 있는 포맷을 선택해보세요"
      />

      {isLoading && (
        <div className="categories-section__grid">
          {Array.from({ length: 5 }, (_, i) => (
            <CategoryTileSkeleton key={i} />
          ))}
        </div>
      )}

      {data && (
        <div className="categories-section__grid">
          {data.map((c) => (
            <CategoryTile
              key={c.cat}
              cat={c.cat}
              count={c.count}
              icon={c.icon}
              accent={c.accent}
              onClick={() => handleSelect(c.cat)}
            />
          ))}
        </div>
      )}

      {isError && (
        <div
          className="categories-section__error"
          role="status"
          aria-live="polite"
        >
          <span className="categories-section__error-text">
            <span className="categories-section__error-prefix">
              // categories unavailable
            </span>{' '}
            카테고리를 불러올 수 없습니다
          </span>
          <button
            type="button"
            className="categories-section__retry"
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
 * 스켈레톤. CategoryTile 과 같은 외곽 박스 / 그리드 정렬을 유지하기 위해
 * 동일 구조 + aria-hidden. 색은 landing.css 의 --surface-3.
 */
function CategoryTileSkeleton() {
  return (
    <div className="category-tile category-tile--skeleton" aria-hidden="true">
      <div className="category-tile-skeleton__icon" />
      <div className="category-tile-skeleton__name" />
      <div className="category-tile-skeleton__count" />
    </div>
  );
}
