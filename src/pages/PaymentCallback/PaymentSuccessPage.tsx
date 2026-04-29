/**
 * `/payment/success` 컨테이너 — 라우트 진입점.
 *
 * Cart.plan.md § 9.1-8 / § 10.3.6 PR 5.
 *
 * 책임 분리:
 *  - 데이터/검증/API: `usePaymentConfirm` (sessionStorage + Toss 쿼리 + confirm 호출)
 *  - 자동 이동: 본 컨테이너가 `completePayload` 가 채워지면 1.5s setTimeout 후
 *    `/payment/complete` 로 navigate(replace) — v1 동작 보존.
 *  - 시각: `<PaymentSuccess>` (presentation)
 *
 * 인증 가드는 App.tsx 의 `<RequireAuth>` 가 라우트 진입 차단.
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { PaymentSuccess } from './PaymentSuccess';
import { usePaymentConfirm } from './hooks';

const REDIRECT_DELAY_MS = 1500;

export default function PaymentSuccessPage() {
  const navigate = useNavigate();
  const { query, completePayload } = usePaymentConfirm();

  useEffect(() => {
    if (!completePayload) return;
    const t = window.setTimeout(() => {
      navigate('/payment/complete', {
        state: completePayload,
        replace: true,
      });
    }, REDIRECT_DELAY_MS);
    return () => window.clearTimeout(t);
  }, [completePayload, navigate]);

  return (
    <PaymentSuccess
      query={query}
      onHome={() => navigate('/', { replace: true })}
    />
  );
}
