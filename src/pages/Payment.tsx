import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { readyPayment, confirmPayment } from '../api/payments.api'
import { getWalletBalance } from '../api/wallet.api'
import { unwrapApiData } from '../api/client'
import { useToast } from '../contexts/ToastContext'

declare global {
  interface Window {
    TossPayments: (clientKey: string) => any
  }
}

type Method = 'WALLET' | 'PG' | 'WALLET_PG'

export default function Payment() {
  const location = useLocation()
  const navigate = useNavigate()
  const { toast } = useToast()
  const state = location.state as { orderId: string; totalAmount: number } | null

  const [method, setMethod] = useState<Method>('PG')
  const [walletBalance, setWalletBalance] = useState<number | null>(null)
  const [walletAmountInput, setWalletAmountInput] = useState('')
  const [loading, setLoading] = useState(false)
  const totalAmount = state?.totalAmount ?? 0

  useEffect(() => {
    getWalletBalance().then(res => {
      const wallet = unwrapApiData(res.data)
      setWalletBalance(wallet.balance)
    }).catch(() => {})
  }, [])

  const parsedWalletAmount = Number(walletAmountInput || 0)
  const walletInsufficient = method === 'WALLET' && walletBalance !== null && walletBalance < totalAmount
  const walletPgInvalidRange = method === 'WALLET_PG' && (parsedWalletAmount <= 0 || parsedWalletAmount >= totalAmount)
  const walletPgInsufficient = method === 'WALLET_PG' && walletBalance !== null && parsedWalletAmount > walletBalance

  const payLabel = method !== 'WALLET_PG'
    ? `${totalAmount.toLocaleString()}원 결제하기`
    : `예치금 ${parsedWalletAmount.toLocaleString()}원 + PG ${Math.max(totalAmount - parsedWalletAmount, 0).toLocaleString()}원 결제`

  if (!state) { navigate('/'); return null }

  const handlePay = async () => {
    setLoading(true)
    try {
      const body = method === 'WALLET_PG'
        ? { orderId: state.orderId, paymentMethod: method, walletAmount: parsedWalletAmount }
        : { orderId: state.orderId, paymentMethod: method }

      const res = await readyPayment(body)
      const payment = unwrapApiData(res.data)

      if (method === 'WALLET') {
        await confirmPayment({
          paymentId: payment.paymentId,
          paymentKey: 'WALLET',
          orderId: state.orderId,
          amount: state.totalAmount,
        })
        navigate('/payment/complete', { state: { paymentId: payment.paymentId, orderId: state.orderId, amount: state.totalAmount, method: 'WALLET' } })
      } else {
        const pgAmount = payment.pgAmount ?? state.totalAmount
        sessionStorage.setItem('payment_context', JSON.stringify({
          paymentId: payment.paymentId,
          orderId: state.orderId,
          totalAmount: state.totalAmount,
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
      }
    } catch {
      toast('결제 처리 중 오류가 발생했습니다', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container" style={{ paddingTop: 40, paddingBottom: 80, maxWidth: 680 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 28 }}>결제</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="card" style={{ padding: '20px' }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 14 }}>주문 정보</h2>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 700, color: 'var(--text)', paddingTop: 10, borderTop: '1px solid var(--border)' }}>
            <span>결제 금액</span>
            <span>{state.totalAmount.toLocaleString()}원</span>
          </div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 14 }}>결제 수단</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <label><input type="radio" checked={method === 'PG'} onChange={() => setMethod('PG')} /> 카드 / 계좌이체</label>
            <label><input type="radio" checked={method === 'WALLET'} onChange={() => setMethod('WALLET')} /> 예치금 결제</label>
            <label><input type="radio" checked={method === 'WALLET_PG'} onChange={() => setMethod('WALLET_PG')} /> 복합 결제 (예치금 + 카드)</label>
          </div>

          {method === 'WALLET_PG' && (
            <div style={{ marginTop: 12 }}>
              <input
                className="input"
                value={walletAmountInput}
                onChange={(e) => setWalletAmountInput(e.target.value.replace(/[^\d]/g, ''))}
                placeholder="사용할 예치금 입력"
              />
              <div style={{ marginTop: 6, fontSize: 12, color: 'var(--text-3)' }}>
                PG 결제 예정 금액: {Math.max(state.totalAmount - parsedWalletAmount, 0).toLocaleString()}원
              </div>
              {walletPgInvalidRange && <div style={{ color: 'var(--danger)', fontSize: 12 }}>예치금은 0원 초과, 총액 미만이어야 합니다.</div>}
              {walletPgInsufficient && <div style={{ color: 'var(--danger)', fontSize: 12 }}>보유 예치금을 초과했습니다.</div>}
            </div>
          )}

          <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-3)' }}>
            보유 예치금: {walletBalance === null ? '확인 중...' : `${walletBalance.toLocaleString()}원`}
          </div>
        </div>

        <button className="btn btn-primary btn-full btn-lg" onClick={handlePay} disabled={loading || walletInsufficient || walletPgInvalidRange || walletPgInsufficient}>
          {loading ? '처리 중...' : payLabel}
        </button>
      </div>
    </div>
  )
}
