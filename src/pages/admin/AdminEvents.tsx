// ── AdminEvents ────────────────────────────────────────────────────────────────
import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAdminEvents, forcecancelEvent, getSellerApplications, processSellerApplication, getAdminSettlements, cancelSettlement, paySettlement } from '../../api/admin.api'
import { extractErrorMessage } from '../../api/client'
import type { AdminEventItem, SellerApplicationListItem, AdminSettlementItem } from '../../api/types'
import { useToast } from '../../contexts/ToastContext'

const EVENT_STATUS_MAP: Record<string, { label: string; cls: string }> = {
  DRAFT:     { label: '초안',    cls: 'badge-gray' },
  ON_SALE:   { label: '판매중',  cls: 'badge-green' },
  SOLD_OUT:  { label: '매진',    cls: 'badge-red' },
  ENDED:     { label: '종료',    cls: 'badge-gray' },
  CANCELLED: { label: '취소됨',  cls: 'badge-gray' },
}

export function AdminEvents() {
  const { toast } = useToast()
  const [events, setEvents] = useState<AdminEventItem[]>([])
  const [loading, setLoading] = useState(true)
  const [keyword, setKeyword] = useState('')
  const [draftKeyword, setDraftKeyword] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getAdminEvents({ keyword: keyword || undefined, page: 0, size: 50 })
      setEvents(res.data.content)
    } catch (err) { toast(extractErrorMessage(err) ?? '로드 실패', 'error') }
    finally { setLoading(false) }
  }, [keyword])

  useEffect(() => { fetchEvents() }, [fetchEvents])

  const handleForceCancel = async (eventId: string, title: string) => {
    if (!confirm(`"${title}" 이벤트를 관리자 권한으로 취소할까요?\n참여자 전원 환불이 자동 처리됩니다.`)) return
    setActionLoading(eventId)
    try {
      await forcecancelEvent(eventId)
      toast('관리자 이벤트 취소 및 환불 요청이 접수되었습니다', 'success')
      fetchEvents()
    } catch (err) { toast(extractErrorMessage(err) ?? '처리 실패', 'error') }
    finally { setActionLoading(null) }
  }

  return (
    <div style={{ padding: '32px 36px' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>이벤트 관리</h1>
      </div>

      <form onSubmit={e => { e.preventDefault(); setKeyword(draftKeyword) }}
        style={{ display: 'flex', gap: 8, marginBottom: 20, maxWidth: 400 }}>
        <div className="search-bar" style={{ flex: 1 }}>
          <svg className="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input className="search-input" placeholder="이벤트명 검색"
            value={draftKeyword} onChange={e => setDraftKeyword(e.target.value)} />
        </div>
        <button type="submit" className="btn btn-secondary">검색</button>
      </form>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <table>
            <thead>
              <tr>
                <th>이벤트명</th>
                <th>판매자</th>
                <th>상태</th>
                <th>일시</th>
                <th style={{ textAlign: 'right' }}>총/잔여</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {events.map(event => {
                const status = EVENT_STATUS_MAP[event.status] ?? { label: event.status, cls: 'badge-gray' }
                return (
                  <tr key={event.eventId}>
                    <td>
                      <div style={{ fontWeight: 500, maxWidth: 240 }} className="truncate">{event.title}</div>
                    </td>
                    <td style={{ color: 'var(--text-3)', fontSize: 13 }}>{event.sellerNickname}</td>
                    <td><span className={`badge ${status.cls}`}>{status.label}</span></td>
                    <td style={{ fontSize: 13, color: 'var(--text-3)', whiteSpace: 'nowrap' }}>
                      {new Date(event.eventDateTime).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                    </td>
                    <td style={{ textAlign: 'right', fontSize: 13 }}>
                      {event.totalQuantity} / <span style={{ color: event.remainingQuantity === 0 ? 'var(--danger)' : 'inherit' }}>{event.remainingQuantity}</span>
                    </td>
                    <td>
                      {event.status === 'ON_SALE' && (
                        <button
                          className="btn btn-danger btn-sm"
                          disabled={actionLoading === event.eventId}
                          onClick={() => handleForceCancel(event.eventId, event.title)}
                        >
                          {actionLoading === event.eventId ? '...' : '관리자 취소'}
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ── AdminApplications ──────────────────────────────────────────────────────────
export function AdminApplications() {
  const { toast } = useToast()
  const [apps, setApps] = useState<SellerApplicationListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchApps = async () => {
    setLoading(true)
    try {
      const res = await getSellerApplications()
      setApps(res.data.data.content)
    } catch (err) { toast(extractErrorMessage(err) ?? '로드 실패', 'error') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchApps() }, [])

  const handle = async (id: string, approve: boolean) => {
    const label = approve ? '승인' : '반려'
    if (!confirm(`${label}하시겠습니까?`)) return
    setActionLoading(id)
    try {
      await processSellerApplication(id, approve)
      toast(`${label} 처리되었습니다`, 'success')
      fetchApps()
    } catch (err) { toast(extractErrorMessage(err) ?? '처리 실패', 'error') }
    finally { setActionLoading(null) }
  }

  const STATUS_MAP: Record<string, { label: string; cls: string }> = {
    PENDING:  { label: '대기 중', cls: 'badge-amber' },
    APPROVED: { label: '승인',    cls: 'badge-green' },
    REJECTED: { label: '반려',    cls: 'badge-red' },
  }

  const pendingCount = apps.filter(a => a.status === 'PENDING').length

  return (
    <div style={{ padding: '32px 36px' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>판매자 신청 심사</h1>
        {pendingCount > 0 && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 'var(--r-full)', background: 'var(--warning-bg)', color: 'var(--warning-text)', fontSize: 13, fontWeight: 500 }}>
            ⚠️ 대기 중인 신청 {pendingCount}건
          </div>
        )}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>
      ) : apps.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <div className="empty-title">신청 내역이 없습니다</div>
        </div>
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <table>
            <thead>
              <tr>
                <th>신청자</th>
                <th>상호명</th>
                <th>상태</th>
                <th>신청일</th>
                <th>처리</th>
              </tr>
            </thead>
            <tbody>
              {apps.map(app => {
                const status = STATUS_MAP[app.status] ?? { label: app.status, cls: 'badge-gray' }
                const isLoading = actionLoading === app.applicationId
                return (
                  <tr key={app.applicationId}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{app.nickname}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-4)', fontFamily: 'var(--font-mono)' }}>
                        #{app.userId.slice(0, 10)}
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-2)' }}>{app.businessName}</td>
                    <td><span className={`badge ${status.cls}`}>{status.label}</span></td>
                    <td style={{ fontSize: 13, color: 'var(--text-3)' }}>
                      {new Date(app.createdAt).toLocaleDateString('ko-KR')}
                    </td>
                    <td>
                      {app.status === 'PENDING' && (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-primary btn-sm" disabled={isLoading}
                            onClick={() => handle(app.applicationId, true)}>
                            {isLoading ? '...' : '승인'}
                          </button>
                          <button className="btn btn-danger btn-sm" disabled={isLoading}
                            onClick={() => handle(app.applicationId, false)}>
                            {isLoading ? '...' : '반려'}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ── AdminSettlements ───────────────────────────────────────────────────────────
const SETTLEMENT_STATUS_MAP: Record<string, { label: string; cls: string }> = {
  CONFIRMED:          { label: '지급 대기', cls: 'badge-blue' },
  PENDING_MIN_AMOUNT: { label: '지급 보류', cls: 'badge-amber' },
  CANCELLED:          { label: '취소됨',    cls: 'badge-gray' },
  PAID:               { label: '지급완료',  cls: 'badge-green' },
  PAID_FAILED:        { label: '지급실패',  cls: 'badge-red' },
}

const fmtPeriodDate = (s: string) => s ? s.slice(2).replace(/-/g, '.') : '—'

const toYearMonth = (date: Date) =>
  `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`

const toInputValue = (ym: string) => `${ym.slice(0, 4)}-${ym.slice(4, 6)}`

export function AdminSettlements() {
  const { toast } = useToast()
  const navigate = useNavigate()
  const [settlements, setSettlements] = useState<AdminSettlementItem[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [yearMonth, setYearMonth] = useState(() => toYearMonth(new Date()))

  const fetchSettlements = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getAdminSettlements({ yearMonth, page, size: 20 })
      setSettlements(res.data.content)
      setTotalPages(res.data.totalPages)
      setTotalElements(res.data.totalElements)
    } catch (err) { toast(extractErrorMessage(err) ?? '로드 실패', 'error') }
    finally { setLoading(false) }
  }, [yearMonth, page])

  useEffect(() => { fetchSettlements() }, [fetchSettlements])

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setYearMonth(e.target.value.replace('-', ''))
    setPage(0)
  }

  const handleCancel = async (e: React.MouseEvent, settlementId: string) => {
    e.stopPropagation()
    if (!confirm('정산서를 취소하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return
    setActionLoading(`cancel-${settlementId}`)
    try {
      await cancelSettlement(settlementId)
      toast('정산서가 취소되었습니다', 'success')
      fetchSettlements()
    } catch (err) { toast(extractErrorMessage(err) ?? '취소 처리 실패', 'error') }
    finally { setActionLoading(null) }
  }

  const handlePay = async (e: React.MouseEvent, settlementId: string) => {
    e.stopPropagation()
    if (!confirm('정산금을 지급하시겠습니까?')) return
    setActionLoading(`pay-${settlementId}`)
    try {
      await paySettlement(settlementId)
      toast('정산금 지급이 완료되었습니다', 'success')
      fetchSettlements()
    } catch (err) { toast(extractErrorMessage(err) ?? '지급 처리 실패', 'error') }
    finally { setActionLoading(null) }
  }

  return (
    <div style={{ padding: '32px 36px' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>정산서 관리</h1>
        <p style={{ fontSize: 14, color: 'var(--text-3)' }}>총 {totalElements.toLocaleString()}건</p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <label style={{ fontSize: 13, color: 'var(--text-3)', fontWeight: 500 }}>정산 연월</label>
        <input
          type="month"
          value={toInputValue(yearMonth)}
          onChange={handleMonthChange}
          style={{ padding: '4px 8px', borderRadius: 'var(--r-md)', border: '1px solid var(--border)', fontSize: 13, background: 'var(--surface)', color: 'var(--text-1)' }}
        />
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>
      ) : settlements.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">💰</div>
          <div className="empty-title">정산서가 없습니다</div>
        </div>
      ) : (
        <>
          <div className="card" style={{ overflow: 'hidden' }}>
            <table>
              <thead>
                <tr>
                  <th>정산 기간</th>
                  <th>판매자</th>
                  <th style={{ textAlign: 'right' }}>판매액</th>
                  <th style={{ textAlign: 'right' }}>환불액</th>
                  <th style={{ textAlign: 'right' }}>수수료</th>
                  <th style={{ textAlign: 'right' }}>이월금액</th>
                  <th style={{ textAlign: 'right' }}>실지급액</th>
                  <th>상태</th>
                  <th>정산확정일</th>
                  {/* <th>이월 처리 →</th> */}
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                {settlements.map(s => {
                  const status = SETTLEMENT_STATUS_MAP[s.status] ?? { label: s.status, cls: 'badge-gray' }
                  return (
                    <tr key={s.settlementId}
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/admin/settlements/${s.settlementId}`)}
                    >
                      <td style={{ fontSize: 12, whiteSpace: 'nowrap', fontFamily: 'var(--font-mono)', color: 'var(--text-3)' }}>
                        {fmtPeriodDate(s.periodStart)} ~ {fmtPeriodDate(s.periodEnd)}
                      </td>
                      <td style={{maxWidth: '150px',whiteSpace: 'nowrap',overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.sellerId}</td> 
                      <td style={{ textAlign: 'right', fontSize: 13 }}>{s.totalSalesAmount.toLocaleString()}원</td>
                      <td style={{ textAlign: 'right', fontSize: 13, color: 'var(--danger)' }}>−{s.totalRefundAmount.toLocaleString()}원</td>
                      <td style={{ textAlign: 'right', fontSize: 13, color: 'var(--text-3)' }}>−{s.totalFeeAmount.toLocaleString()}원</td>
                      <td style={{ textAlign: 'right', fontSize: 13, color: 'var(--brand)' }}>
                        {s.carriedInAmount ? `+${s.carriedInAmount.toLocaleString()}원` : '—'}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--brand)' }}>
                        {s.finalSettlementAmount.toLocaleString()}원
                      </td>
                      <td><span className={`badge ${status.cls}`}>{status.label}</span></td>
                      <td style={{ fontSize: 13, color: 'var(--text-3)', whiteSpace: 'nowrap' }}>
                        {s.settledAt ? new Date(s.settledAt).toLocaleDateString('ko-KR') : '—'}
                      </td>
                      {/* <td style={{ fontSize: 11, color: 'var(--text-4)', fontFamily: 'var(--font-mono)' }}>
                        {s.carriedToSettlementId ? `#${s.carriedToSettlementId.slice(0, 8)}` : '—'}
                      </td> */}
                      <td onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', gap: 4 }}>
                          {(() => {
                            const cancelable = actionLoading === null && ['CONFIRMED', 'PENDING_MIN_AMOUNT'].includes(s.status)
                            const payable    = actionLoading === null && ['CONFIRMED', 'PAID_FAILED'].includes(s.status)
                            return (
                              <>
                                <button
                                  className="btn btn-sm"
                                  disabled={!cancelable}
                                  onClick={e => handleCancel(e, s.settlementId)}
                                  style={{
                                    background: cancelable ? 'var(--danger)' : 'var(--surface-2)',
                                    color: cancelable ? '#fff' : 'var(--text-4)',
                                    border: `1px solid ${cancelable ? 'var(--danger)' : 'var(--border)'}`,
                                    cursor: cancelable ? 'pointer' : 'not-allowed',
                                  }}
                                >
                                  {actionLoading === `cancel-${s.settlementId}` ? '...' : '정산취소'}
                                </button>
                                <button
                                  className="btn btn-sm"
                                  disabled={!payable}
                                  onClick={e => handlePay(e, s.settlementId)}
                                  style={{
                                    background: payable ? 'var(--brand)' : 'var(--surface-2)',
                                    color: payable ? '#fff' : 'var(--text-4)',
                                    border: `1px solid ${payable ? 'var(--brand)' : 'var(--border)'}`,
                                    cursor: payable ? 'pointer' : 'not-allowed',
                                  }}
                                >
                                  {actionLoading === `pay-${s.settlementId}` ? '...' : '지급'}
                                </button>
                              </>
                            )
                          })()}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 20 }}>
              <button className="btn btn-secondary btn-sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
                이전
              </button>
              <span style={{ fontSize: 13, color: 'var(--text-3)' }}>{page + 1} / {totalPages}</span>
              <button className="btn btn-secondary btn-sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
                다음
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default AdminEvents
