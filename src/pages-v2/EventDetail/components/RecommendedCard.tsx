import { Link } from 'react-router-dom';

import type { RecommendedCardVM } from '@/pages-v2/_shared/recommendation';

export interface RecommendedCardProps {
  vm: RecommendedCardVM;
}

export function RecommendedCard({ vm }: RecommendedCardProps) {
  return (
    <Link to={`/events/${vm.eventId}`} className="ed-rec-card">
      <span className="ed-rec-card__category">{vm.category}</span>
      <h3 className="ed-rec-card__title">{vm.title}</h3>
      <div className="ed-rec-card__meta">
        <span className="ed-rec-card__date">{vm.dateLabel}</span>
        <span
          className={`ed-rec-card__price${vm.isFree ? ' is-free' : ''}`}
        >
          {vm.isFree ? '무료' : `${vm.price.toLocaleString()}원`}
        </span>
      </div>
    </Link>
  );
}

RecommendedCard.displayName = 'RecommendedCard';
