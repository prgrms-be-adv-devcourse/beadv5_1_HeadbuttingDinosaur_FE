/**
 * 결제 모달 진입 시 1회 wallet 잔액을 조회하는 훅.
 *
 * v1 (`src/components/PaymentModal.tsx`) 의 `useEffect(() => getWalletBalance...)`
 * 로컬 로직을 v2 모달 외부로 분리. 모달이 닫힌 동안에는 호출하지 않고,
 * 다시 열릴 때마다 재조회한다 (잔액이 직전 결제로 변동될 수 있음).
 *
 * 실패 시 `null` 로 떨어뜨리고 토스트는 띄우지 않는다 — wallet 조회 실패가
 * 곧 결제 불가가 아니므로 (PG 단독 결제는 가능) 모달 본체에서
 * "잔액 확인 중..." 폴백 카피로 흡수.
 *
 * Cart.plan.md § 7 / § 10.3 PR 3 — PaymentModal v2 리스킨.
 */

import { useEffect, useState } from 'react';

import { unwrapApiData } from '@/api/client';
import { getWalletBalance } from '@/api/wallet.api';

export type WalletBalanceState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; balance: number }
  | { status: 'error' };

export function useWalletBalance(open: boolean): WalletBalanceState {
  const [state, setState] = useState<WalletBalanceState>({ status: 'idle' });

  useEffect(() => {
    if (!open) {
      setState({ status: 'idle' });
      return;
    }
    let cancelled = false;
    setState({ status: 'loading' });
    getWalletBalance()
      .then((res) => {
        if (cancelled) return;
        const wallet = unwrapApiData(res.data);
        setState({ status: 'success', balance: wallet.balance });
      })
      .catch(() => {
        if (cancelled) return;
        setState({ status: 'error' });
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  return state;
}
