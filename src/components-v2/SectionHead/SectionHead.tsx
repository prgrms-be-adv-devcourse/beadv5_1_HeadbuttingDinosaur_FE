import { forwardRef } from 'react';
import type { ReactNode } from 'react';

export interface SectionHeadProps {
  title: string;
  hint?: string;
  caption?: string;
  action?: ReactNode;
  className?: string;
}

export const SectionHead = forwardRef<HTMLDivElement, SectionHeadProps>(
  function SectionHead({ title, hint, caption, action, className }, ref) {
    const classes = ['section-head', className].filter(Boolean).join(' ');
    return (
      <div ref={ref} className={classes}>
        <div className="section-head-text">
          {hint && (
            <div className="section-head-hint">{`// ${hint}`}</div>
          )}
          <h2 className="section-head-title">{title}</h2>
          {caption && (
            <p className="section-head-caption">{caption}</p>
          )}
        </div>
        {action && <div className="section-head-action">{action}</div>}
      </div>
    );
  },
);

SectionHead.displayName = 'SectionHead';
