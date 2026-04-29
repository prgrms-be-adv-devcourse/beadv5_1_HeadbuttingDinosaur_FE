import { useState } from 'react';
import axios from 'axios';
import { Button, Card, Input } from '@/components';
import { withdrawWallet } from '@/api/wallet.api';
import { useToast } from '@/contexts/ToastContext';

const MIN_WITHDRAW = 1_000;

interface WithdrawPanelProps {
  balance: number;
  onCancel: () => void;
  onSuccess: () => void;
}

export function WithdrawPanel({ balance, onCancel, onSuccess }: WithdrawPanelProps) {
  const { toast } = useToast();
  const [amountText, setAmountText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const parsed = Number(amountText.replace(/[^\d]/g, ''));
  const amount = Number.isFinite(parsed) ? parsed : 0;
  const valid = amount >= MIN_WITHDRAW && amount <= balance;

  const handleSubmit = async () => {
    if (amount < MIN_WITHDRAW) {
      toast(`최소 ${MIN_WITHDRAW.toLocaleString()}원 이상 출금 가능합니다`, 'error');
      return;
    }
    if (amount > balance) {
      toast('잔액이 부족합니다', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await withdrawWallet({ amount });
      toast('출금 요청이 완료되었습니다', 'success');
      onSuccess();
    } catch (err: unknown) {
      const message =
        axios.isAxiosError(err) &&
        typeof err.response?.data === 'object' &&
        err.response?.data !== null &&
        'message' in (err.response.data as Record<string, unknown>)
          ? String((err.response.data as { message?: string }).message ?? '')
          : '';
      toast(message || '출금 처리에 실패했습니다', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card variant="solid" padding="md" className="wallet-action-panel">
      <div className="wallet-action-title">출금 금액</div>
      <div className="wallet-action-input">
        <Input
          inputMode="numeric"
          placeholder="출금 금액 (원)"
          value={amountText}
          onChange={(e) => setAmountText(e.target.value.replace(/[^\d]/g, ''))}
          disabled={submitting}
        />
      </div>
      <button
        type="button"
        className="wallet-withdraw-allbtn"
        onClick={() => setAmountText(String(balance))}
        disabled={submitting || balance <= 0}
      >
        전액 출금 ({balance.toLocaleString()}원)
      </button>
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
          {submitting ? '처리 중...' : '출금하기'}
        </Button>
      </div>
    </Card>
  );
}
