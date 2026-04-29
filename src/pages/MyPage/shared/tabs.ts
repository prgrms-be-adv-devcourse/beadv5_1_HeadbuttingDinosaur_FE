import type { IconName } from '@/components';
import type { TabKey } from './types';

export interface TabMeta {
  key: TabKey;
  label: string;
  icon: IconName;
  path: string;
}

export const TABS: readonly TabMeta[] = [
  { key: 'tickets', label: '내 티켓',   icon: 'ticket', path: '/mypage/tickets' },
  { key: 'orders',  label: '주문 내역', icon: 'file',   path: '/mypage/orders' },
  { key: 'wallet',  label: '예치금',    icon: 'wallet', path: '/mypage/wallet' },
  { key: 'refund',  label: '환불 내역', icon: 'refund', path: '/mypage/refund' },
] as const;

export const DEFAULT_TAB: TabKey = 'tickets';

export function isTabKey(value: string | undefined): value is TabKey {
  return value === 'tickets' || value === 'orders' || value === 'wallet' || value === 'refund';
}
