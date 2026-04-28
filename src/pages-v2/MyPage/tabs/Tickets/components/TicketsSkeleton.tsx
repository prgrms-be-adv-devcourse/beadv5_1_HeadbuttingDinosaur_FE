import { Card } from '@/components-v2';

interface TicketsSkeletonProps {
  count?: number;
}

export function TicketsSkeleton({ count = 6 }: TicketsSkeletonProps) {
  return (
    <div className="ticket-grid" aria-busy="true" aria-live="polite">
      {Array.from({ length: count }).map((_, i) => (
        <Card
          key={i}
          variant="solid"
          padding="none"
          className="ticket-card tickets-skeleton-card"
          aria-hidden="true"
        >
          <div className="tickets-skeleton-stripe" />
          <div className="tickets-skeleton-body">
            <div className="tickets-skeleton-bar tickets-skeleton-bar-sm" />
            <div className="tickets-skeleton-bar tickets-skeleton-bar-lg" />
            <div className="tickets-skeleton-bar tickets-skeleton-bar-md" />
          </div>
        </Card>
      ))}
    </div>
  );
}
