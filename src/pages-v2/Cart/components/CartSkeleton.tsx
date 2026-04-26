/**
 * 페이지 진입 페치 인플라이트 스켈레톤.
 *
 * 헤더 + 2-column 그리드(좌측 아이템 3개 / 우측 요약 카드) 골격을 그대로
 * 유지해 success 전환 시 레이아웃 시프트 방지 (§ 6.2).
 *
 * BEM prefix `cart-skel-*`. 실제 placeholder shimmer/색상은
 * styles-v2/pages/cart.css 에 정의 (EventDetailSkeleton 패턴 동일).
 */

import { Card } from '@/components-v2/Card';

const ITEM_COUNT = 3;
const SUMMARY_ROW_COUNT = 4;

export function CartSkeleton() {
  return (
    <div className="cart-page" aria-busy="true">
      <div className="cart-skel cart-skel-title" />
      <div className="cart-skel cart-skel-subtitle" />
      <div className="cart-grid">
        <ul className="cart-list" role="list">
          {Array.from({ length: ITEM_COUNT }, (_, i) => (
            <li key={i} className="cart-list__row">
              <Card variant="solid" className="cart-skel-item">
                <div className="cart-skel cart-skel-thumb" />
                <div className="cart-skel-item__main">
                  <div className="cart-skel cart-skel-line cart-skel-line--title" />
                  <div className="cart-skel cart-skel-line cart-skel-line--meta" />
                  <div className="cart-skel cart-skel-controls" />
                </div>
                <div className="cart-skel cart-skel-total" />
              </Card>
            </li>
          ))}
        </ul>
        <Card variant="solid" className="cart-summary">
          <div className="cart-skel cart-skel-line cart-skel-line--summary-title" />
          {Array.from({ length: SUMMARY_ROW_COUNT }, (_, i) => (
            <div key={i} className="cart-skel cart-skel-line cart-skel-line--summary-row" />
          ))}
          <div className="cart-skel cart-skel-button" />
        </Card>
      </div>
    </div>
  );
}

CartSkeleton.displayName = 'CartSkeleton';
