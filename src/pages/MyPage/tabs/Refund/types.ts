export type RefundStatus =
  | 'REQUESTED'
  | 'APPROVED'
  | 'COMPLETED'
  | 'REJECTED'
  | 'FAILED'
  | 'UNKNOWN';

export interface RefundRowVM {
  refundId: string;
  orderId: string;
  displayRefundId: string;
  displayOrderId: string;
  amountLabel: string;
  status: RefundStatus;
  statusVariant: 'ok' | 'end' | 'sold';
  statusLabel: string;
  dateLabel: string;
}
