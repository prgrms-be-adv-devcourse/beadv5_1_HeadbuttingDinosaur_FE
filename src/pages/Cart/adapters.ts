/**
 * Cart 페이지 어댑터 — API DTO ↔ 페이지 VM 변환.
 *
 * 설계 근거: docs/archive/v2-cutover/Cart.plan.md
 *  - § 4 어댑트 매핑 (요약) 표
 *  - § 4 표 1 (`updateCartItemQuantity` 응답은 `{ cartItemId, quantity }` 만 → 부분 머지)
 *  - § 4 표 2 (`createOrder` → `OrderResponse`)
 *  - § 1 (`CartVM.fee`/`discount`는 현재 백엔드 필드 부재 → 0 으로 채움. 향후 보강은 별도 PR)
 *
 * 이 파일은 부수효과·네트워크 호출을 포함하지 않는다.
 * `useCart`/`useCartMutations`/`useCheckout` (hooks.ts) 가 응답을 이 함수들로 흘려보낸다.
 */
import type {
  CartItemDetail,
  CartItemQuantityResponse,
  CartResponse,
  OrderResponse,
} from '@/api/types';

import type { CartItemVM, CartVM, OrderResultVM } from './types';

/**
 * `CartItemDetail` → `CartItemVM`.
 * `lineTotal = price * quantity` 파생. API는 라인 합을 내려주지 않는다.
 */
export const toCartItemVM = (api: CartItemDetail): CartItemVM => ({
  cartItemId: api.cartItemId,
  eventId: api.eventId,
  eventTitle: api.eventTitle,
  unitPrice: api.price,
  quantity: api.quantity,
  lineTotal: api.price * api.quantity,
});

/**
 * `CartResponse` → `CartVM`.
 *
 * - `subtotal = res.totalAmount` (§ 4 어댑트 매핑 표 — 백엔드 합계 신뢰)
 * - `fee` / `discount`: 백엔드 미제공 → 0. `total = subtotal`.
 *   추후 백엔드가 fee/discount 를 내려주면 본 함수만 갱신.
 */
export const toCartVM = (res: CartResponse): CartVM => {
  const fee = 0;
  const discount = 0;
  const subtotal = res.totalAmount;
  return {
    cartId: res.cartId,
    items: res.items.map(toCartItemVM),
    subtotal,
    fee,
    discount,
    total: subtotal + fee - discount,
  };
};

/**
 * `updateCartItemQuantity` 응답(`{ cartItemId, quantity }`)을 직전 `CartVM` 에 부분 머지.
 *
 * - 매칭 키: 응답 `cartItemId` 가 `number` (api/types.ts), VM 측은 `string`.
 *   → `String()` 으로 강제 변환 후 비교 (백엔드 타입 정정 시 본 함수만 단순화).
 * - 일치하는 row 가 없으면 prev 그대로 (낙관적 업데이트가 이미 사라진 row 에 대한 응답일 때 안전 동작).
 * - 라인 합/합계 재계산: `lineTotal`, `subtotal`, `total` 모두 새 quantity 기준으로 다시 산출.
 */
export const mergeQuantityUpdate = (
  prev: CartVM,
  res: CartItemQuantityResponse,
): CartVM => {
  const targetId = String(res.cartItemId);
  const idx = prev.items.findIndex((i) => i.cartItemId === targetId);
  if (idx === -1) return prev;

  const target = prev.items[idx];
  const nextItem: CartItemVM = {
    ...target,
    quantity: res.quantity,
    lineTotal: target.unitPrice * res.quantity,
  };
  const items = prev.items.slice();
  items[idx] = nextItem;

  const subtotal = items.reduce((sum, i) => sum + i.lineTotal, 0);
  return {
    ...prev,
    items,
    subtotal,
    total: subtotal + prev.fee - prev.discount,
  };
};

/**
 * `OrderResponse` → `OrderResultVM` (PaymentModal 입력용 최소 필드).
 * § 4 표 2: `createOrder` 응답은 `ApiResponse<OrderResponse>` 래퍼로 옴 → 본 함수는 unwrap 이후 호출.
 */
export const toOrderResultVM = (res: OrderResponse): OrderResultVM => ({
  orderId: res.orderId,
  totalAmount: res.totalAmount,
});
