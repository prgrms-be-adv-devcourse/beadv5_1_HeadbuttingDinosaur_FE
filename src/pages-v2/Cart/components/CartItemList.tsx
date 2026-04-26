/**
 * 카트 아이템 세로 스택. 각 row 의 cartItemId 를 콜백에 바인딩한다.
 *
 * 페이지 측 핸들러는 `(itemId, next)` / `(itemId)` 시그니처를 쓰지만 leaf
 * `CartItem` 은 자기 itemId를 모르므로 List가 클로저로 주입.
 *
 * `pendingItemIds` 가드 (§ 3 / § 5)는 PR 2의 mutation 도입 시 채워짐.
 * PR 1 단계에서도 prop 자체는 받아들여 호출자 구현이 미리 동작하도록 둠.
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
