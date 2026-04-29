import { forwardRef } from 'react';
import type { ReactNode } from 'react';

export interface EmptyStateProps {
  emoji?: string;
  title: string;
  message?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
  function EmptyState({ emoji, title, message, action, className }, ref) {
    const classes = ['empty-state', className].filter(Boolean).join(' ');
    return (
      <div ref={ref} className={classes}>
        {emoji && (
          <div className="empty-state-emoji" aria-hidden="true">
            {emoji}
          </div>
        )}
        <div className="empty-state-title">{title}</div>
        {message && <div className="empty-state-message">{message}</div>}
        {action && <div className="empty-state-action">{action}</div>}
      </div>
    );
  },
);

EmptyState.displayName = 'EmptyState';
