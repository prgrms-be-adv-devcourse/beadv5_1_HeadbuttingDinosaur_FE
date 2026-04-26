/**
 * Toss Payments npm SDK 캡슐화.
 *
 * v1 (`src/components/PaymentModal.tsx`) 은 `index.html` 에 외부 `<script>` 를
 * 로드한 뒤 `window.TossPayments(clientKey)` 를 사용했다. 본 모듈은
 * `@tosspayments/tosspayments-sdk` (v2) 를 동적으로 import 해 같은 결과를
 * 얻는다 — `loadTossPayments(clientKey)` 의 v2 API 는 `payment(...).requestPayment(...)`
 * 로 시그니처가 바뀌었으므로 호출부를 한 군데에 모은다.
 *
 * `clientKey` 는 `VITE_TOSS_CLIENT_KEY` env 우선, 부재 시 v1 과 동일한
 * Toss 공식 테스트 키로 폴백 — dev 환경에서 env 누락 시 결제 회귀를
 * 막기 위함이며 prod 빌드에서는 env 를 반드시 주입해야 한다.
 *
 * Cart.plan.md § 7.2 / § 10.3 PR 3 — npm SDK 마이그레이션.
 */

import { ANONYMOUS, loadTossPayments } from '@tosspayments/tosspayments-sdk';

/** Toss 공식 문서 테스트 키 (v1 과 동일). prod 에서는 env 로 덮어써야 한다. */
const TOSS_TEST_CLIENT_KEY = 'test_ck_GjLJoQ1aVZplbR1KB0MW8w6KYe2R';

const readClientKey = (): string => {
  const fromEnv = import.meta.env.VITE_TOSS_CLIENT_KEY as string | undefined;
  return fromEnv && fromEnv.length > 0 ? fromEnv : TOSS_TEST_CLIENT_KEY;
};

export interface TossCardPaymentInput {
  /** `readyPayment` 응답의 `paymentId` — Toss SDK 의 `orderId` 로 사용. */
  paymentId: string;
  /** PG 청구 금액 (KRW). 복합 결제 시 wallet 차감 후 PG 부담분. */
  amount: number;
  orderName: string;
  successUrl: string;
  failUrl: string;
}

/**
 * 카드 결제 요청. 성공/실패 URL 로 브라우저가 redirect 되므로 본 함수의
 * Promise 가 resolve 되는 일반 케이스는 거의 없다 — 호출자는 reject 만
 * 신경 쓰면 된다 (USER_CANCEL · 잘못된 입력 등).
 */
export async function requestTossCardPayment(
  input: TossCardPaymentInput,
): Promise<void> {
  const tossPayments = await loadTossPayments(readClientKey());
  const payment = tossPayments.payment({ customerKey: ANONYMOUS });
  await payment.requestPayment({
    method: 'CARD',
    amount: { currency: 'KRW', value: input.amount },
    orderId: input.paymentId,
    orderName: input.orderName,
    successUrl: input.successUrl,
    failUrl: input.failUrl,
  });
}
