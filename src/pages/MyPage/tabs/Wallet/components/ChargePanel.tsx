import { useState } from 'react';
import { Button, Card, Input } from '@/components';
import { startWalletCharge } from '@/api/wallet.api';
import { extractErrorMessage } from '@/api/client';
import { requestTossCardPayment } from '@/components/PaymentModal/tossSdk';
import { useToast } from '@/contexts/ToastContext';

const QUICK_AMOUNTS = [10_000, 30_000, 50_000];
const MIN_CHARGE = 1_000;
const MAX_CHARGE = 50_000;
const DAILY_LIMIT = 1_000_000;

interface ChargePanelProps {
  onCancel: () => void;
}

export function ChargePanel({ onCancel }: ChargePanelProps) {
  const { toast } = useToast();
  const [amountText, setAmountText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const parsed = Number(amountText.replace(/[^\d]/g, ''));
  const amount = Number.isFinite(parsed) ? parsed : 0;
  const valid = amount >= MIN_CHARGE && amount <= MAX_CHARGE;

  const handleSubmit = async () => {
    if (amount < MIN_CHARGE) {
      toast(`최소 ${MIN_CHARGE.toLocaleString()}원 이상 충전 가능합니다`, 'error');
      return;
    }
    if (amount > MAX_CHARGE) {
      toast(`1회 최대 ${MAX_CHARGE.toLocaleString()}원까지 충전 가능합니다`, 'error');
      return;
    }
    setSubmitting(true);
    let chargeId: string | undefined;
    let chargedAmount: number | undefined;

    try {
      const res = await startWalletCharge({ amount });
      const data = res.data;
      chargeId = data.chargeId;
      chargedAmount = data.amount;
    } catch (err: unknown) {
      toast(
        extractErrorMessage(err) ??
          '충전 요청 실패. 잠시 후 다시 시도해주세요.',
        'error',
      );
      setSubmitting(false);
      return;
    }

    try {
      sessionStorage.setItem(
        'wallet_charge_context',
        JSON.stringify({ chargeId, amount: chargedAmount }),
      );
      await requestTossCardPayment({
        paymentId: chargeId!,
        amount: chargedAmount!,
        orderName: '예치금 충전',
        successUrl: `${window.location.origin}/wallet/charge/success`,
        failUrl: `${window.location.origin}/wallet/charge/fail`,
      });
      // Toss redirects on success; the line below only runs on cancellation.
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '결제창 실행에 실패했습니다.';
      toast(message, 'error');
      sessionStorage.removeItem('wallet_charge_context');
      setSubmitting(false);
    }
  };

  return (
    <Card variant="solid" padding="md" className="wallet-action-panel">
      <div className="wallet-action-title">충전 금액</div>
      <div className="wallet-action-quicks">
        {QUICK_AMOUNTS.map((a) => {
          const active = amount === a;
          return (
            <button
              key={a}
              type="button"
              className={active ? 'wallet-quick active' : 'wallet-quick'}
              onClick={() => setAmountText(String(a))}
              disabled={submitting}
            >
              {a.toLocaleString()}원
            </button>
          );
        })}
      </div>
      <div className="wallet-action-input">
        <Input
          inputMode="numeric"
          placeholder="직접 입력 (원)"
          value={amountText}
          onChange={(e) => setAmountText(e.target.value.replace(/[^\d]/g, ''))}
          disabled={submitting}
        />
      </div>
      <ul className="wallet-action-notice">
        <li>1회 충전 금액: {MIN_CHARGE.toLocaleString()}원 ~ {MAX_CHARGE.toLocaleString()}원</li>
        <li>일일 충전 한도: {DAILY_LIMIT.toLocaleString()}원</li>
        <li>예치금 환불 수수료: 없음</li>
        <li>예치금 유효기간: 무제한</li>
      </ul>
      <div className="wallet-action-footer">
        <Button variant="ghost" size="md" onClick={onCancel} disabled={submitting}>
          취소
        </Button>
        <Button
          variant="primary"
          size="md"
          onClick={handleSubmit}
          loading={submitting}
          disabled={!valid || submitting}
        >
          {submitting ? '처리 중...' : '충전하기'}
        </Button>
      </div>
    </Card>
  );
}
