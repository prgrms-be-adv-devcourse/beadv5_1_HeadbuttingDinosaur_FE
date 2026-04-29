/**
 * `/payment/success` 시각 컴포넌트.
 *
 * Cart.plan.md § 9.1-8. Toss redirect 직후 confirm API 호출 결과를
 * 3 단계(loading/success/error) 로 표시. 본 파일은 **표현만** 책임지고,
 * `confirmPayment` 호출과 `/payment/complete` 자동 이동은 컨테이너
 * (`index.tsx` PR 5 step 11)에서 처리한다.
 *
 * v1 (`pages/PaymentSuccess.tsx`) 동일 스코프 + 동일 카피. 톤만 v2.
 */

import type { ConfirmQuery } from './types';
import { PaymentActions } from './components/PaymentActions';
import { PaymentCallbackLayout } from './components/PaymentCallbackLayout';
import { PaymentStatusIcon } from './components/PaymentStatusIcon';

export interface PaymentSuccessProps {
  query: ConfirmQuery;
  /** 에러 화면의 "홈으로 돌아가기" CTA. */
  onHome: () => void;
}

export function PaymentSuccess({ query, onHome }: PaymentSuccessProps) {
  if (query.status === 'loading') {
    return (
      <PaymentCallbackLayout
        icon={<PaymentStatusIcon status="loading" />}
        title="결제 승인 처리 중..."
        description="잠시만 기다려주세요."
      />
    );
  }

  if (query.status === 'success') {
    return (
      <PaymentCallbackLayout
        icon={<PaymentStatusIcon status="success" />}
        title="결제 승인 완료!"
        description="잠시 후 결제 완료 페이지로 이동합니다."
      />
    );
  }

  return (
    <PaymentCallbackLayout
      icon={<PaymentStatusIcon status="error" />}
      title="결제 승인 실패"
      description={query.message}
      actions={
        <PaymentActions
          actions={[{ label: '홈으로 돌아가기', variant: 'primary', onClick: onHome }]}
        />
      }
    />
  );
}
