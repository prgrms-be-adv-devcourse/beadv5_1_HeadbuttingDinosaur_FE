/**
 * PaymentModal v2 — main.
 *
 * Cart.plan.md § 7 / § 10.3 PR 3.
 *
 * v1 (`src/components/PaymentModal.tsx`) 의 동작을 1:1 보존하며 v2 primitives
 * (`Button`, `Input`) 와 토큰 매핑된 자체 surface 로 리스킨한다. 종단 결제
 * 시나리오 (WALLET / PG / WALLET_PG) 는 PR 2 와 동일해야 한다 (§ 10.3.6).
 *
 * 결제 실행:
 * - WALLET 단독: `readyPayment` 만 호출 → 즉시 `onSuccess()`.
 * - PG / WALLET_PG: `readyPayment` → sessionStorage 에 confirm 컨텍스트 저장 →
 *   Toss SDK (`requestTossCardPayment`) 가 브라우저를 redirect 시킴. 모달은
 *   unmount 되며 본 컴포넌트는 더 이상 실행되지 않는다.
 *
 * Toss 의 `USER_CANCEL` / `PAY_PROCESS_CANCELED` 는 사용자 의도이므로 info
 * 토스트, 그 외는 error 로 안내. 인터셉터가 흡수하는 401/403 등은 도달하지
 * 않는다 가정 (`apiClient` 인터셉터).
 */

import { useEffect, useId, useState } from 'react';

import { readyPayment } from '@/api/payments.api';
import { Button } from '@/components-v2/Button';
import { Input } from '@/components-v2/Input';
import { useToast } from '@/contexts/ToastContext';

import { MethodCard } from './MethodCard';
import type { PaymentMethod, PaymentModalProps } from './PaymentModal.types';
import { requestTossCardPayment } from './tossSdk';
import { useWalletBalance } from './useWalletBalance';

const TOSS_USER_CANCEL_CODES = new Set(['USER_CANCEL', 'PAY_PROCESS_CANCELED']);

const formatKrw = (n: number): string => `${n.toLocaleString()}원`;

export function PaymentModal({
  open,
  orderId,
  totalAmount,
  onClose,
  onSuccess,
}: PaymentModalProps) {
  const { toast } = useToast();
  const wallet = useWalletBalance(open);
  const [method, setMethod] = useState<PaymentMethod>('PG');
  const [walletAmountInput, setWalletAmountInput] = useState('');
  const [loading, setLoading] = useState(false);
  const titleId = useId();

  // Esc 닫기.
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  const walletBalance = wallet.status === 'success' ? wallet.balance : null;
  const walletDescCopy =
    wallet.status === 'loading' || wallet.status === 'idle'
      ? '잔액 확인 중...'
      : wallet.status === 'error'
        ? '잔액을 불러오지 못했습니다.'
        : `잔액 ${formatKrw(wallet.balance)}`;

  const parsedWalletAmount = Number(walletAmountInput || 0);
  const isWalletPgInvalidRange =
    method === 'WALLET_PG' &&
    (parsedWalletAmount <= 0 || parsedWalletAmount > totalAmount);
  const isWalletPgInsufficient =
    method === 'WALLET_PG' &&
    walletBalance !== null &&
    parsedWalletAmount > walletBalance;
  const walletInsufficient =
    method === 'WALLET' &&
    walletBalance !== null &&
    walletBalance < totalAmount;
  const walletPgDisabled =
    method === 'WALLET_PG' && (isWalletPgInvalidRange || isWalletPgInsufficient);
  const payDisabled = loading || walletInsufficient || walletPgDisabled;

  const payLabel =
    method !== 'WALLET_PG'
      ? `${formatKrw(totalAmount)} 결제`
      : `예치금 ${formatKrw(parsedWalletAmount)} + PG ${formatKrw(Math.max(totalAmount - parsedWalletAmount, 0))}`;

  const handlePay = async () => {
    setLoading(true);
    try {
      const readyBody =
        method === 'WALLET_PG'
          ? { orderId, paymentMethod: method, walletAmount: parsedWalletAmount }
          : { orderId, paymentMethod: method };

      const readyRes = await readyPayment(readyBody);
      const payment = readyRes.data;

      if (method === 'WALLET') {
        toast('결제가 완료되었습니다!', 'success');
        onSuccess();
        return;
      }

      const pgAmount = payment.pgAmount ?? totalAmount;

      // PaymentSuccess / PaymentFail 페이지가 confirm 단계에서 읽는 컨텍스트.
      // v1 과 동일 키로 저장 — 본 PR 의 콜백 페이지는 v1 그대로 (PR 5 에서 v2 화).
      sessionStorage.setItem(
        'payment_context',
        JSON.stringify({
          paymentId: payment.paymentId,
          orderId,
          totalAmount,
          pgAmount,
          walletAmount: payment.walletAmount ?? 0,
          method: payment.paymentMethod,
        }),
      );

      await requestTossCardPayment({
        paymentId: payment.paymentId,
        amount: pgAmount,
        orderName: '이벤트 티켓',
        successUrl: `${window.location.origin}/payment/success`,
        failUrl: `${window.location.origin}/payment/fail`,
      });
    } catch (err: unknown) {
      const code =
        typeof err === 'object' && err !== null && 'code' in err
          ? (err as { code?: string }).code
          : undefined;
      if (code && TOSS_USER_CANCEL_CODES.has(code)) {
        toast('결제가 취소되었습니다.', 'info');
      } else {
        toast('결제 처리 중 오류가 발생했습니다.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="payment-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="payment-modal-surface"
      >
        <header className="payment-modal-header">
          <h2 id={titleId} className="payment-modal-title">
            결제
          </h2>
          <button
            type="button"
            className="payment-modal-close"
            onClick={onClose}
            aria-label="닫기"
          >
            ✕
          </button>
        </header>

        <div className="payment-modal-body">
          <div className="payment-modal-total">
            <span className="payment-modal-total__label">총 결제 금액</span>
            <span className="payment-modal-total__value">
              {formatKrw(totalAmount)}
            </span>
          </div>

          <div className="payment-modal-method-list" role="radiogroup" aria-label="결제 수단">
            <MethodCard
              selected={method === 'PG'}
              onClick={() => setMethod('PG')}
              title="카드 / 계좌이체"
              desc="신용카드, 체크카드, 실시간 계좌이체"
            />
            <MethodCard
              selected={method === 'WALLET'}
              onClick={() => setMethod('WALLET')}
              title="예치금 결제"
              desc={walletDescCopy}
              warn={walletInsufficient}
            />
            <MethodCard
              selected={method === 'WALLET_PG'}
              onClick={() => setMethod('WALLET_PG')}
              title="복합 결제 (예치금 + 카드)"
              desc="예치금을 먼저 차감하고 부족분만 PG 결제"
            />
          </div>

          {method === 'WALLET_PG' && (
            <div className="payment-modal-walletpg">
              <Input
                label="사용할 예치금"
                inputMode="numeric"
                value={walletAmountInput}
                onChange={(e) =>
                  setWalletAmountInput(e.target.value.replace(/[^\d]/g, ''))
                }
                placeholder="예: 3000"
              />
              <div className="payment-modal-walletpg__helper">
                PG 결제 예정 금액:{' '}
                {formatKrw(Math.max(totalAmount - parsedWalletAmount, 0))}
              </div>
              {isWalletPgInvalidRange && (
                <div className="payment-modal-walletpg__error">
                  예치금은 0원 초과, 총 결제금액 이하로 입력해주세요.
                </div>
              )}
              {isWalletPgInsufficient && (
                <div className="payment-modal-walletpg__error">
                  보유 예치금을 초과했습니다.
                </div>
              )}
            </div>
          )}

          {walletInsufficient && (
            <div className="payment-modal-warning" role="alert">
              ⚠ 예치금 잔액이 부족합니다. 카드 결제 또는 복합 결제를 이용해주세요.
            </div>
          )}
        </div>

        <footer className="payment-modal-footer">
          <Button
            variant="ghost"
            size="md"
            disabled={loading}
            onClick={onClose}
            className="payment-modal-footer__cancel"
          >
            취소
          </Button>
          <Button
            variant="primary"
            size="md"
            loading={loading}
            disabled={payDisabled}
            onClick={handlePay}
            className="payment-modal-footer__pay"
          >
            {loading ? '처리 중...' : payLabel}
          </Button>
        </footer>
      </div>
    </div>
  );
}

PaymentModal.displayName = 'PaymentModal';
