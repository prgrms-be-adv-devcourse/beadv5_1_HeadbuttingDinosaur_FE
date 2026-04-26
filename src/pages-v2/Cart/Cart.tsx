/**
 * Cart 페이지 프레젠테이션.
 *
 * `CartQuery` 분기 (loading / error / success(empty) / success(non-empty))를
 * 화면 컴포지션으로 변환. 데이터 페치/뮤테이션/네비게이션은 모두 컨테이너
 * (`index.tsx`)가 담당하며, 본 컴포넌트는 props 만 받아 렌더한다.
 *
 * PR 1 한정:
 * - 결제 버튼은 항상 disabled (`useCheckout` 도입은 PR 3).
 * - 에러 분기는 minimal 메시지. PR 2 에서 `onRetry`/`describeError` 패턴 도입.
 */

import type { ReactNode } from 'react';

import { Card } from '@/components-v2/Card';

import { CartHeader } from './components/CartHeader';
import { CartItemList } from './components/CartItemList';
import { CartSkeleton } from './components/CartSkeleton';
import { EmptyCart } from './components/EmptyCart';
import { OrderSummary } from './components/OrderSummary';
import type { CartQuery } from './types';

export type CheckoutState = 'idle' | 'submitting' | 'error';

export interface CartProps {
  query: CartQuery;
  onQuantityChange: (itemId: string, next: number) => void;
  onRemove: (itemId: string) => void;
  onCheckout: () => void;
  onBrowse: () => void;
  checkoutState: CheckoutState;
  pendingItemIds?: Set<string>;
}

function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="editor-scroll">
      <div className="gutter" aria-hidden="true">
        {Array.from({ length: 50 }, (_, i) => (
          <span key={i} className={`ln${i === 0 ? ' active' : ''}`}>
            {i + 1}
          </span>
        ))}
      </div>
      <div className="editor-body cart-page">{children}</div>
    </div>
  );
}

export function Cart({
  query,
  onQuantityChange,
  onRemove,
  onCheckout,
  onBrowse,
  checkoutState,
  pendingItemIds,
}: CartProps) {
  if (query.status === 'loading') {
    return (
      <PageShell>
        <CartSkeleton />
      </PageShell>
    );
  }

  if (query.status === 'error') {
    return (
      <PageShell>
        <CartHeader itemCount={0} />
        <Card variant="solid" className="cart-error">
          <p>장바구니를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.</p>
        </Card>
      </PageShell>
    );
  }

  const cart = query.data;

  if (cart.items.length === 0) {
    return (
      <PageShell>
        <CartHeader itemCount={0} />
        <EmptyCart onBrowse={onBrowse} />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <CartHeader itemCount={cart.items.length} />
      <div className="cart-grid">
        <CartItemList
          items={cart.items}
          onQuantityChange={onQuantityChange}
          onRemove={onRemove}
          pendingItemIds={pendingItemIds}
        />
        <OrderSummary
          subtotal={cart.subtotal}
          fee={cart.fee}
          discount={cart.discount}
          total={cart.total}
          onCheckout={onCheckout}
          submitting={checkoutState === 'submitting'}
          /* PR 1: 결제 흐름 미도입 → 항상 disabled. PR 3 에서 제거. */
          disabled
        />
      </div>
    </PageShell>
  );
}

Cart.displayName = 'Cart';
