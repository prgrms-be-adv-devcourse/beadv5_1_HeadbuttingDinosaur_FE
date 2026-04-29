import { forwardRef } from 'react';
import type { ReactNode } from 'react';

export interface MetaLineProps {
  label: string;
  icon?: ReactNode;
  children: ReactNode;
  compact?: boolean;
  truncate?: boolean;
  className?: string;
}

export const MetaLine = forwardRef<HTMLDivElement, MetaLineProps>(
  function MetaLine(
    { label, icon, children, compact = true, truncate = true, className },
    ref,
  ) {
    const classes = [
      'meta-line',
      compact ? 'meta-line-compact' : 'meta-line-full',
      truncate && 'is-truncate',
      className,
    ]
      .filter(Boolean)
      .join(' ');
    return (
      <div ref={ref} className={classes}>
        {!compact && icon && (
          <span className="meta-line-icon" aria-hidden="true">
            {icon}
          </span>
        )}
        <span className="meta-line-label">{label}</span>
        <span className="meta-line-value">{children}</span>
      </div>
    );
  },
);

MetaLine.displayName = 'MetaLine';
