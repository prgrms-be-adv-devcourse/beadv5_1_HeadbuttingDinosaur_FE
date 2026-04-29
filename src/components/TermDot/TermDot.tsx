import { forwardRef } from 'react';
import type { CSSProperties } from 'react';

export type DotTone = 'term-green' | 'brand' | 'danger';

export interface TermDotProps {
  size?: number;
  tone?: DotTone;
  className?: string;
}

export const TermDot = forwardRef<HTMLSpanElement, TermDotProps>(
  function TermDot({ size = 6, tone = 'term-green', className }, ref) {
    const classes = ['term-dot', `term-dot-${tone}`, className]
      .filter(Boolean)
      .join(' ');
    const style: CSSProperties = { width: size, height: size };
    return (
      <span
        ref={ref}
        className={classes}
        style={style}
        aria-hidden="true"
      />
    );
  },
);

TermDot.displayName = 'TermDot';
