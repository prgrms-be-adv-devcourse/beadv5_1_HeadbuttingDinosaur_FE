import type { IconName } from '@/components';
import type { TabKey } from './types';

export interface TabMeta {
  key: TabKey;
  label: string;
  icon: IconName;
  path: string;
}

export const TABS: readonly TabMeta[] = [
  { key: 'tickets',  label: '내 티켓',   icon: 'ticket',   path: '/mypage/tickets' },
  { key: 'orders',   label: '주문 내역', icon: 'file',     path: '/mypage/orders' },
  { key: 'wallet',   label: '예치금',    icon: 'wallet',   path: '/mypage/wallet' },
  { key: 'refund',   label: '환불 내역', icon: 'refund',   path: '/mypage/refund' },
  { key: 'settings', label: '설정',      icon: 'settings', path: '/mypage/settings' },
] as const;

export const DEFAULT_TAB: TabKey = 'tickets';

const TAB_KEYS: ReadonlySet<string> = new Set(TABS.map((t) => t.key));

export function isTabKey(value: string | undefined): value is TabKey {
  return value !== undefined && TAB_KEYS.has(value);
}
