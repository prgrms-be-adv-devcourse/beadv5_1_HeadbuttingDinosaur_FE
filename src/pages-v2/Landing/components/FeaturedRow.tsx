/**
 * Featured 섹션의 단일 행.
 * PR 3 (Categories + Featured) — Landing.plan.md §12.3 / §2 / §9.6.
 *
 * 구조 (grid `36px 56px 1fr auto`):
 *  - 1: 순번 (`vm.rank` → "01"~"05" mono).
 *  - 2: 56-col 안의 48×48 그라디언트 박스 (`</>` 글리프, `aria-hidden`).
 *  - 3: 카테고리 eyebrow + StatusChip + 제목 + 날짜·스택.
 *  - 4: 가격 (무료/원 처리).
 *
 * §9.6 — 프로토타입의 `<div onClick>` 회피, **`<button type="button">`** 사용.
 * 키보드 Enter/Space 자동 활성, 포커스 링 자동.
 *
 * accent:
 *  - `accent` 토큰을 `--row-accent: var(--accent-{token})` 인라인 변수로 주입.
 *  - 그라디언트/hover 색은 landing.css 가 `var(--row-accent)` + `color-mix`
 *    로 결선 (CategoryTile 와 동일 패턴).
 *  - hover transform/색 전환은 CSS `prefers-reduced-motion: reduce` 가드.
 *
 * 상태 칩 매핑 (프로토타입 L139–L141):
 *  - `SOLD_OUT` → "매진" (sold)
 *  - `ON_SALE` + 1~9 잔여 → "{N}석" (sold — 시각적 강조)
 *  - 그 외 `ON_SALE` → "판매중" (ok)
 */

import type { CSSProperties } from 'react';
import { StatusChip } from '@/components-v2';
import type { AccentToken, FeaturedItemVM } from '../types';

export interface FeaturedRowProps {
  ev: FeaturedItemVM;
  onClick: () => void;
  className?: string;
}

type CSSVars = CSSProperties & { ['--row-accent']?: string };

const accentVar = (token: AccentToken): string => `var(--accent-${token})`;

const formatPrice = (price: number, isFree: boolean): string =>
  isFree ? '무료' : `${price.toLocaleString('ko-KR')}원`;

interface ChipState {
  variant: 'ok' | 'sold';
  text: string;
}

const chipFor = (ev: FeaturedItemVM): ChipState => {
  if (ev.status === 'SOLD_OUT') return { variant: 'sold', text: '매진' };
  if (ev.remainingQuantity > 0 && ev.remainingQuantity < 10) {
    return { variant: 'sold', text: `${ev.remainingQuantity}석` };
  }
  return { variant: 'ok', text: '판매중' };
};

export function FeaturedRow({ ev, onClick, className }: FeaturedRowProps) {
  const style: CSSVars = { '--row-accent': accentVar(ev.accent) };
  const chip = chipFor(ev);
  const techText = ev.techStacks.slice(0, 3).join(' · ');
  const isFree = ev.isFree || ev.price === 0;

  return (
    <button
      type="button"
      className={`featured-row${className ? ` ${className}` : ''}`}
      style={style}
      onClick={onClick}
    >
      <span className="featured-row__rank">
        {String(ev.rank).padStart(2, '0')}
      </span>
      <span className="featured-row__media" aria-hidden="true">
        <span className="featured-row__media-glyph">&lt;/&gt;</span>
      </span>
      <span className="featured-row__main">
        <span className="featured-row__meta-row">
          <span className="featured-row__category">{`#${ev.category}`}</span>
          <StatusChip variant={chip.variant}>{chip.text}</StatusChip>
        </span>
        <span className="featured-row__title">{ev.title}</span>
        <span className="featured-row__meta">
          {ev.dateLabel}
          {techText && (
            <>
              {' · '}
              {techText}
            </>
          )}
        </span>
      </span>
      <span
        className={`featured-row__price${isFree ? ' featured-row__price--free' : ''}`}
      >
        {formatPrice(ev.price, isFree)}
      </span>
    </button>
  );
}
