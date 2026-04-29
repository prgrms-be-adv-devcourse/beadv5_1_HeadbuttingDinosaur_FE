export interface EventDescriptionProps {
  description: string;
}

export function EventDescription({ description }: EventDescriptionProps) {
  return (
    <section className="ed-description">
      <h2 className="ed-description__title">이벤트 소개</h2>
      <p className="ed-description__body">{description}</p>
    </section>
  );
}

EventDescription.displayName = 'EventDescription';
