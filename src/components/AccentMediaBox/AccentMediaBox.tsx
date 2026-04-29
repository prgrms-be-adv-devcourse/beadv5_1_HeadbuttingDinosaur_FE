import { forwardRef } from 'react';
import type { CSSProperties } from 'react';
import type {
  AccentMediaBoxProps,
  AccentMediaSize,
} from './AccentMediaBox.types';

/* Hex alpha pairs per size — extracted from prototype usages
 * (Cart 18/38, Landing 20/45, EventDetail hero 15/35, MyPage stripe
 * 22/44). lg pair is interpolated since prototype has no lg use. */
interface AlphaPair {
  start: string;
  end: string;
}

const ALPHA: Record<AccentMediaSize, AlphaPair> = {
  xs: { start: '20', end: '45' },
  sm: { start: '22', end: '44' },
  md: { start: '18', end: '38' },
  lg: { start: '16', end: '36' },
  hero: { start: '15', end: '35' },
};

const DEFAULT_GLYPH = '</>';

export const AccentMediaBox = forwardRef<HTMLDivElement, AccentMediaBoxProps>(
  function AccentMediaBox(
    { accent, variant = 'box', size = 'md', glyph, className },
    ref,
  ) {
    const a = ALPHA[size];
    const direction = variant === 'stripe' ? '180deg' : '135deg';
    const style: CSSProperties = {
      background: `linear-gradient(${direction}, ${accent}${a.start}, ${accent}${a.end})`,
      color: accent,
    };
    const classes = [
      'accent-media',
      `accent-media-${variant}`,
      `accent-media-${size}`,
      className,
    ]
      .filter(Boolean)
      .join(' ');
    return (
      <div ref={ref} className={classes} style={style} aria-hidden="true">
        <span className="accent-media-glyph">{glyph ?? DEFAULT_GLYPH}</span>
      </div>
    );
  },
);

AccentMediaBox.displayName = 'AccentMediaBox';
