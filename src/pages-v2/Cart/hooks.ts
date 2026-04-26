/**
 * Cart 페이지 훅.
 *
 * **PR 1 placeholder** — `useCart` 만 정의하며 항상 `{ status: 'loading' }` 을 반환.
 * 실제 `getCart()` 페치 / 캐시 / refetch 는 PR 2 에서 본문 교체 (시그니처 유지).
 * `useCartMutations` (수량/삭제) 와 `useCheckout` (주문/결제 트리거) 도 PR 2·3 에서 추가.
 *
 * 시그니처를 미리 노출하는 이유: 컨테이너(`index.tsx`)가 PR 2 로 넘어가도
 * import 문 변경 없이 본문 교체만으로 동작하도록.
 *
 * Cart.plan.md § 3 / § 10.1.
 */

import type { CartQuery } from './types';

export function useCart(): CartQuery {
  return { status: 'loading' };
}
