import type { ReactNode } from 'react';

/**
 * PaymentModal 의 결제 수단 라디오 카드.
 *
 * v1 (`src/components/PaymentModal.tsx :: MethodCard`) 의 inline-style 구현을
 * 시맨틱 button + CSS 클래스로 옮겼다. WAI-ARIA 의 `role="radio"` 를 부여해
 * 부모 컨테이너가 `role="radiogroup"` 을 감싸 그룹 시맨틱을 만들 수 있다.
 *
 * 스타일 토큰은 `styles-v2/components/payment-modal.css` 가 담당.
 */

export interface MethodCardProps {
  selected: boolean;
  onClick: () => void;
  title: string;
  /** 보조 설명. ReactNode 허용 — 잔액 표시처럼 강조 span 을 끼울 수 있도록. */
  desc: ReactNode;
  /** 경고 톤 (예: 잔액 부족) — desc 색상을 danger 로 바꾼다. */
  warn?: boolean;
  disabled?: boolean;
}

export function MethodCard({
  selected,
  onClick,
  title,
  desc,
  warn,
  disabled,
}: MethodCardProps) {
  const classes = [
    'payment-method-card',
    selected && 'is-selected',
    warn && 'is-warn',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      disabled={disabled}
      onClick={onClick}
      className={classes}
    >
      <span className="payment-method-card__radio" aria-hidden="true">
        {selected && <span className="payment-method-card__radio-dot" />}
      </span>
      <span className="payment-method-card__body">
        <span className="payment-method-card__title">{title}</span>
        <span className="payment-method-card__desc">{desc}</span>
      </span>
    </button>
  );
}

MethodCard.displayName = 'MethodCard';
