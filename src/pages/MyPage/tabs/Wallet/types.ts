export type TxType = 'CHARGE' | 'USE' | 'REFUND' | 'WITHDRAW' | 'UNKNOWN';

export type TxSign = '+' | '-';

export interface WalletTxVM {
  transactionId: string;
  type: TxType;
  amount: number;
  relatedLabel: string;
  dateLabel: string;
}
