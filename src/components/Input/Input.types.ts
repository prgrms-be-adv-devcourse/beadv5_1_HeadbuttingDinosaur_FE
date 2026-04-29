import type { InputHTMLAttributes, ReactNode } from 'react';

export type InputVariant = 'default' | 'code';

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: InputVariant;
  label?: string;
  error?: string;
  iconStart?: ReactNode;
  hintEnd?: ReactNode;
  containerClassName?: string;
}
