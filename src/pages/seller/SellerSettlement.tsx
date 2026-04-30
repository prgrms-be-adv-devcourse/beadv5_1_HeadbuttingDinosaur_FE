import { useEffect, useState, useMemo } from 'react'
import { getSellerSettlementByMonth, getSellerSettlementPreview } from '../../api/seller.api'
import { extractErrorMessage } from '../../api/client'
import type { SettlementMonthResponse } from '../../api/types'
import { useToast } from '../../contexts/ToastContext'

interface MonthTab {
  key: string       // 'preview' | 'YYYYMM'
  label: string     // '4월'
  period: string    // '3/26~4/25'
  isPreview: boolean
}

function buildMonthTabs(pastCount = 5): MonthTab[] {
  const now = new Date()
  const curYear = now.getFullYear()
  const curMonth = now.getMonth() + 1 // 1~12

  const tabs: MonthTab[] = []

  for (let i = pastCount; i >= 1; i--) {
    let m = curMonth - i
    let y = curYear
    while (m <= 0) { m += 12; y-- }

    const startM = m === 1 ? 12 : m - 1
    const yyyymm = `${y}${String(m).padStart(2, '0')}`

    tabs.push({
      key: yyyymm,
      label: `${m}월`,
      period: `${startM}/26~${m}/25`,
      isPreview: false,
    })
  }

  const previewStartM = curMonth === 1 ? 12 : curMonth - 1
  tabs.push({
    key: 'preview',
    label: `${curMonth}월`,
    period: `${previewStartM}/26~${curMonth}/25`,
    isPreview: true,
  })

  return tabs
}

export default function SellerSettlement() {
  const { toast } = useToast()
  const tabs = useMemo(() => buildMonthTabs(5), [])
  const [selectedIdx, setSelectedIdx] = useState(tabs.length - 1)
  const [data, setData] = useState<SettlementMonthResponse | null>(null)
  const [loading, setLoading] = useState(true)

  const selected = tabs[selectedIdx]

  // 예정 탭의 정산 확정일 계산 (다음달 1일)
  const previewSettlementLabel = useMemo(() => {
    const now = new Date()
    const next = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    return `${next.getMonth() + 1}월 1일 확정 예정`
  }, [])

  useEffect(() => {
    setLoading(true)
    setData(null)

    const req = selected.isPreview
      ? getSellerSettlementPreview()
      : getSellerSettlementByMonth(selected.key)

    req
      .then(r => setData(r.data))
      .catch((err) =>
        toast(
          extractErrorMessage(err) ?? '정산 데이터를 불러오지 못했습니다',
          'error',
        ),
      )
      .finally(() => setLoading(false))
  }, [selectedIdx])

  return (
    <div style={{ padding: '32px 36px' }}>
      {/* Header + Month Navigator */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>정산 내역</h1>
          <p style={{ fontSize: 14, color: 'var(--text-3)' }}>월별 정산 현황을 확인하세요</p>
        </div>

        {(() => {
          const VISIBLE = 3
          const winStart = Math.max(0, Math.min(selectedIdx - Math.floor(VISIBLE / 2), tabs.length - VISIBLE))
          const visibleTabs = tabs.slice(winStart, winStart + VISIBLE)
          const canPrev = selectedIdx > 0
          const canNext = selectedIdx < tabs.length - 1

          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button onClick={() => setSelectedIdx(i => i - 1)} disabled={!canPrev} style={navArrowStyle(!canPrev)}>
                ‹
              </button>
              <div style={{ display: 'flex', gap: 6 }}>
                {visibleTabs.map((tab) => {
                  const isSelected = tab.key === selected.key
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setSelectedIdx(tabs.indexOf(tab))}
                      style={monthTabStyle(isSelected, tab.isPreview)}
                    >
                      <span style={{ fontWeight: isSelected ? 700 : 400, fontSize: 13 }}>
                        {tab.label}{tab.isPreview ? ' 예정' : ''}
                      </span>
                      <span style={{ fontSize: 10, color: isSelected ? 'var(--brand)' : 'var(--text-3)', marginTop: 2 }}>
                        {tab.period}
                      </span>
                    </button>
                  )
                })}
              </div>
              <button onClick={() => setSelectedIdx(i => i + 1)} disabled={!canNext} style={navArrowStyle(!canNext)}>
                ›
              </button>
            </div>
          )
        })()}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div className="spinner" />
        </div>
      ) : !data ? null : (
        <>
          {/* 예정 데이터 안내 */}
          {selected.isPreview && (
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
              padding: '12px 16px',
              marginBottom: 20,
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: 8,
              fontSize: 13,
              color: '#1e40af',
              lineHeight: 1.6,
            }}>
              <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>ℹ️</span>
              <span>
                현재 표시된 금액은 <strong>정산 예정 금액</strong>으로, 매일 자정 자동 집계됩니다.
                환불·취소 등 이벤트 정산 기간({selected.period}) 내 변동 사항에 따라 최종 정산일({previewSettlementLabel.replace(' 확정 예정', '')})에 확정되는 금액과 다를 수 있습니다.
              </span>
            </div>
          )}

          {/* Summary Cards */}
          {(() => {
            const totalRefund = data.settlementItems.reduce((sum, item) => sum + item.refundAmount, 0)
            return (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, marginBottom: 20 }}>
                <div className="stat-card">
                  <div className="stat-label">총 판매 금액</div>
                  <div className="stat-value">{data.totalSalesAmount.toLocaleString()}원</div>
                  <div className="stat-sub">수수료 차감 전</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">총 환불금</div>
                  <div className="stat-value" style={{ color: totalRefund > 0 ? 'var(--danger)' : 'var(--text-1)' }}>
                    {totalRefund > 0 ? `−${totalRefund.toLocaleString()}` : '0'}원
                  </div>
                  <div className="stat-sub">환불 처리 금액</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">플랫폼 수수료</div>
                  <div className="stat-value" style={{ color: 'var(--danger)' }}>
                    −{data.totalFeeAmount.toLocaleString()}원
                  </div>
                  <div className="stat-sub">부가세 포함</div>
                </div>
                <div className="stat-card" style={{ borderColor: '#f59e0b', borderWidth: 2 }}>
                  <div className="stat-label">이월 정산금</div>
                  <div className="stat-value" style={{ color: '#d97706' }}>
                    +{(data.carriedInAmount ?? 0).toLocaleString()}원
                  </div>
                  <div className="stat-sub">전월 이월 금액</div>
                </div>
                <div className="stat-card" style={{ borderColor: 'var(--brand)', borderWidth: 2 }}>
                  <div className="stat-label">
                    {selected.isPreview ? '정산 예정액' : '최종 정산액'}
                  </div>
                  <div className="stat-value" style={{ color: 'var(--brand)' }}>
                    {data.finalSettlementAmount.toLocaleString()}원
                  </div>
                  <div className="stat-sub">
                    {selected.isPreview ? previewSettlementLabel : '정산 완료'}
                  </div>
                </div>
              </div>
            )
          })()}

          {/* Items Table */}
          {data.settlementItems.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">💰</div>
              <div className="empty-title">
                {selected.isPreview ? '아직 정산 대상 내역이 없습니다' : '정산 내역이 없습니다'}
              </div>
              <div className="empty-desc">
                {selected.isPreview
                  ? '종료된 이벤트의 정산 내역이 매일 자정 업데이트됩니다'
                  : '해당 월에 정산된 이벤트가 없습니다'}
              </div>
            </div>
          ) : (
            <div className="card" style={{ overflow: 'hidden' }}>
              <table>
                <thead>
                  <tr>
                    <th>이벤트</th>
                    <th style={{ textAlign: 'right' }}>판매 금액</th>
                    <th style={{ textAlign: 'right' }}>환불</th>
                    <th style={{ textAlign: 'right' }}>수수료</th>
                    <th style={{ textAlign: 'right' }}>
                      {selected.isPreview ? '정산 예정액' : '정산액'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.settlementItems.map(item => (
                    <tr key={item.eventId}>
                      <td style={{ fontWeight: 500 }}>{item.eventTitle}</td>
                      <td style={{ textAlign: 'right' }}>{item.salesAmount.toLocaleString()}원</td>
                      <td style={{ textAlign: 'right', color: 'var(--danger)' }}>
                        {item.refundAmount > 0 ? `−${item.refundAmount.toLocaleString()}원` : '—'}
                      </td>
                      <td style={{ textAlign: 'right', color: 'var(--danger)' }}>
                        −{item.feeAmount.toLocaleString()}원
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--brand)' }}>
                        {item.settlementAmount.toLocaleString()}원
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function navArrowStyle(disabled: boolean): React.CSSProperties {
  return {
    width: 32,
    height: 32,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    border: '1px solid var(--border)',
    background: 'transparent',
    cursor: disabled ? 'default' : 'pointer',
    opacity: disabled ? 0.3 : 1,
    fontSize: 20,
    flexShrink: 0,
    color: 'var(--text-1)',
  }
}

function monthTabStyle(isSelected: boolean, isPreview: boolean): React.CSSProperties {
  return {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '7px 14px',
    borderRadius: 8,
    border: isSelected
      ? '2px solid var(--brand)'
      : isPreview
        ? '1px dashed var(--border)'
        : '1px solid var(--border)',
    background: isSelected ? 'var(--brand-bg, #eff6ff)' : 'transparent',
    cursor: 'pointer',
    flexShrink: 0,
    color: isSelected ? 'var(--brand)' : 'var(--text-1)',
    transition: 'border-color 0.15s, background 0.15s',
  }
}
