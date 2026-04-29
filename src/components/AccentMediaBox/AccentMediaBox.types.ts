import type { ReactNode } from 'react';

export type AccentMediaVariant = 'box' | 'stripe';
export type AccentMediaSize = 'xs' | 'sm' | 'md' | 'lg' | 'hero';

export interface AccentMediaBoxProps {
  accent: string;
  variant?: AccentMediaVariant;
  size?: AccentMediaSize;
  glyph?: ReactNode;
  className?: string;
}
