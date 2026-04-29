import type { HTMLAttributes, ReactNode } from 'react';

export type CardVariant = 'solid' | 'dashed';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg' | number;

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: CardPadding;
  interactive?: boolean;
  children: ReactNode;
}
