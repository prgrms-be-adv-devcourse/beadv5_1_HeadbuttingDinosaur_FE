import { forwardRef } from 'react';
import type { ReactNode } from 'react';

export type EyebrowTone = 'term-green' | 'brand';
export type EyebrowSize = 'sm' | 'md';

export interface EyebrowProps {
  children: ReactNode;
  tone?: EyebrowTone;
  size?: EyebrowSize;
  dot?: boolean;
  className?: string;
}

export const Eyebrow = forwardRef<HTMLDivElement, EyebrowProps>(function Eyebrow(
  { children, tone = 'term-green', size = 'md', dot = true, className },
  ref,
) {
  const classes = [
    'eyebrow',
    `eyebrow-${size}`,
    `eyebrow-${tone}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <div ref={ref} className={classes}>
      {/* Inline dot span — PR 4 swaps in <TermDot tone={tone} size={...}>. */}
      {dot && <span className="eyebrow-dot" aria-hidden="true" />}
      {children}
    </div>
  );
});

Eyebrow.displayName = 'Eyebrow';
