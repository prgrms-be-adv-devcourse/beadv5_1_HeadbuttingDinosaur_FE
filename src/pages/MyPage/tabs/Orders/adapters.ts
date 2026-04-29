import type { OrderItem } from '@/api/types';
import { fmtDate } from '@/lib/format';
import type { OrderRowVM, OrderStatus } from './types';

type StatusEntry = { variant: OrderRowVM['statusVariant']; label: string };

export const ORDER_STATUS_MAP: Record<Exclude<OrderStatus, 'UNKNOWN'>, StatusEntry> = {
  CREATED: { variant: 'end', label: '주문 생성' },
  PAYMENT_PENDING: { variant: 'end', label: '결제 대기' },
  PAID: { variant: 'ok', label: '결제 완료' },
  CANCELLED: { variant: 'sold', label: '취소됨' },
  REFUNDED: { variant: 'sold', label: '환불 완료' },
};

export function shortenOrderId(raw: string): string {
  if (raw.length <= 12) return raw;
  return `${raw.slice(0, 8)}…${raw.slice(-4)}`;
}

function fmtOrderAmount(total: number): string {
  return total === 0 ? '0원' : `${total.toLocaleString()}원`;
}

export function toOrderRowVM(api: OrderItem): OrderRowVM {
  const known = (ORDER_STATUS_MAP as Record<string, StatusEntry | undefined>)[api.status];
  const status: OrderStatus = known ? (api.status as OrderStatus) : 'UNKNOWN';
  return {
    orderId: api.orderId,
    displayId: shortenOrderId(api.orderId),
    amountLabel: fmtOrderAmount(api.totalAmount),
    status,
    statusVariant: known?.variant ?? 'end',
    statusLabel: known?.label ?? api.status,
    dateLabel: fmtDate(api.createdAt),
  };
}
