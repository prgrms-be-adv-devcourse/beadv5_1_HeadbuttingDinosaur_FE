import { useEffect, useState } from 'react'
import { getAdminMonthlyRevenue, type AdminMonthlyRevenueResponse } from '../../api/admin.api'
import { useToast } from '../../contexts/ToastContext'

const toYearMonth = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`

const fmtDate = (s: string) => s.replace(/-/g, '.')

export default function AdminRevenue() {
  const { toast } = useToast()
  const [yearMonth, setYearMonth] = useState(() => toYearMonth(new Date()))
  const [data, setData] = useState<AdminMonthlyRevenueResponse | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    setData(null)
    getAdminMonthlyRevenue(yearMonth)
      .then(r => setData(r.data))
      .catch(() => toast('수익 데이터를 불러오지 못했습니다.', 'error'))
      .finally(() => setLoading(false))
  }, [yearMonth])

  return (
    <div style={{ padding: '32px 36px' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>월별 수익 조회</h1>
        <p style={{ fontSize: 14, color: 'var(--text-3)' }}>월별 플랫폼 수수료 수익을 확인합니다.</p>
      </div>

      {/* 월 선택 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <label style={{ fontSize: 13, color: 'var(--text-3)', fontWeight: 500 }}>조회 월</label>
        <input
          type="month"
          value={yearMonth}
          max={toYearMonth(new Date())}
          onChange={e => setYearMonth(e.target.value)}
          style={{ padding: '4px 8px', borderRadius: 'var(--r-md)', border: '1px solid var(--border)', fontSize: 13, background: 'var(--surface)', color: 'var(--text-1)' }}
        />
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
          <div className="spinner" />
        </div>
      ) : data ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14, maxWidth: 500 }}>
          <div className="stat-card">
            <div className="stat-label">정산 기간</div>
            <div className="stat-value" style={{ fontSize: 15, fontWeight: 500, color: 'var(--text)' }}>
              {fmtDate(data.periodStartAt)}
            </div>
            <div className="stat-sub">~ {fmtDate(data.periodEndAt)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">총 수수료 수익</div>
            <div className="stat-value" style={{ color: 'var(--brand)' }}>
              {data.totalFeeAmount.toLocaleString()}원
            </div>
          </div>
        </div>
      ) : !loading && (
        <div className="empty-state">
          <div className="empty-title">데이터가 없습니다</div>
          <div className="empty-desc">해당 월의 수익 데이터가 존재하지 않습니다.</div>
        </div>
      )}
    </div>
  )
}
