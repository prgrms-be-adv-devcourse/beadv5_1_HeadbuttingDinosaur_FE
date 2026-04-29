export interface PriceSummaryProps {
  total: number;
  hidden?: boolean;
}

export function PriceSummary({ total, hidden = false }: PriceSummaryProps) {
  if (hidden || total <= 0) return null;
  return (
    <div className="ed-price-summary">
      <span className="ed-price-summary__label">합계</span>
      <span className="ed-price-summary__value">
        {total.toLocaleString()}원
      </span>
    </div>
  );
}

PriceSummary.displayName = 'PriceSummary';
