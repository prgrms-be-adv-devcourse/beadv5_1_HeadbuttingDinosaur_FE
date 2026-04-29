/**
 * Cart 페이지 컨테이너 — 라우트 진입점.
 *
 * - 데이터 페치 / 뮤테이션 / 결제 트리거: `useCart` + `useCartMutations` + `useCheckout`
 * - 추천 카드: `useRecommendedEvents` + 본 컨테이너 로컬의 빠른 담기 핸들러
 * - 인증 가드: `App.tsx` 의 `<RequireAuth>` 가 라우트 진입 차단 → 본 컨테이너는 무지
 * - QuantityStepper 는 절대 next quantity (`(itemId, next)`) 를 보내지만 mutation 훅은
 *   delta 기반(`setQuantityDelta(id, ±1)`) 이라 본 컨테이너에서 변환.
 *
 * 결제 성공(`onSuccess`)은 PaymentModal 의 WALLET-only 즉시 결제 경로에서만
 * 발화. PG 경로는 SDK 가 브라우저를 redirect 시키므로 Cart 자체는 unmount.
 */

import { useCallback, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { addCartItem } from '@/api/cart.api';
import { PaymentModal } from '@/components/PaymentModal';
import { useToast } from '@/contexts/ToastContext';

import { Cart } from './Cart';
import { useCart, useCartMutations, useCheckout, useRecommendedEvents } from './hooks';

export default function CartPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const cart = useCart();
  const mut = useCartMutations(cart);
  const items = cart.status === 'success' ? cart.data.items : [];
  const co = useCheckout(items, cart.refetch);
  const recommended = useRecommendedEvents();

  const handleQuantityChange = (itemId: string, next: number) => {
    if (cart.status !== 'success') return;
    const item = cart.data.items.find((i) => i.cartItemId === itemId);
    if (!item) return;
    const delta = next - item.quantity;
    if (delta === 1 || delta === -1) {
      void mut.setQuantityDelta(itemId, delta);
    }
  };

  const cartEventIds = useMemo(
    () => new Set(items.map((i) => i.eventId)),
    [items],
  );
  const [pendingRecEventIds, setPendingRecEventIds] = useState<Set<string>>(
    () => new Set(),
  );
  const pendingRecRef = useRef<Set<string>>(pendingRecEventIds);
  const handleRecAdd = useCallback(
    async (eventId: string) => {
      if (pendingRecRef.current.has(eventId)) return;
      if (cartEventIds.has(eventId)) return;
      const next = new Set(pendingRecRef.current).add(eventId);
      pendingRecRef.current = next;
      setPendingRecEventIds(next);
      try {
        await addCartItem({ eventId, quantity: 1 });
        toast('장바구니에 담았습니다.', 'success');
        cart.refetch();
      } catch {
        toast('장바구니에 담지 못했습니다.', 'error');
      } finally {
        const after = new Set(pendingRecRef.current);
        after.delete(eventId);
        pendingRecRef.current = after;
        setPendingRecEventIds(after);
      }
    },
    [cart, cartEventIds, toast],
  );

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
        onClearAll={() => {
          void mut.clearAll();
        }}
        clearing={mut.clearing}
        checkoutState={co.checkoutState}
        pendingItemIds={mut.pendingItemIds}
        recommended={recommended}
        cartEventIds={cartEventIds}
        pendingRecEventIds={pendingRecEventIds}
        onRecAdd={handleRecAdd}
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
