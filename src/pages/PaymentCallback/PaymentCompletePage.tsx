/**
 * `/payment/complete` 컨테이너 — 라우트 진입점.
 *
 * Cart.plan.md § 9.1-8 / § 10.3.6 PR 5.
 *
 * 책임 분리:
 *  - 데이터: `useCompletePayload` (location.state → PaymentCompleteVM 정규화)
 *  - 시각: `<PaymentComplete>` (presentation)
 *  - state 누락(직접 진입) 시 `/` 로 redirect — v1 동작 보존(`if (!state) navigate('/')`).
 *  - CTA: 주문 상세(/mypage?tab=orders) / 내 티켓 보기(/mypage?tab=tickets)
 *
 * 인증 가드는 App.tsx 의 `<RequireAuth>` 가 라우트 진입 차단.
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { PaymentComplete } from './PaymentComplete';
import { useCompletePayload } from './hooks';

export default function PaymentCompletePage() {
  const navigate = useNavigate();
  const data = useCompletePayload();

  useEffect(() => {
    if (data === null) navigate('/', { replace: true });
  }, [data, navigate]);

  if (data === null) return null;

  return (
    <PaymentComplete
      data={data}
      onOrders={() => navigate('/mypage?tab=orders')}
      onTickets={() => navigate('/mypage?tab=tickets')}
    />
  );
}
