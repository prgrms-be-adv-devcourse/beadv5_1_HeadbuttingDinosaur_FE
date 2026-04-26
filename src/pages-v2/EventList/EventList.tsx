export type EventListProps = Record<string, never>;

export default function EventList(_props: EventListProps) {
  return (
    <div className="editor-scroll">
      <div className="gutter" aria-hidden="true">
        {Array.from({ length: 60 }, (_, i) => (
          <span key={i} className={`ln${i === 0 ? ' active' : ''}`}>
            {i + 1}
          </span>
        ))}
      </div>
      <div className="editor-body">
        <div>EventList v2 — WIP</div>
      </div>
    </div>
  );
}
