/**
 * 결제 콜백 페이지 하단 CTA 버튼 그룹.
 *
 * Cart.plan.md § 9.1-8. 1~2 개 버튼을 가로 정렬로 깔아두는 공통 영역.
 *
 *  - PaymentFail:    "뒤로가기" (ghost) + "홈으로" (primary)
 *  - PaymentComplete: "주문 상세" (ghost) + "내 티켓 보기" (primary)
 *  - PaymentSuccess error: "홈으로 돌아가기" (primary, 단일)
 *
 * v1 의 `'secondary'` 는 v2 Button 에 존재하지 않으므로 `'ghost'` 로 매핑.
 * 단일 버튼일 땐 페이지 폭 가득 채우도록 `full` 자동 적용 — 시각적 톤이
 * EmptyCart CTA 와 일관.
 */

import { Button } from '@/components-v2/Button';

export type PaymentActionVariant = 'primary' | 'ghost';

export interface PaymentAction {
  label: string;
  variant: PaymentActionVariant;
  onClick: () => void;
  disabled?: boolean;
}

export interface PaymentActionsProps {
  actions: PaymentAction[];
}

export function PaymentActions({ actions }: PaymentActionsProps) {
  if (actions.length === 0) return null;
  const single = actions.length === 1;
  return (
    <div
      className={['payment-actions', single && 'payment-actions--single']
        .filter(Boolean)
        .join(' ')}
    >
      {actions.map((a) => (
        <Button
          key={a.label}
          variant={a.variant}
          size="lg"
          full={single}
          disabled={a.disabled}
          onClick={a.onClick}
        >
          {a.label}
        </Button>
      ))}
    </div>
  );
}
