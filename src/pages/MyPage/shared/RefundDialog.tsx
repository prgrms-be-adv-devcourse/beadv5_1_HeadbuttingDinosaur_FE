import { useEffect, useId, useState } from 'react';
import { Button } from '@/components/Button';
import {
  getRefundInfo,
  refundOrder,
  refundTicketByPg,
} from '@/api/refunds.api';
import { extractErrorMessage } from '@/api/client';
import type { RefundInfoResponse } from '@/api/types';
import { useToast } from '@/contexts/ToastContext';

type RefundTarget =
  | { kind: 'ticket'; ticketId: string; eventTitle: string }
  | { kind: 'order'; orderId: string; amountLabel: string; orderLabel: string };

interface RefundDialogProps {
  open: boolean;
  target: RefundTarget;
  onClose: () => void;
  onSuccess: () => void;
}

const formatKrw = (n: number): string => `${n.toLocaleString()}원`;

export function RefundDialog({ open, target, onClose, onSuccess }: RefundDialogProps) {
  const titleId = useId();
  const { toast } = useToast();
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [info, setInfo] = useState<RefundInfoResponse | null>(null);
  const [infoStatus, setInfoStatus] = useState<'idle' | 'loading' | 'error' | 'ready'>('idle');

  useEffect(() => {
    if (!open) {
      setReason('');
      setInfo(null);
      setInfoStatus('idle');
      return;
    }
    if (target.kind !== 'ticket') return;
    let cancelled = false;
    setInfoStatus('loading');
    getRefundInfo(target.ticketId)
      .then((res) => {
        if (cancelled) return;
        setInfo(res.data.data);
        setInfoStatus('ready');
      })
      .catch(() => {
        if (cancelled) return;
        setInfoStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [open, target]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  const ticketRefundDisabled =
    target.kind === 'ticket' && (infoStatus !== 'ready' || (info && !info.refundable));

  const submit = async () => {
    setSubmitting(true);
    try {
      const body = { reason: reason.trim() || '사용자 요청' };
      if (target.kind === 'ticket') {
        await refundTicketByPg(target.ticketId, body);
      } else {
        await refundOrder(target.orderId, body);
      }
      toast('환불 요청이 접수되었습니다.', 'success');
      onSuccess();
      onClose();
    } catch (err: unknown) {
      toast(
        extractErrorMessage(err) ?? '환불 처리 중 오류가 발생했습니다.',
        'error',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="payment-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget && !submitting) onClose();
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
            환불 요청
          </h2>
          <button
            type="button"
            className="payment-modal-close"
            onClick={onClose}
            aria-label="닫기"
            disabled={submitting}
          >
            ✕
          </button>
        </header>

        <div className="payment-modal-body">
          {target.kind === 'ticket' ? (
            <>
              <div className="payment-modal-total">
                <span className="payment-modal-total__label">티켓</span>
                <span className="payment-modal-total__value" style={{ fontSize: 14 }}>
                  {target.eventTitle}
                </span>
              </div>
              {infoStatus === 'loading' && (
                <div className="payment-modal-walletpg__helper">환불 정보 확인 중...</div>
              )}
              {infoStatus === 'error' && (
                <div className="payment-modal-warning" role="alert">
                  환불 정보를 불러오지 못했습니다.
                </div>
              )}
              {info && (
                <>
                  <div className="payment-modal-total">
                    <span className="payment-modal-total__label">결제 금액</span>
                    <span className="payment-modal-total__value">
                      {formatKrw(info.originalAmount)}
                    </span>
                  </div>
                  <div className="payment-modal-total">
                    <span className="payment-modal-total__label">
                      환불 예정 ({Math.round(info.refundRate * 100)}%)
                    </span>
                    <span className="payment-modal-total__value">
                      {formatKrw(info.refundAmount)}
                    </span>
                  </div>
                  {!info.refundable && (
                    <div className="payment-modal-warning" role="alert">
                      ⚠ 이 티켓은 환불할 수 없습니다.
                    </div>
                  )}
                </>
              )}
            </>
          ) : (
            <>
              <div className="payment-modal-total">
                <span className="payment-modal-total__label">주문</span>
                <span className="payment-modal-total__value" style={{ fontSize: 14 }}>
                  {target.orderLabel}
                </span>
              </div>
              <div className="payment-modal-total">
                <span className="payment-modal-total__label">결제 금액</span>
                <span className="payment-modal-total__value">{target.amountLabel}</span>
              </div>
              <div className="payment-modal-walletpg__helper">
                주문 단위로 환불을 요청합니다. 환불 금액은 정책에 따라 산정됩니다.
              </div>
            </>
          )}

          <label className="refund-dialog-reason">
            <span>환불 사유 (선택)</span>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="예: 일정이 맞지 않아 참석이 어렵습니다."
              rows={3}
              disabled={submitting}
            />
          </label>
        </div>

        <footer className="payment-modal-footer">
          <Button
            variant="ghost"
            size="md"
            disabled={submitting}
            onClick={onClose}
            className="payment-modal-footer__cancel"
          >
            취소
          </Button>
          <Button
            variant="primary"
            size="md"
            loading={submitting}
            disabled={Boolean(ticketRefundDisabled) || submitting}
            onClick={submit}
            className="payment-modal-footer__pay"
          >
            {submitting ? '처리 중...' : '환불 요청'}
          </Button>
        </footer>
      </div>
    </div>
  );
}
