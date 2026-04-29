/**
 * 장바구니 한 줄.
 *
 * 좌측 72×72 accent 박스 / 가운데 제목 + 수량 컨트롤 + 삭제 / 우측 합계.
 * 프로토타입 Cart.jsx:34-56 의 인라인 스타일을 BEM + 공용 컴포넌트로 분해.
 *
 * `pending`은 본 PR(R1) 한정으로 수량 mutation / 삭제 mutation 양쪽을 단일
 * 플래그로 묶음 — § 5에서 두 흐름을 분리한 `pendingItemIds` 가드는 PR 2.
 *
 * 📅 날짜 라인 미렌더: `CartItemVM`에 `dateLabel` 보강 필드가 없음 (§ 1
 * "보강 필드는 § 3·§ 9에서 결정 후 추가"). PR 2 이후 보강 전략 결정 시 추가.
 */

import { AccentMediaBox } from '@/components/AccentMediaBox';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Icon } from '@/components/Icon';
import { QuantityStepper } from '@/components/QuantityStepper';
import { accent } from '@/styles-v2/accent';

import type { CartItemVM } from '../types';

export interface CartItemProps {
  item: CartItemVM;
  onQuantityChange: (next: number) => void;
  onRemove: () => void;
  pending?: boolean;
}

export function CartItem({
  item,
  onQuantityChange,
  onRemove,
  pending = false,
}: CartItemProps) {
  const className = ['cart-item', pending && 'is-pending']
    .filter(Boolean)
    .join(' ');

  return (
    <Card variant="solid" className={className}>
      <AccentMediaBox
        accent={accent(item.eventId)}
        size="sm"
        glyph="</>"
        className="cart-item__media"
      />
      <div className="cart-item__main">
        <div className="cart-item__title">{item.eventTitle}</div>
        <div className="cart-item__controls">
          <QuantityStepper
            value={item.quantity}
            onChange={onQuantityChange}
            min={1}
            size="sm"
            disabled={pending}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            disabled={pending}
            iconStart={<Icon name="trash" size={12} />}
            className="cart-item__remove"
          >
            삭제
          </Button>
        </div>
      </div>
      <div className="cart-item__total">
        {item.lineTotal.toLocaleString()}원
      </div>
    </Card>
  );
}
