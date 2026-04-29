/**
 * 결제 콜백 상태 아이콘 — `loading` 스피너 / `success` 체크 / `error` X.
 *
 * Cart.plan.md § 9.1-8 (3 페이지 톤 통일). 공용 `Icon` 의 `check`/`x` 글리프
 * 를 그대로 사용하고, loading 은 styles/global.css 의 `@keyframes spin`
 * 을 재사용한 원형 스피너로 표시.
 *
 * v1(`pages/PaymentSuccess.tsx` 외)의 인라인 style 분기와 동일 시각 의도,
 * 단 색·크기·여백은 토큰(--success / --danger) + payment-callback.css 의
 * BEM 클래스로 이전.
 */

import { Icon } from '@/components/Icon';

export type PaymentStatusTone = 'loading' | 'success' | 'error';

export interface PaymentStatusIconProps {
  status: PaymentStatusTone;
  /** 영수증 페이지처럼 더 크게 보여줘야 하는 경우 사용 (기본 64, 큰 사이즈 80). */
  size?: 'md' | 'lg';
}

export function PaymentStatusIcon({
  status,
  size = 'md',
}: PaymentStatusIconProps) {
  const className = [
    'payment-status-icon',
    `payment-status-icon--${status}`,
    size === 'lg' && 'payment-status-icon--lg',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={className} role="presentation">
      {status === 'loading' && (
        <span className="payment-status-icon__spinner" aria-hidden="true" />
      )}
      {status === 'success' && <Icon name="check" size={size === 'lg' ? 36 : 28} />}
      {status === 'error' && <Icon name="x" size={size === 'lg' ? 36 : 28} />}
    </div>
  );
}
