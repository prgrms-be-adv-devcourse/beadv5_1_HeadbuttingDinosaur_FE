/**
 * Cart 페이지 컨테이너 — 라우트 진입점.
 *
 * 책임 (Cart.plan.md § 1):
 * - 데이터 페치: `useCart()` (PR 1 placeholder; PR 2 에서 실제 GET /cart 로 교체)
 * - 네비게이션: `useNavigate` 보유 → `onBrowse`/(PR 2 이후) `onQuantityChange/onRemove/onCheckout` 콜백을 leaf 페이지에 주입
 * - 인증 가드: `App.tsx` 의 `<RequireAuth>` 가 라우트 진입 차단 (§ 8.2) → 본 컨테이너는 무지
 *
 * **PR 1 한정**: `useCart()` 가 항상 `loading` 을 반환하므로 mutation 콜백
 * (`onQuantityChange/onRemove/onCheckout`) 은 사용자에게 도달하지 않음.
 * 시그니처 보장을 위해 no-op 으로 박아두며, PR 2/3 에서 실제 mutation 으로 교체.
 */

import { useNavigate } from 'react-router-dom';

import { Cart } from './Cart';
import { useCart } from './hooks';

const noop = () => {};

export default function CartPage() {
  const navigate = useNavigate();
  const query = useCart();

  return (
    <Cart
      query={query}
      onQuantityChange={noop}
      onRemove={noop}
      onCheckout={noop}
      onBrowse={() => navigate('/events')}
      checkoutState="idle"
    />
  );
}
