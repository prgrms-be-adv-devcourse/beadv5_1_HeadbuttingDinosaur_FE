import type { RefundRowVM } from './types';

export interface RefundColumn {
  key: keyof Pick<
    RefundRowVM,
    'displayRefundId' | 'displayOrderId' | 'amountLabel' | 'statusLabel' | 'dateLabel'
  >;
  label: string;
  align: 'left' | 'right';
}

export const REFUND_COLUMNS: readonly RefundColumn[] = [
  { key: 'displayRefundId', label: '환불번호', align: 'left' },
  { key: 'displayOrderId', label: '주문번호', align: 'left' },
  { key: 'amountLabel', label: '환불 금액', align: 'left' },
  { key: 'statusLabel', label: '상태', align: 'left' },
  { key: 'dateLabel', label: '요청일', align: 'left' },
] as const;
