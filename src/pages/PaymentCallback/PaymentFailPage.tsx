/**
 * `/payment/fail` 컨테이너 — 라우트 진입점.
 *
 * Cart.plan.md § 9.1-8 / § 10.3.6 PR 5.
 *
 * 책임 분리:
 *  - 데이터/부수효과: `usePaymentFail` (URL 파싱 + sessionStorage 정리 + failPayment fire-and-forget)
 *  - 시각: `<PaymentFail>` (presentation)
 *  - CTA navigate 콜백 주입 — "장바구니로 돌아가기"(/cart) / "홈으로"(/) (§ 10.3.6 PR 5 시나리오)
 *
 * 인증 가드는 App.tsx 의 `<RequireAuth>` 가 라우트 진입 차단.
 */

import { useNavigate } from 'react-router-dom';

import { PaymentFail } from './PaymentFail';
import { usePaymentFail } from './hooks';

export default function PaymentFailPage() {
  const navigate = useNavigate();
  const data = usePaymentFail();

  return (
    <PaymentFail
      data={data}
      onCart={() => navigate('/cart', { replace: true })}
      onHome={() => navigate('/', { replace: true })}
    />
  );
}
