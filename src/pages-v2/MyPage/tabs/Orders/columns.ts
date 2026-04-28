import type { OrderRowVM } from './types';

export interface OrderColumn {
  key: keyof Pick<OrderRowVM, 'displayId' | 'amountLabel' | 'statusLabel' | 'dateLabel'>;
  label: string;
  align: 'left' | 'right';
}

export const ORDER_COLUMNS: readonly OrderColumn[] = [
  { key: 'displayId', label: '주문번호', align: 'left' },
  { key: 'amountLabel', label: '금액', align: 'left' },
  { key: 'statusLabel', label: '상태', align: 'left' },
  { key: 'dateLabel', label: '주문일시', align: 'left' },
] as const;
