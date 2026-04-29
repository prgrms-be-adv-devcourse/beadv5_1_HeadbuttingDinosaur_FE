export type TabKey = 'tickets' | 'orders' | 'wallet' | 'refund' | 'settings';

export interface ProfileVM {
  initial: string;
  nickname: string;
  isOnline: boolean;
  joinedAtLabel: string | null;
}

export type BalanceSlot =
  | { state: 'loading' }
  | { state: 'error' }
  | { state: 'ready'; amount: number };
