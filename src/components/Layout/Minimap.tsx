import type { RouteKey } from './types';

/**
 * Source: docs/archive/v2-cutover/layout.plan.md §3-11.
 *
 * Decorative right-rail "minimap" that mimics IDE syntax patterns. No
 * interaction; `aria-hidden` per §6-6.
 *
 * Patterns are fixed strings of class tokens (kw/fn/str/cmt or '' for plain)
 * cycled to fill 80 lines. Per-line width varies via inline style — class
 * variants would require dozens of width buckets, so a single style attribute
 * for dynamic geometry is the pragmatic choice (matches prototype semantics).
 */
export interface MinimapProps {
  route: RouteKey;
  className?: string;
}

const PATTERNS: Record<RouteKey, string[]> = {
  home:   ['kw', '', 'fn', '', 'str', '', 'cmt', '', 'kw', 'fn', '', 'str', '', '', 'kw', '', 'fn', 'str', '', '', 'cmt'],
  events: ['kw', '', 'kw', 'fn', '', 'str', 'cmt', '', 'kw', '', '', 'fn', '', '', 'str', '', 'cmt', '', '', 'kw', 'fn', '', '', '', 'str'],
  detail: ['kw', '', 'fn', '', '', 'str', '', '', 'kw', '', '', 'fn', 'str', '', '', 'str', '', '', 'kw', '', 'fn', '', '', '', '', 'cmt'],
  cart:   ['kw', '', '', 'fn', '', 'str', '', 'kw', '', '', 'fn', '', '', 'str', '', 'cmt', '', 'kw', '', 'fn', '', '', '', '', '', ''],
  mypage: ['kw', 'fn', '', '', 'str', '', '', 'kw', '', '', 'fn', '', 'str', '', '', 'cmt', '', 'kw', 'fn', '', 'str', ''],
  login:  ['kw', '', '', 'fn', '', 'str', '', '', 'cmt', '', 'kw', 'fn', '', '', 'str', '', '', ''],
  seller: ['kw', '', 'fn', '', 'str', '', 'kw', '', 'fn', '', '', 'cmt', '', 'kw', 'fn', '', 'str', '', '', '', 'cmt'],
  admin:  ['kw', 'fn', '', 'str', '', '', 'kw', '', '', 'fn', 'str', '', 'cmt', '', 'kw', '', '', 'fn', 'str', '', ''],
};

const LINE_COUNT = 80;

export function Minimap({ route, className }: MinimapProps) {
  const base = PATTERNS[route];
  const containerClass = className ? `ide-minimap ${className}` : 'ide-minimap';

  return (
    <div className={containerClass} aria-hidden="true">
      {Array.from({ length: LINE_COUNT }, (_, i) => {
        const tone = base[i % base.length];
        const width = 70 + ((i * 37) % 30);
        const cls = tone ? `mini-line ${tone}` : 'mini-line';
        return <div key={i} className={cls} style={{ width: `${width}%` }} />;
      })}
      <div className="mini-window" />
    </div>
  );
}
