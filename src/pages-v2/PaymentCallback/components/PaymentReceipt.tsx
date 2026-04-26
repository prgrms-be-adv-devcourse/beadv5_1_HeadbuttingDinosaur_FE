/**
 * 결제 완료 영수증 카드.
 *
 * Cart.plan.md § 9.1-8. v1 `pages/PaymentComplete.tsx` 의 인라인 스타일
 * `Row` 를 v2 톤으로 이전 — 라벨/값 페어를 BEM 으로 표시하고 카드 자체는
 * 공용 `Card variant="solid"` 를 사용한다.
 *
 * 값은 string 또는 ReactNode — 주문번호처럼 모노스페이스 마스킹이 필요한
 * 케이스를 위해 row 단위 `mono` 옵션 제공. 포맷(원화/일시) 책임은 호출자
 * (페이지 컴포넌트)로 둔다.
 */

import type { ReactNode } from 'react';

import { Card } from '@/components-v2/Card';

export interface PaymentReceiptRow {
  label: string;
  value: ReactNode;
  bold?: boolean;
  /** 주문번호 등 식별자 라인에 모노스페이스/축약 스타일 적용. */
  mono?: boolean;
}

export interface PaymentReceiptProps {
  rows: PaymentReceiptRow[];
}

export function PaymentReceipt({ rows }: PaymentReceiptProps) {
  return (
    <Card variant="solid" className="payment-receipt">
      <dl className="payment-receipt__list">
        {rows.map((row) => {
          const valueClass = [
            'payment-receipt__value',
            row.bold && 'payment-receipt__value--bold',
            row.mono && 'payment-receipt__value--mono',
          ]
            .filter(Boolean)
            .join(' ');
          return (
            <div className="payment-receipt__row" key={row.label}>
              <dt className="payment-receipt__label">{row.label}</dt>
              <dd className={valueClass}>{row.value}</dd>
            </div>
          );
        })}
      </dl>
    </Card>
  );
}
