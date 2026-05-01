import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { forceCancelSellerEvent, getSellerEvents, updateSellerEvent } from '../../api/events.api'
import { getSellerEventRefundsPage } from '../../api/refunds.api'
import { extractErrorMessage } from '../../api/client'
import type { SellerEventItem } from '../../api/types'
import { useToast } from '../../contexts/ToastContext'

const REASON_MAX = 500

// 셀러 종료 액션은 두 가지 — 의도가 다르니 라벨/배지를 분리해 보여준다.
//  - CANCELLED       (Action B 판매 중지): 신규 판매만 차단. 기존 구매자 환불 X.
//  - FORCE_CANCELLED (Action A 강제 취소): 이벤트 종료 + 기존 구매자 환불 진행.
const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  DRAFT:            { label: '판매 예정',    cls: 'badge-gray' },
  ON_SALE:          { label: '판매중',      cls: 'badge-green' },
  SOLD_OUT:         { label: '매진',        cls: 'badge-red' },
  SALE_ENDED:       { label: '종료',        cls: 'badge-gray' },
  CANCELLED:        { label: '판매 중지됨',  cls: 'badge-gray' },
  FORCE_CANCELLED:  { label: '강제 취소됨',  cls: 'badge-red' },
}

const STATUS_TABS = ['전체', 'ON_SALE', 'SALE_ENDED', 'CANCELLED', 'FORCE_CANCELLED']
const TAB_LABELS: Record<string, string> = {
  '전체': '전체',
  ON_SALE: '판매중',
  SALE_ENDED: '종료',
  CANCELLED: '판매 중지',
  FORCE_CANCELLED: '강제 취소',
}

export default function SellerDashboard() {
  const { toast } = useToast()
  // 상단 통계 박스용 — 전체 이벤트(한 번만 페치) 기준으로 계산.
  const [allEvents, setAllEvents] = useState<SellerEventItem[]>([])
  // 하단 목록용 — 탭 변경 시마다 갱신.
  const [tabEvents, setTabEvents] = useState<SellerEventItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('전체')

  // 'STOP_SALE'    — Action B 판매 중지 (환불 X). updateSellerEvent({ status: 'CANCELLED' }).
  // 'FORCE_CANCEL' — Action A 강제 취소 (환불 O). forceCancelSellerEvent(...).
  type ActionKind = 'STOP_SALE' | 'FORCE_CANCEL'
  const [actionTarget, setActionTarget] = useState<{ kind: ActionKind; eventId: string; title: string } | null>(null)
  const [cancelReason, setCancelReason] = useState('')
  const [reasonError, setReasonError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchAllEvents = useCallback(async () => {
    try {
      const res = await getSellerEvents({ page: 0, size: 50 })
      setAllEvents(res.data.data.content)
    } catch (err) {
      toast(extractErrorMessage(err) ?? '이벤트 통계 로드 실패', 'error')
    }
  }, [toast])

  const fetchTabEvents = useCallback(async (tab: string) => {
    setLoading(true)
    try {
      const res = await getSellerEvents({
        status: tab === '전체' ? undefined : tab,
        page: 0,
        size: 50,
      })
      setTabEvents(res.data.data.content)
    } catch (err) {
      toast(extractErrorMessage(err) ?? '이벤트 로드 실패', 'error')
    } finally {
      setLoading(false)
    }
  }, [toast])

  // 첫 진입 — stats용 전체 페치.
  useEffect(() => {
    void fetchAllEvents()
  }, [fetchAllEvents])

  // 탭 전환 — 하단 목록만 갱신.
  useEffect(() => {
    void fetchTabEvents(activeTab)
  }, [activeTab, fetchTabEvents])

  const openActionModal = (kind: ActionKind, eventId: string, title: string) => {
    setActionTarget({ kind, eventId, title })
    setCancelReason('')
    setReasonError(null)
  }

  const closeActionModal = () => {
    if (actionLoading) return
    setActionTarget(null)
    setCancelReason('')
    setReasonError(null)
  }

  const submitAction = async () => {
    if (!actionTarget) return
    const { kind, eventId } = actionTarget

    // 강제 취소만 사유 필수 — 판매 중지는 단순 상태 전이라 사유 입력을 받지 않는다.
    let trimmed = ''
    if (kind === 'FORCE_CANCEL') {
      trimmed = cancelReason.trim()
      if (trimmed.length === 0) { setReasonError('취소 사유를 입력해 주세요.'); return }
      if (trimmed.length > REASON_MAX) { setReasonError(`취소 사유는 ${REASON_MAX}자 이내여야 합니다.`); return }
    }

    setActionLoading(eventId)
    try {
      if (kind === 'FORCE_CANCEL') {
        await forceCancelSellerEvent(eventId, { reason: trimmed })
        try {
          const refundRes = await getSellerEventRefundsPage(eventId, { page: 0, size: 100 })
          const refundCount = refundRes.data.totalElements
          const totalRefundAmount = refundRes.data.content.reduce((sum, item) => sum + item.refundAmount, 0)
          toast(`강제 취소 완료 · 환불 ${refundCount}건 (${totalRefundAmount.toLocaleString()}원)`, 'success')
        } catch {
          toast('강제 취소 및 환불 처리가 시작되었습니다', 'success')
        }
      } else {
        await updateSellerEvent(eventId, { status: 'CANCELLED' })
        toast('판매가 중지되었습니다 · 신규 판매만 차단되고 기존 구매자 환불은 진행되지 않습니다', 'success')
      }
      setActionTarget(null)
      setCancelReason('')
      setReasonError(null)
      // 통계와 현재 탭 목록 모두 갱신.
      void fetchAllEvents()
      void fetchTabEvents(activeTab)
    } catch (err) { toast(extractErrorMessage(err) ?? '처리 실패', 'error') }
    finally { setActionLoading(null) }
  }

  // Quick stats — 상단 박스는 항상 전체 기준.
  // 매출/판매수는 실제로 티켓이 판매된 모든 상태(ON_SALE/SOLD_OUT/SALE_ENDED)를
  // 합산해야 한다. 이전 버전은 'ENDED'(존재하지 않는 상태)와 ON_SALE 만 포함해
  // SOLD_OUT/SALE_ENDED 매출이 통째로 누락됐다. CANCELLED 는 환불 대상이라 제외.
  const REVENUE_STATUSES = new Set(['ON_SALE', 'SOLD_OUT', 'SALE_ENDED'])
  const revenueEvents = allEvents.filter(e => REVENUE_STATUSES.has(e.status))
  const totalRevenue = revenueEvents
    .reduce((acc, e) => acc + (e.totalQuantity - e.remainingQuantity) * e.price, 0)
  const onSaleCount = allEvents.filter(e => e.status === 'ON_SALE').length
  const totalSold = revenueEvents
    .reduce((acc, e) => acc + (e.totalQuantity - e.remainingQuantity), 0)
  const events = tabEvents

  return (
    <div style={{ padding: '32px 36px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>판매자 대시보드</h1>
          <p style={{ fontSize: 14, color: 'var(--text-3)' }}>이벤트를 관리하고 판매 현황을 확인하세요</p>
        </div>
        <Link to="/seller/events/create" className="btn btn-primary">
          + 이벤트 등록
        </Link>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 28 }}>
        <div className="stat-card">
          <div className="stat-label">판매중 이벤트</div>
          <div className="stat-value">{onSaleCount}</div>
          <div className="stat-sub">현재 활성</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">총 판매 티켓</div>
          <div className="stat-value">{totalSold.toLocaleString()}</div>
          <div className="stat-sub">전체 이벤트 합산</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">예상 매출</div>
          <div className="stat-value">{totalRevenue >= 10000 ? `${Math.floor(totalRevenue / 10000)}만` : totalRevenue.toLocaleString()}원</div>
          <div className="stat-sub">수수료 차감 전</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 16, borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
        {STATUS_TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding: '8px 14px', fontSize: 13, fontWeight: activeTab === tab ? 600 : 400,
            color: activeTab === tab ? 'var(--brand)' : 'var(--text-3)',
            background: 'none', border: 'none',
            borderBottom: `2px solid ${activeTab === tab ? 'var(--brand)' : 'transparent'}`,
            cursor: 'pointer', marginBottom: -1, transition: 'all 0.15s',
          }}>{TAB_LABELS[tab]}</button>
        ))}
      </div>

      {/* Events table */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>
      ) : events.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎫</div>
          <div className="empty-title">등록된 이벤트가 없습니다</div>
          <Link to="/seller/events/create" className="btn btn-primary" style={{ marginTop: 8 }}>첫 이벤트 등록하기</Link>
        </div>
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <table>
            <thead>
              <tr>
                <th>이벤트명</th>
                <th>상태</th>
                <th>일시</th>
                <th>가격</th>
                <th style={{ textAlign: 'right' }}>판매량/재고량</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {events.map(event => {
                const status = STATUS_MAP[event.status] ?? { label: event.status, cls: 'badge-gray' }
                const isForceCancelled = event.status === 'FORCE_CANCELLED'
                // 강제 취소 건은 결제 완료 구매분 전부 환불되므로 판매=0/잔여=총수량 으로 통일 표시.
                const sold = isForceCancelled ? 0 : event.totalQuantity - event.remainingQuantity
                const remaining = isForceCancelled ? event.totalQuantity : event.remainingQuantity
                return (
                  <tr key={event.eventId}>
                    <td>
                      <div style={{ fontWeight: 500, marginBottom: 2 }}>{event.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-4)', fontFamily: 'var(--font-mono)' }}>
                        #{event.eventId.slice(0, 10)}
                      </div>
                    </td>
                    <td><span className={`badge ${status.cls}`}>{status.label}</span></td>
                    <td style={{ fontSize: 13, color: 'var(--text-3)', whiteSpace: 'nowrap' }}>
                      {new Date(event.eventDateTime).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                    </td>
                    <td style={{ fontWeight: 500 }}>
                      {event.price === 0 ? <span style={{ color: 'var(--success)' }}>무료</span> : `${event.price.toLocaleString()}원`}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span style={{ fontWeight: 600 }}>{sold}</span>
                      <span style={{ color: 'var(--text-3)' }}> / {remaining}</span>
                      <div style={{ height: 4, background: 'var(--surface-2)', borderRadius: 99, marginTop: 4, minWidth: 60 }}>
                        <div style={{
                          height: '100%', borderRadius: 99,
                          background: 'var(--brand)',
                          width: `${Math.min(100, (sold / event.totalQuantity) * 100)}%`,
                        }} />
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <Link to={`/seller/events/${event.eventId}`} className="btn btn-ghost btn-sm">상세</Link>
                        {isForceCancelled ? (
                          <button className="btn btn-secondary btn-sm" disabled title="강제 취소된 이벤트는 수정할 수 없습니다">수정</button>
                        ) : (
                          <Link to={`/seller/events/${event.eventId}/edit`} className="btn btn-secondary btn-sm">수정</Link>
                        )}
                        {event.status === 'ON_SALE' && (
                          <>
                            <button
                              className="btn btn-secondary btn-sm"
                              disabled={actionLoading === event.eventId}
                              onClick={() => openActionModal('STOP_SALE', event.eventId, event.title)}
                              title="신규 판매만 중단합니다. 기존 구매자 환불 X."
                            >
                              {actionLoading === event.eventId && actionTarget?.kind === 'STOP_SALE' ? '...' : '판매 중지'}
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              disabled={actionLoading === event.eventId}
                              onClick={() => openActionModal('FORCE_CANCEL', event.eventId, event.title)}
                              title="이벤트를 즉시 종료하고 결제 완료 구매자에게 환불을 진행합니다."
                            >
                              {actionLoading === event.eventId && actionTarget?.kind === 'FORCE_CANCEL' ? '...' : '강제 취소'}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={actionTarget !== null}
        onClose={closeActionModal}
        title={actionTarget?.kind === 'FORCE_CANCEL' ? '이벤트 강제 취소 (환불 동반)' : '이벤트 판매 중지 (환불 없음)'}
        width={480}
        footer={
          <>
            <button
              className="btn btn-secondary"
              onClick={closeActionModal}
              disabled={actionLoading !== null}
            >
              닫기
            </button>
            <button
              className={actionTarget?.kind === 'FORCE_CANCEL' ? 'btn btn-danger' : 'btn btn-primary'}
              onClick={submitAction}
              disabled={actionLoading !== null}
            >
              {actionLoading
                ? '처리 중...'
                : actionTarget?.kind === 'FORCE_CANCEL'
                  ? '강제 취소 확정'
                  : '판매 중지 확정'}
            </button>
          </>
        }
      >
        {actionTarget && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 14, color: 'var(--text-2)' }}>
              <strong style={{ color: 'var(--text-1)' }}>{actionTarget.title}</strong>
              {actionTarget.kind === 'FORCE_CANCEL' ? (
                <>
                  <br />
                  이벤트가 <strong style={{ color: 'var(--danger)' }}>즉시 종료</strong>되고,
                  결제를 완료한 모든 구매자에게 <strong>자동 환불</strong>이 진행됩니다.
                  <br />
                  되돌릴 수 없습니다.
                </>
              ) : (
                <>
                  <br />
                  <strong>신규 판매만 중단</strong>됩니다. 이미 결제를 완료한 구매자의 티켓·환불에는 <strong>영향이 없습니다</strong>.
                  <br />
                  구매자 환불까지 함께 처리하려면 <strong>강제 취소</strong>를 사용하세요.
                </>
              )}
            </div>

            {actionTarget.kind === 'FORCE_CANCEL' && (
              <>
                <textarea
                  value={cancelReason}
                  onChange={e => {
                    setCancelReason(e.target.value)
                    if (reasonError) setReasonError(null)
                  }}
                  maxLength={REASON_MAX}
                  rows={5}
                  placeholder="취소 사유를 입력해 주세요 (필수, 최대 500자)"
                  disabled={actionLoading !== null}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--r-md)',
                    border: `1px solid ${reasonError ? 'var(--danger)' : 'var(--border)'}`,
                    fontSize: 14,
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    background: 'var(--surface)',
                    color: 'var(--text-1)',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                  <span style={{ color: reasonError ? 'var(--danger)' : 'var(--text-4)' }}>
                    {reasonError ?? '취소 사유는 환불 안내 및 감사 로그에 기록됩니다.'}
                  </span>
                  <span style={{ color: 'var(--text-4)', fontFamily: 'var(--font-mono)' }}>
                    {cancelReason.length} / {REASON_MAX}
                  </span>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

function Modal({ open, onClose, title, children, width = 480, footer }: {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  width?: number
  footer?: React.ReactNode
}) {
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24, animation: 'fadeIn 0.15s ease',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        style={{
          width: '100%', maxWidth: width,
          background: 'var(--surface)', borderRadius: 'var(--r-xl)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          animation: 'slideUp 0.2s ease',
          overflow: 'hidden',
        }}
      >
        {title && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '18px 24px', borderBottom: '1px solid var(--border)',
          }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>{title}</h2>
            <button
              onClick={onClose}
              style={{
                width: 28, height: 28, borderRadius: 'var(--r-md)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-4)', fontSize: 18,
              }}
            >✕</button>
          </div>
        )}
        <div style={{ padding: '20px 24px' }}>{children}</div>
        {footer && (
          <div style={{
            padding: '14px 24px', borderTop: '1px solid var(--border)',
            display: 'flex', justifyContent: 'flex-end', gap: 8,
            background: 'var(--surface-2)',
          }}>{footer}</div>
        )}
      </div>
      <style>{`
        @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(16px); opacity: 0; } to { transform: none; opacity: 1; } }
      `}</style>
    </div>
  )
}
