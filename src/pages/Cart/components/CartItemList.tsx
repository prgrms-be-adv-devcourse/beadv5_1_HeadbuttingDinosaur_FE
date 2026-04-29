/**
 * 카트 아이템 세로 스택. v1 과 동일하게 readonly 리스트.
 */

import type { CartItemVM } from '../types';
import { CartItem } from './CartItem';

export interface CartItemListProps {
  items: CartItemVM[];
}

export function CartItemList({ items }: CartItemListProps) {
  return (
    <ul className="cart-list" role="list">
      {items.map((item) => (
        <li key={item.cartItemId} className="cart-list__row">
          <CartItem item={item} />
        </li>
      ))}
    </ul>
  );
}
