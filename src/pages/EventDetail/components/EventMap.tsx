import { Card } from '@/components/Card';

export interface EventMapProps {
  location: string;
}

export function EventMap({ location }: EventMapProps) {
  if (!location.trim()) return null;

  const src = `https://maps.google.com/maps?q=${encodeURIComponent(location)}&z=15&output=embed`;

  return (
    <section className="ed-map">
      <h2 className="ed-map__title">위치</h2>
      <Card variant="solid" padding="none" className="ed-map__card">
        <iframe
          title={`이벤트 위치 지도: ${location}`}
          src={src}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="ed-map__frame"
        />
      </Card>
    </section>
  );
}
