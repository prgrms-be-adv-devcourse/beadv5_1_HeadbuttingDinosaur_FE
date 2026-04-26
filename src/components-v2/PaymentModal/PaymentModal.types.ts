/**
 * PaymentModal v2 타입.
 *
 * Cart.plan.md § 7 (결제 플로우) / § 10.3 PR 3 (PaymentModal v2 리스킨).
 *
 * v1 (`src/components/PaymentModal.tsx`) 의 시그니처를 그대로 계승해
 * Cart 컨테이너 (`pages-v2/Cart/index.tsx`) 가 import 한 줄만 v1 → v2 로
 * 교체하면 동작이 보존되도록 한다.
 *
 * `PaymentMethod` 는 `src/api/payments.api.ts :: readyPayment` 의
 * `paymentMethod` 필드와 1:1.
 */

export type PaymentMethod = 'PG' | 'WALLET' | 'WALLET_PG';

export interface PaymentModalProps {
  /** 모달 마운트 토글. false 면 컴포넌트 자체가 null 을 반환. */
  open: boolean;
  /** `createOrder` 응답의 `orderId`. `readyPayment` 페이로드로 그대로 전달. */
  orderId: string;
  /** 결제 총액 (원). 표시 + WALLET_PG 입력값 검증 + Toss SDK 페이로드. */
  totalAmount: number;
  /** 닫기 — backdrop 클릭 / ✕ / Esc / 취소 버튼에서 호출. */
  onClose: () => void;
  /**
   * WALLET 단일 결제 성공 직후 호출 (즉시 결제 완료). PG / WALLET_PG 는
   * Toss SDK 가 브라우저를 redirect 시키므로 모달은 unmount 되며 본 콜백
   * 은 실행되지 않는다 — Cart.plan.md § 7 와 일치.
   */
  onSuccess: () => void;
}
