/**
 * `/payment/complete` 시각 컴포넌트.
 *
 * Cart.plan.md § 9.1-8. v1 (`pages/PaymentComplete.tsx`) 영수증 화면을
 * v2 톤으로 이전 — 큰 ✓ 아이콘 + 카피 + 영수증 카드 + CTA 2개.
 *
 * `PaymentCompleteVM` 의 method/approvedAt 은 옵션이라(§ types.ts) 본 파일
 * 에서 라벨/일시 fallback 을 채운다. 단, 누락된 데이터 자체는 컨테이너가
 * 진입 시점에 처리(예: location.state 이 없으면 / 로 redirect).
 */

import type { PaymentCompleteVM, PaymentMethod } from './types';
import { PaymentActions } from './components/PaymentActions';
import { PaymentCallbackLayout } from './components/PaymentCallbackLayout';
import { PaymentReceipt } from './components/PaymentReceipt';
import { PaymentStatusIcon } from './components/PaymentStatusIcon';

export interface PaymentCompleteProps {
  data: PaymentCompleteVM;
  onOrders: () => void;
  onTickets: () => void;
}

const METHOD_LABEL: Record<PaymentMethod, string> = {
  WALLET: '예치금',
  WALLET_PG: '복합 결제 (예치금 + 카드)',
  PG: '카드/계좌이체',
};

/** 식별자 길이가 유동적이라 첫 20 자만 모노스페이스로 노출(v1 동일). */
const truncateOrderId = (orderId: string): string =>
  orderId.length > 20 ? `${orderId.slice(0, 20)}...` : orderId;

const formatApprovedAt = (iso: string | undefined): string => {
  const date = iso ? new Date(iso) : new Date();
  return date.toLocaleString('ko-KR');
};

export function PaymentComplete({
  data,
  onOrders,
  onTickets,
}: PaymentCompleteProps) {
  const methodLabel = METHOD_LABEL[data.method ?? 'PG'];
  return (
    <PaymentCallbackLayout
      size="md"
      icon={<PaymentStatusIcon status="success" size="lg" />}
      title="결제 완료!"
      description="티켓이 발급되었습니다. 마이페이지에서 확인하세요."
      actions={
        <PaymentActions
          actions={[
            { label: '주문 상세', variant: 'ghost', onClick: onOrders },
            { label: '내 티켓 보기', variant: 'primary', onClick: onTickets },
          ]}
        />
      }
    >
      <PaymentReceipt
        rows={[
          {
            label: '결제 금액',
            value: `${data.amount.toLocaleString()}원`,
            bold: true,
          },
          { label: '결제 수단', value: methodLabel },
          { label: '주문번호', value: truncateOrderId(data.orderId), mono: true },
          { label: '결제 일시', value: formatApprovedAt(data.approvedAt) },
        ]}
      />
    </PaymentCallbackLayout>
  );
}
