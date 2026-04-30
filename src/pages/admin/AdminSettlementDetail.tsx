import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getAdminSettlementDetail } from '../../api/admin.api'
import { extractErrorMessage } from '../../api/client'
import type { AdminSettlementDetailResponse } from '../../api/types'
import { useToast } from '../../contexts/ToastContext'

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  CONFIRMED:          { label: '지급 대기', cls: 'badge-blue' },
  PENDING_MIN_AMOUNT: { label: '이월 보류', cls: 'badge-amber' },
  CANCELLED:          { label: '취소됨',    cls: 'badge-gray' },
  PAID:               { label: '지급완료',  cls: 'badge-green' },
  PAID_FAILED:        { label: '지급실패',  cls: 'badge-red' },
}

const fmtDate = (s: string | null) =>
  s ? new Date(s).toLocaleDateString('ko-KR') : '—'

const fmtPeriod = (start: string, end: string) =>
  `${start.replace(/-/g, '.')} ~ ${end.replace(/-/g, '.')}`

export default function AdminSettlementDetail() {
  const { settlementId } = useParams<{ settlementId: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [detail, setDetail] = useState<AdminSettlementDetailResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!settlementId) return
    setLoading(true)
    getAdminSettlementDetail(settlementId)
      .then(res => setDetail(res.data))
      .catch((err) => toast(extractErrorMessage(err) ?? '로드 실패', 'error'))
      .finally(() => setLoading(false))
  }, [settlementId])

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
        <div className="spinner" />
      </div>
    )
  }

  if (!detail) return null

  const status = STATUS_MAP[detail.status] ?? { label: detail.status, cls: 'badge-gray' }

  return (
    <div style={{ padding: '32px 36px', maxWidth: 960 }}>
      {/* 헤더 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => navigate('/admin/settlements')}
          style={{ flexShrink: 0 }}
        >
          ← 목록
        </button>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>정산서 상세</h1>
          <p style={{ fontSize: 13, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
            {fmtPeriod(detail.periodStart, detail.periodEnd)}
            &nbsp;·&nbsp;
            <span style={{ fontSize: 11, color: 'var(--text-4)' }}>#{detail.settlementId.slice(0, 8)}</span>
          </p>
        </div>
        <span className={`badge ${status.cls}`} style={{ marginLeft: 'auto', fontSize: 13 }}>
          {status.label}
        </span>
      </div>

      {/* 금액 요약 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 28 }}>
        {[
          { label: '총 판매액',    value: detail.totalSalesAmount,    color: 'var(--text-1)' },
          { label: '총 환불액',    value: -detail.totalRefundAmount,  color: 'var(--danger)', prefix: '−' },
          { label: '수수료',       value: -detail.totalFeeAmount,     color: 'var(--text-3)', prefix: '−' },
          { label: '당월 순정산금', value: detail.settlementAmount,    color: 'var(--text-1)' },
          { label: '이월받은 금액', value: detail.carriedInAmount,     color: 'var(--brand)', prefix: '+' },
          { label: '실지급액',     value: detail.finalSettlementAmount, color: 'var(--brand)', bold: true },
        ].map(item => (
          <div key={item.label} className="card" style={{ padding: '14px 18px' }}>
            <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 6 }}>{item.label}</div>
            <div style={{ fontSize: 18, fontWeight: item.bold ? 700 : 500, color: item.color }}>
              {item.prefix && item.value !== 0 ? item.prefix : ''}
              {Math.abs(item.value).toLocaleString()}원
            </div>
          </div>
        ))}
      </div>

      {/* 지급일 / 이월 대상 */}
      {(detail.settledAt || detail.carriedToSettlementId) && (
        <div style={{ display: 'flex', gap: 24, marginBottom: 28, fontSize: 13, color: 'var(--text-3)' }}>
          {detail.settledAt && (
            <span>지급일: <strong style={{ color: 'var(--text-1)' }}>{fmtDate(detail.settledAt)}</strong></span>
          )}
          {detail.carriedToSettlementId && (
            <span>이월된 정산서: <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>#{detail.carriedToSettlementId.slice(0, 8)}</span></span>
          )}
        </div>
      )}

      {/* 이월 출처 정산서 */}
      {detail.carriedInSettlements.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 10 }}>이월 출처 정산서</h2>
          <div className="card" style={{ overflow: 'hidden' }}>
            <table>
              <thead>
                <tr>
                  <th>기간</th>
                  <th style={{ textAlign: 'right' }}>이월금액</th>
                  <th>상태</th>
                </tr>
              </thead>
              <tbody>
                {detail.carriedInSettlements.map(c => {
                  const cs = STATUS_MAP[c.status] ?? { label: c.status, cls: 'badge-gray' }
                  return (
                    <tr key={c.settlementId}
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/admin/settlements/${c.settlementId}`)}
                    >
                      <td style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--text-3)' }}>
                        {fmtPeriod(c.periodStart, c.periodEnd)}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--brand)' }}>
                        {c.finalSettlementAmount.toLocaleString()}원
                      </td>
                      <td><span className={`badge ${cs.cls}`}>{cs.label}</span></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 이벤트별 정산 항목 */}
      <div>
        <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 10 }}>이벤트별 정산 내역</h2>
        {detail.settlementItems.length === 0 ? (
          <div className="empty-state">
            <div className="empty-title">정산 항목이 없습니다</div>
          </div>
        ) : (
          <div className="card" style={{ overflow: 'hidden' }}>
            <table>
              <thead>
                <tr>
                  <th>이벤트</th>
                  <th style={{ textAlign: 'right' }}>판매액</th>
                  <th style={{ textAlign: 'right' }}>환불액</th>
                  <th style={{ textAlign: 'right' }}>수수료</th>
                  <th style={{ textAlign: 'right' }}>정산액</th>
                </tr>
              </thead>
              <tbody>
                {detail.settlementItems.map(item => (
                  <tr key={item.eventId}>
                    <td style={{ fontWeight: 500 }}>{item.eventTitle}</td>
                    <td style={{ textAlign: 'right', fontSize: 13 }}>{item.salesAmount.toLocaleString()}원</td>
                    <td style={{ textAlign: 'right', fontSize: 13, color: 'var(--danger)' }}>−{item.refundAmount.toLocaleString()}원</td>
                    <td style={{ textAlign: 'right', fontSize: 13, color: 'var(--text-3)' }}>−{item.feeAmount.toLocaleString()}원</td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--brand)' }}>{item.settlementAmount.toLocaleString()}원</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
