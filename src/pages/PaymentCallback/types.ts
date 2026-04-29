/**
 * 결제 콜백 페이지 v2 타입.
 *
 * 설계 근거: docs/archive/v2-cutover/Cart.plan.md
 *  - § 9.1-8 (결제 완료/실패 페이지를 v2 톤앤매너로 리스킨)
 *  - § 10.3.1 PR 5 (별도 plan 문서로 분리 권장 — 본 PR 은 시각 골격만)
 *
 * 스코프: PaymentSuccess(Toss redirect 직후 confirm 처리) / PaymentFail
 * (Toss failUrl) / PaymentComplete(승인 후 영수증) 3개 페이지의 표현 VM.
 *
 * v1 동작 보존: API 호출(`confirmPayment` / `failPayment`)·sessionStorage
 * `payment_context` 복구·Toss 쿼리 파싱은 hooks 단에서 그대로 재사용한다.
 * 본 타입은 화면이 표시할 정보만 정의 — Toss 의 paymentKey 같은 내부 키는
 * VM 에 흘리지 않는다.
 */

/** v1 `PaymentRequest`/`PaymentConfirmResponse` 과 일치. */
export type PaymentMethod = 'PG' | 'WALLET' | 'WALLET_PG';

/**
 * `/payment/success` 진입 시 Toss 가 붙여주는 쿼리 + sessionStorage 컨텍스트
 * 를 합쳐 confirm API 가 요구하는 형태로 정규화한 입력. hooks 가 검증 후
 * 만든다 (URL/세션 누락 시 `null`).
 */
export interface PaymentConfirmInput {
  paymentId: string;
  paymentKey: string;
  orderId: string;
  amount: number;
  method: PaymentMethod;
}

/**
 * confirm 진행 상태. 페이지는 status 만으로 시각 분기. error 메시지는
 * 사용자 표시 문구 — 응답 raw 메시지는 hooks 에서 가공한 뒤 넣는다.
 */
export type ConfirmQuery =
  | { status: 'loading' }
  | { status: 'success'; data: PaymentSuccessVM }
  | { status: 'error'; message: string };

/** 승인 직후 짧게 보여주는 "결제 승인 완료!" 화면용. */
export interface PaymentSuccessVM {
  orderId: string;
  amount: number;
  method: PaymentMethod;
}

/** `/payment/fail` 진입 시 쿼리 파싱 + 부수 호출 결과. */
export interface PaymentFailVM {
  code: string;
  message: string;
}

/**
 * `/payment/complete` 진입 시 location.state 로 받는 영수증 데이터.
 * v1 PaymentComplete 가 동일한 키 셋을 사용 — 호환 유지를 위해 동일 shape.
 * (Cart v2 컨테이너 onSuccess 에서는 `{ orderId, amount }` 만 보내므로
 * `method`/`paymentId` 는 옵션. 누락 시 PG 가정 + 마스킹 표시.)
 */
export interface PaymentCompleteVM {
  paymentId?: string;
  orderId: string;
  amount: number;
  method?: PaymentMethod;
  /** 표시용 — 승인 시각. 없으면 페이지가 진입 시각으로 채움. */
  approvedAt?: string;
}
