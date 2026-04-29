/**
 * Cart 페이지 프레젠테이션.
 *
 * `CartQuery` 분기 (loading / error / success(empty) / success(non-empty))를
 * 화면 컴포지션으로 변환. 데이터 페치/뮤테이션/네비게이션은 모두 컨테이너
 * (`index.tsx`)가 담당하며, 본 컴포넌트는 props 만 받아 렌더한다.
 */

import type { ReactNode } from 'react';

import { Card } from '@/components/Card';

import { CartHeader } from './components/CartHeader';
import { CartItemList } from './components/CartItemList';
import { CartSkeleton } from './components/CartSkeleton';
import { EmptyCart } from './components/EmptyCart';
import { OrderSummary } from './components/OrderSummary';
import {
  RecommendedSection,
  type RecommendedQuery,
} from './components/RecommendedSection';
import type { CartQuery } from './types';

export type CheckoutState = 'idle' | 'submitting' | 'error';

export interface CartProps {
  query: CartQuery;
  onQuantityChange: (itemId: string, next: number) => void;
  onRemove: (itemId: string) => void;
  onCheckout: () => void;
  onBrowse: () => void;
  onClearAll: () => void;
  clearing?: boolean;
  checkoutState: CheckoutState;
  pendingItemIds?: Set<string>;
  recommended: RecommendedQuery;
  cartEventIds: Set<string>;
  pendingRecEventIds?: Set<string>;
  onRecAdd: (eventId: string) => void;
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
  onClearAll,
  clearing = false,
  checkoutState,
  pendingItemIds,
  recommended,
  cartEventIds,
  pendingRecEventIds,
  onRecAdd,
}: CartProps) {
  /* 본문 분기와 무관하게 비-loading 상태에선 항상 추천 섹션을 마운트.
   * 로딩 중에는 메인 카트가 우선이라 표시하지 않는다. RecommendedSection
   * 자체가 hidden → null 처리하므로 페치 실패시 자동 침묵 (§ 10.3.6). */
  const recSection =
    query.status === 'loading' ? null : (
      <RecommendedSection
        query={recommended}
        cartEventIds={cartEventIds}
        pendingEventIds={pendingRecEventIds}
        onAdd={onRecAdd}
      />
    );

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
        {recSection}
      </PageShell>
    );
  }

  const cart = query.data;

  if (cart.items.length === 0) {
    return (
      <PageShell>
        <CartHeader itemCount={0} />
        <EmptyCart onBrowse={onBrowse} />
        {recSection}
      </PageShell>
    );
  }

  return (
    <PageShell>
      <CartHeader
        itemCount={cart.items.length}
        onClearAll={onClearAll}
        clearing={clearing}
      />
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
        />
      </div>
      {recSection}
    </PageShell>
  );
}

Cart.displayName = 'Cart';
