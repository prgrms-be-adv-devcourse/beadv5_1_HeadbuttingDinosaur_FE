import { forwardRef } from 'react';
import type { CSSProperties } from 'react';

export type AvatarSize = 'sm' | 'md' | 'lg' | number;

export interface AvatarProps {
  initial: string;
  size?: AvatarSize;
  className?: string;
}

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(function Avatar(
  { initial, size = 'md', className },
  ref,
) {
  const sizeIsToken = typeof size === 'string';
  const classes = ['avatar', sizeIsToken && `avatar-${size}`, className]
    .filter(Boolean)
    .join(' ');

  /* Raw px size: derive font-size and radius proportionally so the
   * three token sizes (36/8, 52/10, 72/14) extend smoothly to any
   * value the caller picks. */
  const style: CSSProperties | undefined = sizeIsToken
    ? undefined
    : {
        width: size,
        height: size,
        fontSize: Math.round(size * 0.4),
        borderRadius: Math.round(size * 0.2),
      };

  return (
    <div ref={ref} className={classes} style={style}>
      {initial.toUpperCase()}
    </div>
  );
});

Avatar.displayName = 'Avatar';
