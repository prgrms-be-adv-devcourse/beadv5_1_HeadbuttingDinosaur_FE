import { forwardRef } from 'react';
import type { CSSProperties } from 'react';
import type { CardProps } from './Card.types';

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  {
    variant = 'solid',
    padding = 'md',
    interactive = false,
    className,
    style,
    children,
    ...rest
  },
  ref,
) {
  const paddingIsToken = typeof padding === 'string';
  const classes = [
    'card',
    `card-${variant}`,
    interactive && 'is-interactive',
    paddingIsToken && `card-pad-${padding}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  /* Raw px padding lives in inline style so callers can pass any value
   * without us inventing a one-off class. Caller-provided style.padding
   * still wins (spread after). */
  const mergedStyle: CSSProperties | undefined = paddingIsToken
    ? style
    : { padding: `${padding}px`, ...style };

  return (
    <div ref={ref} className={classes} style={mergedStyle} {...rest}>
      {children}
    </div>
  );
});

Card.displayName = 'Card';
