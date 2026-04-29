export type OrderStatus =
  | 'CREATED'
  | 'PAYMENT_PENDING'
  | 'PAID'
  | 'CANCELLED'
  | 'REFUNDED'
  | 'UNKNOWN';

export interface OrderRowVM {
  orderId: string;
  displayId: string;
  amountLabel: string;
  status: OrderStatus;
  statusVariant: 'ok' | 'end' | 'sold';
  statusLabel: string;
  dateLabel: string;
}
