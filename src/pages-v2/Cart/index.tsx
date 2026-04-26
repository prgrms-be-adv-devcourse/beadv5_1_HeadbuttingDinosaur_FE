/**
 * Cart 페이지 컨테이너 — 라우트 진입점.
 *
 * Cart.plan.md § 1 / § 5 / § 10.2 step 7.
 *
 * - 데이터 페치 / 뮤테이션 / 결제 트리거: `useCart` + `useCartMutations` + `useCheckout`
 * - 인증 가드: `App.tsx` 의 `<RequireAuth>` 가 라우트 진입 차단 (§ 8.2) → 본 컨테이너는 무지
 * - QuantityStepper 는 절대 next quantity (`(itemId, next)`) 를 보내지만 mutation 훅은
 *   delta 기반(`setQuantityDelta(id, ±1)`) 이라 본 컨테이너에서 변환.
 *
 * **PR 3 — PaymentModal v2 교체 완료**
 * `@/components-v2/PaymentModal` 로 import 한 줄만 교체했고 그 외 로직은
 * 그대로 유지. props 시그니처가 v1 과 동일하므로 시각/동작 회귀는
 * Cart.plan.md § 10.3.6 의 PR 3 시나리오로 검증.
 *
 * 결제 성공(`onSuccess`)은 v2 PaymentModal 의 WALLET-only 즉시 결제 경로에서만
 * 발화. PG 경로는 SDK 가 브라우저를 redirect 시키므로 Cart 자체는 unmount.
 * `/payment/complete` 의 state shape 은 v1 Cart 와 동일하게 `{ orderId, amount }`
 * 로 맞춘다 (PaymentComplete 페이지가 그 키를 읽음).
 */

import { useNavigate } from 'react-router-dom';

import { PaymentModal } from '@/components-v2/PaymentModal';

import { Cart } from './Cart';
import { useCart, useCartMutations, useCheckout } from './hooks';

export default function CartPage() {
  const navigate = useNavigate();
  const cart = useCart();
  const mut = useCartMutations(cart);
  const items = cart.status === 'success' ? cart.data.items : [];
  const co = useCheckout(items, cart.refetch);

  const handleQuantityChange = (itemId: string, next: number) => {
    if (cart.status !== 'success') return;
    const item = cart.data.items.find((i) => i.cartItemId === itemId);
    if (!item) return;
    const delta = next - item.quantity;
    if (delta === 1 || delta === -1) {
      void mut.setQuantityDelta(itemId, delta);
    }
  };

  const target = co.paymentTarget;

  return (
    <>
      <Cart
        query={cart}
        onQuantityChange={handleQuantityChange}
        onRemove={(id) => {
          void mut.removeItem(id);
        }}
        onCheckout={() => {
          void co.submit();
        }}
        onBrowse={() => navigate('/events')}
        checkoutState={co.checkoutState}
        pendingItemIds={mut.pendingItemIds}
      />
      {target && (
        <PaymentModal
          open
          orderId={target.orderId}
          totalAmount={target.totalAmount}
          onClose={co.closeModal}
          onSuccess={() =>
            navigate('/payment/complete', {
              state: { orderId: target.orderId, amount: target.totalAmount },
            })
          }
        />
      )}
    </>
  );
}
