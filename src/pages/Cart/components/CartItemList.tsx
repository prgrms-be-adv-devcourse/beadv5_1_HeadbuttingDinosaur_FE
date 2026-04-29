/**
 * 카트 아이템 세로 스택. 각 row 의 cartItemId 를 콜백에 바인딩한다.
 * leaf `CartItem` 은 자기 itemId를 모르므로 List 가 클로저로 주입.
 */

import type { CartItemVM } from '../types';
import { CartItem } from './CartItem';

export interface CartItemListProps {
  items: CartItemVM[];
  onQuantityChange: (itemId: string, next: number) => void;
  onRemove: (itemId: string) => void;
  pendingItemIds?: Set<string>;
}

export function CartItemList({
  items,
  onQuantityChange,
  onRemove,
  pendingItemIds,
}: CartItemListProps) {
  return (
    <ul className="cart-list" role="list">
      {items.map((item) => (
        <li key={item.cartItemId} className="cart-list__row">
          <CartItem
            item={item}
            onQuantityChange={(next) => onQuantityChange(item.cartItemId, next)}
            onRemove={() => onRemove(item.cartItemId)}
            pending={pendingItemIds?.has(item.cartItemId) ?? false}
          />
        </li>
      ))}
    </ul>
  );
}
