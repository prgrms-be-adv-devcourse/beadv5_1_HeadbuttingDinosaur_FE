import { SectionHead } from '@/components/SectionHead';

import type { RecommendedCardVM } from '@/pages/_shared/recommendation';
import { RecommendedCard } from './RecommendedCard';

export interface RecommendedSectionProps {
  cards: RecommendedCardVM[];
}

export function RecommendedSection({ cards }: RecommendedSectionProps) {
  return (
    <section className="ed-rec-section" aria-label="추천 이벤트">
      <SectionHead hint="recommended" title="당신에게 맞는 이벤트" />
      <div className="ed-rec-grid">
        {cards.map((vm) => (
          <RecommendedCard key={vm.eventId} vm={vm} />
        ))}
      </div>
    </section>
  );
}

RecommendedSection.displayName = 'RecommendedSection';
