import { forwardRef } from 'react';
import type { ButtonProps } from './Button.types';

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    full = false,
    loading = false,
    iconStart,
    iconEnd,
    type = 'button',
    disabled,
    className,
    children,
    ...rest
  },
  ref,
) {
  const classes = [
    'btn',
    `btn-${variant}`,
    `btn-${size}`,
    full && 'btn-full',
    loading && 'is-loading',
    className,
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={classes}
      {...rest}
    >
      {loading ? (
        <span className="btn-spinner" aria-hidden="true" />
      ) : (
        iconStart
      )}
      <span className="btn-label">{children}</span>
      {iconEnd}
    </button>
  );
});

Button.displayName = 'Button';
