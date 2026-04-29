import { AccentMediaBox, Icon } from '@/components';

interface TicketStripeProps {
  accent: string;
}

export function TicketStripe({ accent }: TicketStripeProps) {
  return (
    <div className="ticket-stripe">
      <AccentMediaBox accent={accent} variant="stripe" size="sm" glyph="" />
      <span
        className="ticket-stripe-icon"
        style={{ color: accent }}
        aria-hidden="true"
      >
        <Icon name="ticket" size={20} />
      </span>
    </div>
  );
}
