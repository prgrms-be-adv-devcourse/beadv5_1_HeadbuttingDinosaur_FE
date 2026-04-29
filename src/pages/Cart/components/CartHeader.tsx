/**
 * 페이지 상단 타이틀 + 부제.
 *
 * 프로토타입 Cart.jsx:19-22 의 인라인 스타일을 BEM 클래스로 변환.
 * 시각: h1 26px/700 text, 부제 14px text-3 (CSS는 styles-v2/pages/cart.css).
 */

export interface CartHeaderProps {
  itemCount: number;
}

export function CartHeader({ itemCount }: CartHeaderProps) {
  return (
    <header className="cart-header">
      <h1 className="cart-header__title">장바구니</h1>
      <p className="cart-header__subtitle">
        담긴 티켓 {itemCount}개 · 결제 전 최종 수량을 확인해주세요.
      </p>
    </header>
  );
}
