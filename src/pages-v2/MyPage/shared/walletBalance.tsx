import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { getWalletBalance } from '@/api/wallet.api';
import { unwrapApiData } from '@/api/client';
import { useAuth } from '@/contexts/AuthContext';
import type { WalletBalanceResponse } from '@/api/types';

export interface WalletBalanceVM {
  amount: number;
  lastFetchedAt: number;
}

export type WalletBalanceState =
  | { status: 'loading' }
  | { status: 'error'; error: Error; refresh: () => void }
  | { status: 'ready'; data: WalletBalanceVM; refresh: () => void };

function toWalletBalanceVM(api: WalletBalanceResponse): WalletBalanceVM {
  return {
    amount: api.balance,
    lastFetchedAt: Date.now(),
  };
}

const WalletBalanceContext = createContext<WalletBalanceState | null>(null);

export function WalletBalanceProvider({ children }: { children: ReactNode }) {
  const { isLoggedIn } = useAuth();
  const [tick, setTick] = useState(0);
  const [state, setState] = useState<WalletBalanceState>({ status: 'loading' });

  const refresh = useCallback(() => {
    setTick((n) => n + 1);
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;
    let cancelled = false;
    setState({ status: 'loading' });
    getWalletBalance()
      .then((res) => {
        if (cancelled) return;
        const data = toWalletBalanceVM(unwrapApiData(res.data));
        setState({ status: 'ready', data, refresh });
      })
      .catch((err) => {
        if (cancelled) return;
        setState({
          status: 'error',
          error: err instanceof Error ? err : new Error(String(err)),
          refresh,
        });
      });
    return () => {
      cancelled = true;
    };
  }, [isLoggedIn, tick, refresh]);

  return (
    <WalletBalanceContext.Provider value={state}>
      {children}
    </WalletBalanceContext.Provider>
  );
}

export function useWalletBalance(): WalletBalanceState {
  const ctx = useContext(WalletBalanceContext);
  if (ctx === null) {
    throw new Error('useWalletBalance must be inside <WalletBalanceProvider>');
  }
  return ctx;
}
