/**
 * `/payment/fail` 시각 컴포넌트.
 *
 * Cart.plan.md § 9.1-8 / § 10.3.6 PR 5 시나리오 — "사유 표시 + 장바구니로
 * 돌아가기 CTA → /cart?v=2".  v1 (`pages/PaymentFail.tsx`) 의 카피와
 * 동작을 보존하되 "홈으로" 단독 CTA 대신 "장바구니로 돌아가기" 를
 * 1차 CTA 로 둔다 — 결제 실패 직후 사용자가 가장 자연스럽게 돌아갈
 * 위치가 카트이므로.
 *
 * `failPayment` 부수 호출 / sessionStorage 정리는 컨테이너 책임. 본
 * 파일은 표시만.
 */

import type { PaymentFailVM } from './types';
import { PaymentActions } from './components/PaymentActions';
import { PaymentCallbackLayout } from './components/PaymentCallbackLayout';
import { PaymentStatusIcon } from './components/PaymentStatusIcon';

export interface PaymentFailProps {
  data: PaymentFailVM;
  onCart: () => void;
  onHome: () => void;
}

export function PaymentFail({ data, onCart, onHome }: PaymentFailProps) {
  return (
    <PaymentCallbackLayout
      icon={<PaymentStatusIcon status="error" />}
      title="결제 실패"
      description={data.message}
      meta={`오류 코드: ${data.code}`}
      actions={
        <PaymentActions
          actions={[
            { label: '홈으로', variant: 'ghost', onClick: onHome },
            { label: '장바구니로 돌아가기', variant: 'primary', onClick: onCart },
          ]}
        />
      }
    />
  );
}
