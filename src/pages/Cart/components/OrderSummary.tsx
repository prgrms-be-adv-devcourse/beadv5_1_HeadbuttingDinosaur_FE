/**
 * 우측 sticky 주문 요약 카드.
 *
 * 합계 / 수수료 / 할인 라인 + 구분선 + 총 결제금액 + 결제하기 버튼 + 약관 caption.
 * 프로토타입 Cart.jsx:60-74 의 인라인 스타일을 BEM 으로 변환.
 *
 * 금액 산출(subtotal/fee/discount/total)은 호출자(adapters/hooks) 책임.
 * 본 컴포넌트는 표시만 담당.
 *
 * PR 1: `disabled` 가 페이지에서 true 로 강제됨 (실제 결제 흐름은 PR 3).
 * `submitting` 은 PR 3 에서 `useCheckout` 도입 후 활성화.
 */

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';

import { SummaryRow } from './SummaryRow';

export interface OrderSummaryProps {
  subtotal: number;
  fee: number;
  discount: number;
  total: number;
  onCheckout: () => void;
  submitting?: boolean;
  disabled?: boolean;
}

const formatWon = (n: number): string => `${n.toLocaleString()}원`;

export function OrderSummary({
  subtotal,
  fee,
  discount,
  total,
  onCheckout,
  submitting = false,
  disabled = false,
}: OrderSummaryProps) {
  return (
    <Card variant="solid" className="cart-summary">
      <h3 className="cart-summary__title">주문 요약</h3>

      <SummaryRow label="상품 합계" value={formatWon(subtotal)} />
      <SummaryRow label="수수료" value={formatWon(fee)} />
      <SummaryRow label="할인" value={formatWon(discount)} />

      <div className="cart-summary__divider" role="separator" />

      <SummaryRow label="총 결제금액" value={formatWon(total)} bold />

      <Button
        variant="primary"
        size="lg"
        full
        loading={submitting}
        disabled={disabled}
        onClick={onCheckout}
        className="cart-summary__checkout"
      >
        결제하기
      </Button>

      <p className="cart-summary__caption">
        결제 후 티켓은 즉시 발급되며, 행사 7일 전까지 전액 환불이 가능합니다.
      </p>
    </Card>
  );
}
