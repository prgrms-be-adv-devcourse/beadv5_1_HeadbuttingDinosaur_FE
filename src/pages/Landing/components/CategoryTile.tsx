/**
 * Categories 섹션의 단일 타일.
 * PR 3 (Categories + Featured) — Landing.plan.md §12.3 / §2 / §6.3.
 *
 * 구조:
 *  - `<button>` (§9.6 — 프로토타입 `<button>` 시그니처 그대로).
 *  - 34×34 약자 아이콘 박스 (`aria-hidden="true"` — 시각 글리프 전용).
 *  - 카테고리명 + 카운트 (스크린리더는 이 두 텍스트만 읽음 — §9.6).
 *
 * 카운트 표시:
 *  - `count: number` → `N개 이벤트` (0 포함 정상 0건, §6.3).
 *  - `count: null`  → `—` (부분 실패, §12.3 머지조건 — 0 과 구분).
 *
 * accent:
 *  - `accent` 토큰 키를 인라인 CSS 변수 `--tile-accent` 로 주입.
 *  - hover/border/icon 색은 landing.css 가 `var(--tile-accent)` 로 결선.
 *  - hover translateY/색 전환은 CSS 단에서 `prefers-reduced-motion: reduce`
 *    가드 (landing.css) — 본 컴포넌트엔 애니메이션 없음.
 *
 * 클릭 핸들러는 props 로 끌어올림. 라우팅 결선은 CategoriesSection 이 담당
 * (§8.2 — `useNavigate('/events?v=2&cat=...')`).
 */

import type { CSSProperties } from 'react';
import type { AccentToken } from '../types';

export interface CategoryTileProps {
  cat: string;
  /** `null` 은 부분 실패 (해당 슬롯 fetch reject). 정상 0건은 `0`. */
  count: number | null;
  icon: string;
  accent: AccentToken;
  onClick: () => void;
  className?: string;
}

type CSSVars = CSSProperties & { ['--tile-accent']?: string };

const accentVar = (token: AccentToken): string => `var(--accent-${token})`;

const formatCount = (count: number | null): string =>
  count === null ? '—' : `${count.toLocaleString('ko-KR')}개 이벤트`;

export function CategoryTile({
  cat,
  count,
  icon,
  accent,
  onClick,
  className,
}: CategoryTileProps) {
  const style: CSSVars = { '--tile-accent': accentVar(accent) };
  return (
    <button
      type="button"
      className={`category-tile${className ? ` ${className}` : ''}`}
      style={style}
      onClick={onClick}
    >
      <span className="category-tile__icon" aria-hidden="true">
        {icon}
      </span>
      <span className="category-tile__name">{cat}</span>
      <span className="category-tile__count">{formatCount(count)}</span>
    </button>
  );
}
