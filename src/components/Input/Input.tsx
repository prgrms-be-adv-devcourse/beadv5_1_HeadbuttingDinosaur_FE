import { forwardRef, useId } from 'react';
import type { InputProps } from './Input.types';

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    variant = 'default',
    label,
    error,
    iconStart,
    hintEnd,
    containerClassName,
    id,
    className,
    disabled,
    ...rest
  },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = error ? `${inputId}-error` : undefined;

  const containerClasses = [
    'input',
    `input-${variant}`,
    error && 'is-error',
    disabled && 'is-disabled',
    containerClassName,
  ]
    .filter(Boolean)
    .join(' ');

  const fieldClasses = ['input-field', className].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      {label && (
        <label className="input-label" htmlFor={inputId}>
          {label}
        </label>
      )}
      <div className="input-control">
        {iconStart && (
          <span className="input-icon-start" aria-hidden="true">
            {iconStart}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          className={fieldClasses}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
          {...rest}
        />
        {hintEnd && <span className="input-hint-end">{hintEnd}</span>}
      </div>
      {error && (
        <div className="input-error" id={errorId}>
          <span aria-hidden="true">×</span> {error}
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';
