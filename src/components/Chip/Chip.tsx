import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

export interface ChipProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  active?: boolean;
  count?: number;
  children: ReactNode;
}

export const Chip = forwardRef<HTMLButtonElement, ChipProps>(function Chip(
  { active = false, count, type = 'button', className, children, ...rest },
  ref,
) {
  const classes = ['chip', active && 'is-active', className]
    .filter(Boolean)
    .join(' ');
  return (
    <button ref={ref} type={type} className={classes} {...rest}>
      {children}
      {count !== undefined && <span className="chip-count">{count}</span>}
    </button>
  );
});

Chip.displayName = 'Chip';
