import { useEffect, useState } from 'react'
import { readyPayment, confirmPayment } from '../api/payments.api'
import { getWalletBalance } from '../api/wallet.api'
import { unwrapApiData } from '../api/client'
import { useToast } from '../contexts/ToastContext'

declare global {
  interface Window {
    TossPayments: (clientKey: string) => any
  }
}

interface Props {
  open: boolean
  orderId: string
  totalAmount: number
  onClose: () => void
  onSuccess: () => void
}

type Method = 'PG' | 'WALLET' | 'WALLET_PG'

export default function PaymentModal({ open, orderId, totalAmount, onClose, onSuccess }: Props) {
  const { toast } = useToast()
  const [method, setMethod] = useState<Method>('PG')
  const [walletBalance, setWalletBalance] = useState<number | null>(null)
  const [walletAmountInput, setWalletAmountInput] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    getWalletBalance()
      .then(r => {
        const wallet = unwrapApiData(r.data)
        setWalletBalance(wallet.balance)
      })
      .catch(() => setWalletBalance(null))
  }, [open])

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  const parsedWalletAmount = Number(walletAmountInput || 0)
  const isWalletPgInvalidRange = method === 'WALLET_PG' && (parsedWalletAmount <= 0 || parsedWalletAmount > totalAmount)
  const isWalletPgInsufficient = method === 'WALLET_PG' && walletBalance !== null && parsedWalletAmount > walletBalance
  const walletInsufficient = method === 'WALLET' && walletBalance !== null && walletBalance < totalAmount
  const walletPgDisabled = method === 'WALLET_PG' && (isWalletPgInvalidRange || isWalletPgInsufficient)
  const payDisabled = loading || walletInsufficient || walletPgDisabled

  const payLabel = method !== 'WALLET_PG'
    ? `${totalAmount.toLocaleString()}원 결제`
    : `예치금 ${parsedWalletAmount.toLocaleString()}원 + PG ${Math.max(totalAmount - parsedWalletAmount, 0).toLocaleString()}원`

  if (!open) return null

  const handlePay = async () => {
    setLoading(true)
    try {
      const readyBody = method === 'WALLET_PG'
        ? { orderId, paymentMethod: method, walletAmount: parsedWalletAmount }
        : { orderId, paymentMethod: method }

      const readyRes = await readyPayment(readyBody)
      const payment = unwrapApiData(readyRes.data)

      if (method === 'WALLET') {
        await confirmPayment({
          paymentId: payment.paymentId,
          paymentKey: 'WALLET',
          orderId,
          amount: totalAmount,
        })
        toast('결제가 완료되었습니다!', 'success')
        onSuccess()
        return
      }

      const pgAmount = payment.pgAmount ?? Math.max(totalAmount - (payment.walletAmount ?? 0), 0)

      if (pgAmount <= 0) {
        await confirmPayment({
          paymentId: payment.paymentId,
          paymentKey: 'WALLET',
          orderId,
          amount: 0,
        })
        toast('결제가 완료되었습니다!', 'success')
        onSuccess()
        return
      }

      sessionStorage.setItem('payment_context', JSON.stringify({
        paymentId: payment.paymentId,
        orderId,
        totalAmount,
        pgAmount,
        walletAmount: payment.walletAmount ?? 0,
        method: payment.paymentMethod,
      }))

      const tossPayments = window.TossPayments('test_ck_GjLJoQ1aVZplbR1KB0MW8w6KYe2R')
      await tossPayments.requestPayment('카드', {
        amount: pgAmount,
        orderId: payment.paymentId,
        orderName: '이벤트 티켓',
        successUrl: `${window.location.origin}/payment/success`,
        failUrl: `${window.location.origin}/payment/fail`,
      })
    } catch (e: any) {
      if (e?.code === 'USER_CANCEL' || e?.code === 'PAY_PROCESS_CANCELED') {
        toast('결제가 취소되었습니다.', 'info')
      } else {
        toast('결제 처리 중 오류가 발생했습니다.', 'error')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}
    >
      <div style={{
        width: '100%', maxWidth: 460,
        background: 'var(--surface)',
        borderRadius: 'var(--r-xl)',
        boxShadow: '0 24px 64px rgba(0,0,0,0.2)',
        overflow: 'hidden',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)' }}>결제</h2>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 'var(--r-md)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-4)', fontSize: 18 }}>✕</button>
        </div>

        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ padding: '14px 16px', background: 'var(--surface-2)', borderRadius: 'var(--r-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 14, color: 'var(--text-2)' }}>총 결제 금액</span>
            <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)' }}>{totalAmount.toLocaleString()}원</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <MethodCard selected={method === 'PG'} onClick={() => setMethod('PG')} title="카드 / 계좌이체" desc="신용카드, 체크카드, 실시간 계좌이체" />
            <MethodCard
              selected={method === 'WALLET'}
              onClick={() => setMethod('WALLET')}
              title="예치금 결제"
              desc={walletBalance === null ? '잔액 확인 중...' : `잔액 ${walletBalance.toLocaleString()}원`}
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ fontSize: 13, color: 'var(--text-2)', fontWeight: 600 }}>사용할 예치금</label>
              <input
                className="input"
                inputMode="numeric"
                value={walletAmountInput}
                onChange={(e) => setWalletAmountInput(e.target.value.replace(/[^\d]/g, ''))}
                placeholder="예: 3000"
              />
              <div style={{ fontSize: 12, color: 'var(--text-3)' }}>
                PG 결제 예정 금액: {Math.max(totalAmount - parsedWalletAmount, 0).toLocaleString()}원
              </div>
              {isWalletPgInvalidRange && (
                <div style={{ fontSize: 12, color: 'var(--danger)' }}>예치금은 0원 초과, 총 결제금액 이하로 입력해주세요.</div>
              )}
              {isWalletPgInsufficient && (
                <div style={{ fontSize: 12, color: 'var(--danger)' }}>보유 예치금을 초과했습니다.</div>
              )}
            </div>
          )}

          {walletInsufficient && (
            <div style={{ padding: '10px 14px', background: 'var(--danger-bg)', borderRadius: 'var(--r-md)', fontSize: 13, color: 'var(--danger-text)' }}>
              ⚠ 예치금 잔액이 부족합니다. 카드 결제 또는 복합 결제를 이용해주세요.
            </div>
          )}
        </div>

        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10, background: 'var(--surface-2)' }}>
          <button className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={onClose} disabled={loading}>취소</button>
          <button className="btn btn-primary" style={{ flex: 2, justifyContent: 'center', fontSize: 15, fontWeight: 700 }} onClick={handlePay} disabled={payDisabled}>
            {loading ? '처리 중...' : payLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

interface MethodCardProps {
  selected: boolean
  onClick: () => void
  title: string
  desc: string
  warn?: boolean
}

function MethodCard({ selected, onClick, title, desc, warn }: MethodCardProps) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
        borderRadius: 'var(--r-md)', border: `1.5px solid ${selected ? 'var(--brand)' : 'var(--border)'}`,
        background: selected ? 'var(--brand-light)' : 'var(--surface)', cursor: 'pointer',
        textAlign: 'left', width: '100%',
      }}
    >
      <div style={{ width: 18, height: 18, borderRadius: '50%', flexShrink: 0, border: `2px solid ${selected ? 'var(--brand)' : 'var(--border-2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {selected && <div style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--brand)' }} />}
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{title}</div>
        <div style={{ fontSize: 12, color: warn ? 'var(--danger)' : 'var(--text-3)' }}>{desc}</div>
      </div>
    </button>
  )
}
