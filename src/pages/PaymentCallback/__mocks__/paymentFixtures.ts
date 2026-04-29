/**
 * 결제 콜백 v2 시각 검증용 fixture.
 *
 * Cart.plan.md § 10.1 의 `cartFixtures` 패턴을 차용 — `?paymentFixture=...`
 * 쿼리로 컨테이너가 시각 분기 3종(success: confirm 진행/완료, fail, complete)
 * 을 mock 으로 토글할 수 있게 한다. 실제 hooks 는 PR 후속 단계에서
 * sessionStorage·API 결과로 채운다.
 *
 * 인라인 mock 금지(@docs/CLAUDE.md). 페이지/컴포넌트는 본 파일이나
 * `hooks.ts` placeholder 만 참조한다.
 */

import type {
  ConfirmQuery,
  PaymentCompleteVM,
  PaymentFailVM,
  PaymentSuccessVM,
} from '../types';

const SAMPLE_ORDER_ID = 'ord_2026Q2_demo_0001abcd1234efgh5678';
const SAMPLE_PAYMENT_ID = 'pay_2026Q2_demo_0001wxyz';

export const mockConfirmSuccessData: PaymentSuccessVM = {
  orderId: SAMPLE_ORDER_ID,
  amount: 45_000,
  method: 'PG',
};

export const mockConfirmLoading: ConfirmQuery = { status: 'loading' };

export const mockConfirmSuccess: ConfirmQuery = {
  status: 'success',
  data: mockConfirmSuccessData,
};

export const mockConfirmError: ConfirmQuery = {
  status: 'error',
  message: '결제 승인 처리에 실패했습니다.',
};

export const mockFail: PaymentFailVM = {
  code: 'USER_CANCEL',
  message: '사용자가 결제를 취소했습니다.',
};

export const mockComplete: PaymentCompleteVM = {
  paymentId: SAMPLE_PAYMENT_ID,
  orderId: SAMPLE_ORDER_ID,
  amount: 45_000,
  method: 'WALLET_PG',
  approvedAt: '2026-04-26T11:23:00+09:00',
};
