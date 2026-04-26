import { AccentMediaBox } from '@/components-v2/AccentMediaBox';

export interface HeroBannerProps {
  accent: string;
}

export function HeroBanner({ accent }: HeroBannerProps) {
  return (
    <AccentMediaBox
      accent={accent}
      variant="box"
      size="hero"
      glyph="❯_"
      className="ed-hero"
    />
  );
}

HeroBanner.displayName = 'HeroBanner';
