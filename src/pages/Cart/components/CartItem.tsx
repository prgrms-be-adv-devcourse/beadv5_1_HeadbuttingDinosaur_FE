/**
 * 장바구니 한 줄.
 *
 * 좌측 미디어 / 가운데 제목 + 수량 컨트롤 + 삭제 / 우측 합계.
 * `pending` 동안엔 수량/삭제 버튼이 disabled.
 */

import { AccentMediaBox } from '@/components/AccentMediaBox';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Icon } from '@/components/Icon';
import { QuantityStepper } from '@/components/QuantityStepper';
import { accent } from '@/styles/accent';

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
        <div className="cart-item__meta">
          {item.unitPrice.toLocaleString()}원 / 1매
        </div>
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
