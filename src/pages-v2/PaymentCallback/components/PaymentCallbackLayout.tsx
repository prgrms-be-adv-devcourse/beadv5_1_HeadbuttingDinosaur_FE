/**
 * 결제 콜백 3 페이지(PaymentSuccess / PaymentFail / PaymentComplete) 공통
 * 중앙 정렬 레이아웃.
 *
 * Cart.plan.md § 9.1-8. v1 의 `min-height: 80vh; flex; align/justify center;
 * padding: 24` 인라인 패턴을 단일 BEM 컨테이너로 추출 — 페이지마다 같은
 * 시각 위계를 유지한다.
 *
 * 슬롯:
 *  - `icon`        상단 PaymentStatusIcon
 *  - `title`       h1 (성공 화면은 "결제 완료!" 처럼 강조)
 *  - `description` p 본문 안내
 *  - `meta`        보조 라인(예: "오류 코드: ABC", v1 PaymentFail)
 *  - `children`    영수증 카드 같은 카드형 콘텐츠 (선택)
 *  - `actions`     하단 CTA(PaymentActions) (선택)
 *
 * 페이지 자체는 본 레이아웃을 한 번 감싸기만 하면 됨 — Layout(공용 chrome)
 * 안쪽 라우트라 헤더/푸터는 따로 신경 쓸 필요 없음.
 */

import type { ReactNode } from 'react';

export interface PaymentCallbackLayoutProps {
  icon: ReactNode;
  title: string;
  description?: ReactNode;
  meta?: ReactNode;
  children?: ReactNode;
  actions?: ReactNode;
  /** 영수증처럼 정보량이 많은 경우 컨테이너 폭을 넓혀 사용. 기본 400px. */
  size?: 'sm' | 'md';
}

export function PaymentCallbackLayout({
  icon,
  title,
  description,
  meta,
  children,
  actions,
  size = 'sm',
}: PaymentCallbackLayoutProps) {
  return (
    <section className="payment-callback">
      <div
        className={[
          'payment-callback__inner',
          size === 'md' && 'payment-callback__inner--md',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <div className="payment-callback__icon">{icon}</div>
        <h1 className="payment-callback__title">{title}</h1>
        {description && (
          <p className="payment-callback__desc">{description}</p>
        )}
        {meta && <p className="payment-callback__meta">{meta}</p>}
        {children && <div className="payment-callback__content">{children}</div>}
        {actions && <div className="payment-callback__actions">{actions}</div>}
      </div>
    </section>
  );
}
