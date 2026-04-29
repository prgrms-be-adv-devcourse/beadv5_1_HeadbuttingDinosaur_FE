/**
 * Toss Payments v1 SDK 캡슐화 (`index.html` 의 `<script src="https://js.tosspayments.com/v1/payment">`).
 *
 * v1 스펙: `window.TossPayments(clientKey).requestPayment('카드', { amount, orderId, ... })`.
 * v2 npm SDK 로 전환했을 때 결제창이 안 뜨는 회귀가 있어 v1 그대로 되돌렸다.
 * `clientKey` 는 `VITE_TOSS_CLIENT_KEY` env 우선, 부재 시 Toss 공식 테스트 키.
 */

declare global {
  interface Window {
    TossPayments?: (clientKey: string) => {
      requestPayment: (
        method: string,
        options: {
          amount: number;
          orderId: string;
          orderName: string;
          successUrl: string;
          failUrl: string;
        },
      ) => Promise<void>;
    };
  }
}

const TOSS_TEST_CLIENT_KEY = 'test_ck_GjLJoQ1aVZplbR1KB0MW8w6KYe2R';

const readClientKey = (): string => {
  const fromEnv = import.meta.env.VITE_TOSS_CLIENT_KEY as string | undefined;
  return fromEnv && fromEnv.length > 0 ? fromEnv : TOSS_TEST_CLIENT_KEY;
};

export interface TossCardPaymentInput {
  paymentId: string;
  amount: number;
  orderName: string;
  successUrl: string;
  failUrl: string;
}

export async function requestTossCardPayment(
  input: TossCardPaymentInput,
): Promise<void> {
  if (typeof window === 'undefined' || !window.TossPayments) {
    throw new Error(
      'TossPayments SDK 가 로드되지 않았습니다. index.html 의 토스 스크립트를 확인하세요.',
    );
  }
  const tossPayments = window.TossPayments(readClientKey());
  await tossPayments.requestPayment('카드', {
    amount: input.amount,
    orderId: input.paymentId,
    orderName: input.orderName,
    successUrl: input.successUrl,
    failUrl: input.failUrl,
  });
}
