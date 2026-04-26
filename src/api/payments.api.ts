import { apiClient, ApiResponse, idempotencyConfig } from './client';
import type {
  PaymentRequest, PaymentResponse,
  PaymentConfirmRequest, PaymentConfirmResponse,
  PaymentFailRequest,
} from './types';

/**
 * Cart.plan.md § 9.2-15 / § 10.3 PR 3 — 멱등성 키 부착.
 *
 * `readyPayment` 는 사용자가 결제 버튼을 빠르게 두 번 누르거나, 네트워크
 * retry 가 발생할 때 결제 세션을 중복 생성할 위험이 있다. 호출당 새 키를
 * 발급해 백엔드가 first-write-wins 로 처리하도록 한다.
 *
 * v1 PaymentModal 도 본 함수를 사용 → 헤더만 추가될 뿐 호출 코드는 변동
 * 없음. 백엔드가 키를 인식하지 못하더라도 안전하게 무시되는 추가 헤더.
 */
export const readyPayment = (body: PaymentRequest) =>
  apiClient.post<PaymentResponse>('/payments/ready', body, idempotencyConfig());

export const confirmPayment = (body: PaymentConfirmRequest) =>
  apiClient.post<ApiResponse<PaymentConfirmResponse>>('/payments/confirm', body);

export const failPayment = (body: PaymentFailRequest) =>
  apiClient.post<ApiResponse<void>>('/payments/fail', body);
