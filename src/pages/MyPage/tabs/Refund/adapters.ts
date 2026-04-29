import type { RefundItem } from '@/api/types';
import { fmtDate } from '@/lib/format';
import type { RefundRowVM, RefundStatus } from './types';

type StatusEntry = { variant: RefundRowVM['statusVariant']; label: string };

export const REFUND_STATUS_MAP: Record<Exclude<RefundStatus, 'UNKNOWN'>, StatusEntry> = {
  REQUESTED: { variant: 'end', label: '처리 중' },
  APPROVED: { variant: 'end', label: '처리 중' },
  COMPLETED: { variant: 'ok', label: '완료' },
  REJECTED: { variant: 'sold', label: '거절됨' },
  FAILED: { variant: 'sold', label: '취소됨' },
};

export function shortenId(raw: string): string {
  if (raw.length <= 12) return raw;
  return `${raw.slice(0, 8)}…${raw.slice(-4)}`;
}

function fmtRefundAmount(amount: number): string {
  return amount === 0 ? '0원' : `${amount.toLocaleString()}원`;
}

export function toRefundRowVM(api: RefundItem): RefundRowVM {
  const known = (REFUND_STATUS_MAP as Record<string, StatusEntry | undefined>)[api.status];
  const status: RefundStatus = known ? (api.status as RefundStatus) : 'UNKNOWN';
  return {
    refundId: api.refundId,
    orderId: api.orderId,
    displayRefundId: shortenId(api.refundId),
    displayOrderId: shortenId(api.orderId),
    amountLabel: fmtRefundAmount(api.refundAmount),
    status,
    statusVariant: known?.variant ?? 'end',
    statusLabel: known?.label ?? api.status,
    dateLabel: fmtDate(api.requestedAt),
  };
}
