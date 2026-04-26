import { forwardRef } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';

export interface KbdProps extends HTMLAttributes<HTMLElement> {
  inverse?: boolean;
  children: ReactNode;
}

export const Kbd = forwardRef<HTMLElement, KbdProps>(function Kbd(
  { inverse = false, className, children, ...rest },
  ref,
) {
  const classes = ['kbd', inverse && 'kbd-inverse', className]
    .filter(Boolean)
    .join(' ');
  return (
    <kbd ref={ref} className={classes} {...rest}>
      {children}
    </kbd>
  );
});

Kbd.displayName = 'Kbd';
