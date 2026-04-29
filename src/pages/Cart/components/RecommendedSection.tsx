/**
 * Cart 페이지 하단 추천 이벤트 섹션.
 *
 * Cart.plan.md § 10.3 PR 4. EventDetail 의 같은 이름 섹션과 달리 본
 * 섹션은 카트와 결합:
 *  - `cartEventIds` 로 "이미 담긴 항목" 표시 (`RecommendedCard.inCart`)
 *  - `pendingEventIds` 로 inflight 가드
 *  - `onAdd(eventId)` 로 `addCartItem` 호출 → 즉시 카트 리스트 반영 (PR 2 useCart 의 refetch 또는 mutate 가 책임)
 *
 * 페치 실패는 메인 카트 동작을 침해하지 않도록 (§ 10.3.6 PR 4 시나리오) 섹션
 * 자체를 숨김 처리 — `query.status === 'hidden'` → `null`.
 */

import { SectionHead } from '@/components/SectionHead';
import type { RecommendedCardVM } from '@/pages/_shared/recommendation';

import { RecommendedCard } from './RecommendedCard';

export type RecommendedQuery =
  | { status: 'loading' }
  | { status: 'ready'; cards: RecommendedCardVM[] }
  | { status: 'hidden' };

export interface RecommendedSectionProps {
  query: RecommendedQuery;
  /** 이미 카트에 담긴 eventId 집합 — 카드별 `inCart` 판정용. */
  cartEventIds: Set<string>;
  /** addCartItem inflight eventId 집합 — 카드 단위 가드. */
  pendingEventIds?: Set<string>;
  onAdd: (eventId: string) => void;
}

export function RecommendedSection({
  query,
  cartEventIds,
  pendingEventIds,
  onAdd,
}: RecommendedSectionProps) {
  if (query.status === 'hidden') return null;

  return (
    <section className="cart-rec-section" aria-label="추천 이벤트">
      <SectionHead hint="recommended" title="이런 이벤트는 어떠세요?" />
      {query.status === 'loading' ? (
        <RecommendedSkeleton />
      ) : (
        <div className="cart-rec-grid">
          {query.cards.map((vm) => (
            <RecommendedCard
              key={vm.eventId}
              vm={vm}
              inCart={cartEventIds.has(vm.eventId)}
              pending={pendingEventIds?.has(vm.eventId)}
              onAdd={onAdd}
            />
          ))}
        </div>
      )}
    </section>
  );
}

RecommendedSection.displayName = 'RecommendedSection';

/**
 * 5칸 placeholder. 실 카드와 동일한 그리드 슬롯을 차지해 페치 후 layout
 * shift 가 없도록 한다.
 */
function RecommendedSkeleton() {
  return (
    <div className="cart-rec-grid" aria-hidden="true">
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="cart-rec-card cart-rec-card--skeleton" />
      ))}
    </div>
  );
}
