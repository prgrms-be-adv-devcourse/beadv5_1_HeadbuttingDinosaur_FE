import type { WalletTransactionItem } from '@/api/types';
import { fmtDate } from '@/lib/format';
import type { TxSign, TxType, WalletTxVM } from './types';

type TxEntry = { label: string; sign: TxSign; color: string };

export const TX_TYPE_MAP: Record<Exclude<TxType, 'UNKNOWN'>, TxEntry> = {
  CHARGE: { label: '충전', sign: '+', color: 'var(--success)' },
  USE: { label: '사용', sign: '-', color: 'var(--danger)' },
  REFUND: { label: '환불', sign: '+', color: 'var(--info)' },
  WITHDRAW: { label: '출금', sign: '-', color: 'var(--text-3)' },
};

function shortenId(raw: string): string {
  if (raw.length <= 12) return raw;
  return `${raw.slice(0, 8)}…${raw.slice(-4)}`;
}

function buildRelatedLabel(api: WalletTransactionItem): string {
  if (api.relatedOrderId) return `주문 #${shortenId(api.relatedOrderId)}`;
  if (api.relatedRefundId) return `환불 #${shortenId(api.relatedRefundId)}`;
  return '';
}

export function toWalletTxVM(api: WalletTransactionItem): WalletTxVM {
  const known = (TX_TYPE_MAP as Record<string, TxEntry | undefined>)[api.type];
  const type: TxType = known ? (api.type as TxType) : 'UNKNOWN';
  return {
    transactionId: api.transactionId,
    type,
    amount: api.amount,
    relatedLabel: buildRelatedLabel(api),
    dateLabel: fmtDate(api.createdAt),
  };
}
