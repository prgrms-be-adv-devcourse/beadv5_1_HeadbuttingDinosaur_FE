/**
 * Stats 섹션의 단일 카드.
 * PR 2 (Hero + Stats) — Landing.plan.md §12.2 / §6.2.
 *
 * - 정상: hint(mono) + num+unit + label 3줄.
 * - 스켈레톤: StatSkeleton 별도 export. 구조 동일, 텍스트 자리는 --surface-3 블록.
 *   카드 높이가 정상 카드와 동일해야 CLS 0 (높이 고정은 landing.css 에서).
 * - 클릭 인터랙션 / 키보드 포커스 없음 (§D, §6.2).
 *
 * 마크업/스타일 클래스만 노출하고 애니메이션은 없음 — prefers-reduced-motion
 * 분기는 본 컴포넌트 차원에서 불필요.
 */

export interface StatProps {
  hint: string;
  num: string | number;
  unit: string;
  label: string;
}

const formatNum = (n: string | number): string =>
  typeof n === 'number' ? n.toLocaleString('ko-KR') : n;

export function Stat({ hint, num, unit, label }: StatProps) {
  return (
    <div className="stat-card">
      <div className="stat-card__hint">{hint}</div>
      <div className="stat-card__num-row">
        <span className="stat-card__num">{formatNum(num)}</span>
        {unit && <span className="stat-card__unit">{unit}</span>}
      </div>
      <div className="stat-card__label">{label}</div>
    </div>
  );
}

/**
 * 스켈레톤 변형. SR 노이즈 방지 위해 aria-hidden.
 * 부모 (StatsSection) 가 aria-busy 로 로딩 상태를 알린다.
 */
export function StatSkeleton() {
  return (
    <div className="stat-card stat-card--skeleton" aria-hidden="true">
      <div className="stat-skeleton__hint" />
      <div className="stat-skeleton__num" />
      <div className="stat-skeleton__label" />
    </div>
  );
}
