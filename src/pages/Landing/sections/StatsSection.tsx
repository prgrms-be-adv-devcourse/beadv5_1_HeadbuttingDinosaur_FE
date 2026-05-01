/**
 * Stats 섹션 — 4 카드 grid + 상태 분기.
 * PR 2 (Hero + Stats) — Landing.plan.md §12.2 / §6.2.
 *
 * - 로딩 (previous 없음): 4 × StatSkeleton.
 * - 로딩 (previous 보유): 이전 숫자 그대로 노출 (refetch 깜빡임 방지).
 * - 성공: 4 × Stat.
 * - 에러 (previous 없음): 인라인 메시지 + 다시 시도 버튼 (§6.2).
 * - 에러 (previous 보유): 이전 숫자 + 우상단 stale 인디케이터는 v1 생략 (선택사항).
 *
 * 접근성:
 * - 로딩 중에는 section 에 aria-busy="true". StatSkeleton 은 aria-hidden.
 * - 에러 메시지는 aria-live="polite" 로 SR 에 1회 알림.
 * - Stats 카드는 클릭 동선 없음 → 키보드 포커스 대상 아님 (§D).
 */

import { Stat, StatSkeleton } from '../components/Stat';
import type { UseLandingStatsReturn } from '../hooks';

export interface StatsSectionProps {
  query: UseLandingStatsReturn;
}

export function StatsSection({ query }: StatsSectionProps) {
  const previous =
    'previous' in query && query.previous ? query.previous : undefined;
  const data = query.status === 'success' ? query.data : previous;
  const isError = query.status === 'error' && !data;
  const isLoading = query.status === 'loading' && !data;

  return (
    <section
      className="stats-section"
      aria-label="이벤트 통계"
      aria-busy={query.status === 'loading' || undefined}
    >
      {isLoading && (
        <div className="stats-section__grid">
          {Array.from({ length: 2 }, (_, i) => (
            <StatSkeleton key={i} />
          ))}
        </div>
      )}

      {data && (
        <div className="stats-section__grid">
          {data.map((s, i) => (
            <Stat
              key={i}
              hint={s.hint}
              num={s.num}
              unit={s.unit}
              label={s.label}
            />
          ))}
        </div>
      )}

      {isError && (
        <div className="stats-section__error" role="status" aria-live="polite">
          <span className="stats-section__error-text">
            <span className="stats-section__error-prefix">
              // stats unavailable
            </span>{' '}
            통계를 불러올 수 없습니다
          </span>
          <button
            type="button"
            className="stats-section__retry"
            onClick={query.refetch}
          >
            다시 시도
          </button>
        </div>
      )}
    </section>
  );
}
