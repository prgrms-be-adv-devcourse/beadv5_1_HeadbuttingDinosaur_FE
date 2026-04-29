/**
 * Cart 페이지의 추천 이벤트 leaf 카드.
 *
 * Cart.plan.md § 10.3 PR 4. EventDetail 의 같은 이름 컴포넌트는 카드 전체가
 * 상세 페이지 Link 였지만, Cart 의 핵심 UX 는 "빠르게 담기" 이므로 다음
 * 두 영역으로 분리한다:
 *   1) 상단 메타 영역 — `<Link>` 로 상세 페이지 이동
 *   2) 하단 액션 — `<Button>` 으로 `addCartItem` 호출 (이미 담긴 경우 비활성)
 *
 * 이미 카트에 담긴 항목은 버튼 라벨을 "담긴 이벤트" 로 바꾸고 비활성.
 * inflight 중에는 `pending` 으로 가드해 중복 클릭 차단 (PR 2 useCartMutations
 * 와 동일한 패턴).
 */

import { Link } from 'react-router-dom';

import { Button } from '@/components/Button';
import type { RecommendedCardVM } from '@/pages/_shared/recommendation';

export interface RecommendedCardProps {
  vm: RecommendedCardVM;
  /** 이미 카트에 담긴 이벤트면 액션 버튼을 비활성. */
  inCart: boolean;
  /** addCartItem inflight — 중복 클릭 차단. */
  pending?: boolean;
  onAdd: (eventId: string) => void;
}

export function RecommendedCard({ vm, inCart, pending, onAdd }: RecommendedCardProps) {
  const disabled = inCart || pending;
  const label = inCart ? '담긴 이벤트' : '빠르게 담기';

  return (
    <article className="cart-rec-card">
      <Link to={`/events/${vm.eventId}`} className="cart-rec-card__link">
        <span className="cart-rec-card__category">{vm.category}</span>
        <h3 className="cart-rec-card__title">{vm.title}</h3>
        <div className="cart-rec-card__meta">
          <span className="cart-rec-card__date">{vm.dateLabel}</span>
          <span
            className={`cart-rec-card__price${vm.isFree ? ' is-free' : ''}`}
          >
            {vm.isFree ? '무료' : `${vm.price.toLocaleString()}원`}
          </span>
        </div>
      </Link>
      <Button
        variant={inCart ? 'ghost' : 'primary'}
        size="sm"
        full
        loading={pending}
        disabled={disabled}
        onClick={() => onAdd(vm.eventId)}
      >
        {label}
      </Button>
    </article>
  );
}

RecommendedCard.displayName = 'RecommendedCard';
