/**
 * 장바구니 한 줄.
 *
 * v1 Cart 와 동일하게 수량은 readonly 표시. 단건 수량 증감/삭제는 백엔드
 * 단건 엔드포인트가 안정화되기 전까지 노출하지 않는다 (전체 삭제만 노출).
 */

import { AccentMediaBox } from '@/components/AccentMediaBox';
import { Card } from '@/components/Card';
import { accent } from '@/styles/accent';

import type { CartItemVM } from '../types';

export interface CartItemProps {
  item: CartItemVM;
}

export function CartItem({ item }: CartItemProps) {
  return (
    <Card variant="solid" className="cart-item">
      <AccentMediaBox
        accent={accent(item.eventId)}
        size="sm"
        glyph="</>"
        className="cart-item__media"
      />
      <div className="cart-item__main">
        <div className="cart-item__title">{item.eventTitle}</div>
        <div className="cart-item__meta">
          {item.unitPrice.toLocaleString()}원 · {item.quantity}매
        </div>
      </div>
      <div className="cart-item__total">
        {item.lineTotal.toLocaleString()}원
      </div>
    </Card>
  );
}
