import { useState } from 'react';
import { AccentMediaBox } from '@/components/AccentMediaBox';

export interface HeroBannerProps {
  accent: string;
  thumbnailUrl?: string;
  title?: string;
}

export function HeroBanner({ accent, thumbnailUrl, title }: HeroBannerProps) {
  const [errored, setErrored] = useState(false);

  if (thumbnailUrl && !errored) {
    return (
      <div className="ed-hero ed-hero--image">
        <img
          src={thumbnailUrl}
          alt={title ?? ''}
          className="ed-hero__img"
          onError={() => setErrored(true)}
        />
      </div>
    );
  }

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
