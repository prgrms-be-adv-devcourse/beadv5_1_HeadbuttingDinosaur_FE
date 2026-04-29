import { forwardRef } from 'react';
import type { ReactNode } from 'react';

export type StatusVariant = 'ok' | 'sold' | 'free' | 'end';

export interface StatusChipProps {
  variant: StatusVariant;
  children: ReactNode;
  dot?: boolean;
  className?: string;
}

export const StatusChip = forwardRef<HTMLSpanElement, StatusChipProps>(
  function StatusChip({ variant, children, dot = true, className }, ref) {
    const classes = ['status-chip', `status-chip-${variant}`, className]
      .filter(Boolean)
      .join(' ');
    return (
      <span ref={ref} className={classes}>
        {dot && <span className="status-chip-dot" aria-hidden="true" />}
        {children}
      </span>
    );
  },
);

StatusChip.displayName = 'StatusChip';
