/**
 * 주문 요약(`OrderSummary`) 내부 한 줄 — 라벨 / 값 페어.
 *
 * 프로토타입 `Row` (Cart.jsx:89-95)의 인라인 스타일을 BEM 클래스로 변환.
 * 시각 토큰: 일반 13.5px / text-2, bold 15px / text + fontWeight 700,
 * marginBottom 8 (CSS는 styles-v2/pages/cart.css에 정의).
 *
 * `value`는 string으로 받아 포맷 책임을 호출자에게 둔다 (예: `total.toLocaleString() + '원'`).
 */

export interface SummaryRowProps {
  label: string;
  value: string;
  bold?: boolean;
}

export function SummaryRow({ label, value, bold = false }: SummaryRowProps) {
  const className = ['cart-summary-row', bold && 'cart-summary-row--bold']
    .filter(Boolean)
    .join(' ');
  return (
    <div className={className}>
      <span className="cart-summary-row__label">{label}</span>
      <span className="cart-summary-row__value">{value}</span>
    </div>
  );
}
