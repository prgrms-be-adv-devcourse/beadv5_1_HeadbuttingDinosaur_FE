// MyPage — readable tabs, clean ticket cards, simple tables. No const/JSON.

const { useState: useStateM } = React;

function MyPage({ user, nav }) {
  const Icon = window.Icon;
  const [tab, setTab] = useStateM('tickets');

  const tickets = [
    { id: 't1', title: 'Spring Camp 2026 — Reactive & Cloud Native', status: 'VALID', label: '사용 가능', date: '2026.05.18 14:00', seat: 'A-14' },
    { id: 't2', title: 'React 한국 18차 밋업', status: 'VALID', label: '사용 가능', date: '2026.04.27 19:30', seat: '자율석' },
    { id: 't3', title: 'DevOps 실전 2025 Autumn', status: 'USED', label: '사용 완료', date: '2025.10.21 10:00', seat: 'B-02' },
  ];

  const tabs = [
    { k: 'tickets', l: '내 티켓',   icon: 'ticket' },
    { k: 'orders',  l: '주문 내역', icon: 'file' },
    { k: 'wallet',  l: '예치금',    icon: 'wallet' },
    { k: 'refund',  l: '환불 내역', icon: 'refund' },
  ];

  return (
    <div className="editor-scroll">
      <div className="gutter">
        {Array.from({ length: 60 }, (_, i) => <span key={i} className="ln">{i + 1}</span>)}
      </div>
      <div className="editor-body" style={{ maxWidth: 1000 }}>
        {/* Profile header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 10,
            background: 'var(--brand)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 700,
          }}>{user?.nickname?.charAt(0).toUpperCase()}</div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontFamily: 'var(--font)', fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 2, display: 'flex', alignItems: 'center', gap: 8 }}>
              {user?.nickname}
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, padding: '2px 7px', borderRadius: 4, background: 'var(--term-green-soft)', color: 'var(--term-green-dim)', fontWeight: 600, letterSpacing: '0.05em' }}>● ONLINE</span>
            </h1>
            <p style={{ fontFamily: 'var(--font)', fontSize: 13, color: 'var(--text-3)' }}>
              가입일 2024.03.12 · 예치금 잔액 120,000원
            </p>
          </div>
          <button className="btn btn-ghost btn-sm" style={{ fontFamily: 'var(--font)' }}>프로필 수정</button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, padding: 4, background: 'var(--surface-2)', borderRadius: 8, marginBottom: 22, width: 'fit-content' }}>
          {tabs.map(t => (
            <button key={t.k} onClick={() => setTab(t.k)}
              style={{
                padding: '7px 16px', borderRadius: 6,
                fontFamily: 'var(--font)', fontSize: 13,
                background: tab === t.k ? 'var(--editor-bg)' : 'transparent',
                color: tab === t.k ? 'var(--text)' : 'var(--text-3)',
                fontWeight: tab === t.k ? 600 : 500,
                display: 'flex', alignItems: 'center', gap: 6,
                boxShadow: tab === t.k ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
              }}>
              <Icon name={t.icon} size={13} />
              <span>{t.l}</span>
            </button>
          ))}
        </div>

        {tab === 'tickets' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
              <div style={{ fontFamily: 'var(--font)', fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>티켓 {tickets.length}개</div>
              <div style={{ fontFamily: 'var(--font)', fontSize: 12.5, color: 'var(--text-3)' }}>
                사용 가능 {tickets.filter(t => t.status === 'VALID').length}개 · 사용 완료 {tickets.filter(t => t.status === 'USED').length}개
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 12 }}>
              {tickets.map(t => {
                const valid = t.status === 'VALID';
                return (
                  <div key={t.id} className="flat-card" style={{ padding: 0, overflow: 'hidden', display: 'flex' }}>
                    <div style={{
                      width: 56, background: `linear-gradient(180deg, ${window.accent(t.id)}22, ${window.accent(t.id)}44)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: window.accent(t.id), borderRight: '1px dashed var(--border-2)',
                    }}>
                      <Icon name="ticket" size={20} />
                    </div>
                    <div style={{ flex: 1, padding: 16 }}>
                      <div style={{ marginBottom: 6 }}>
                        <span className={`status-chip ${valid ? 'ok' : 'end'}`}><span className="dot" />{t.label}</span>
                      </div>
                      <div style={{ fontFamily: 'var(--font)', fontSize: 14.5, fontWeight: 600, marginBottom: 6, lineHeight: 1.4, color: 'var(--text)' }}>{t.title}</div>
                      <div style={{ fontFamily: 'var(--font)', fontSize: 12.5, color: 'var(--text-3)', display: 'flex', gap: 14 }}>
                        <span>📅 {t.date}</span>
                        <span>💺 {t.seat}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {tab === 'orders' && (
          <div className="flat-card" style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font)' }}>
              <thead>
                <tr style={{ background: 'var(--surface-2)' }}>
                  {['주문번호', '이벤트', '금액', '상태', '주문일시'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11.5, fontWeight: 600, color: 'var(--text-3)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { id: 'ORD_a8f3', ev: 'Spring Camp 2026', amt: 49000, st: '결제 완료', cls: 'ok', date: '2026.04.14' },
                  { id: 'ORD_b12c', ev: 'GopherCon Korea 2026 ×2', amt: 258000, st: '결제 대기', cls: 'end', date: '2026.04.20' },
                  { id: 'ORD_77d0', ev: 'DevOps 실전 2025 Autumn', amt: 35000, st: '환불 완료', cls: 'sold', date: '2025.10.28' },
                ].map(r => (
                  <tr key={r.id} style={{ borderTop: '1px solid var(--border)' }}>
                    <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--syn-fn)' }}>{r.id}</td>
                    <td style={{ padding: '14px 16px', fontSize: 14, color: 'var(--text)' }}>{r.ev}</td>
                    <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{r.amt.toLocaleString()}원</td>
                    <td style={{ padding: '14px 16px' }}><span className={`status-chip ${r.cls}`}><span className="dot" />{r.st}</span></td>
                    <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--text-3)' }}>{r.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'wallet' && (
          <div className="flat-card" style={{ padding: 28 }}>
            <div style={{ fontFamily: 'var(--font)', fontSize: 13, color: 'var(--text-3)', marginBottom: 6 }}>예치금 잔액</div>
            <div style={{ fontFamily: 'var(--font)', fontSize: 38, fontWeight: 800, color: 'var(--text)', marginBottom: 4, letterSpacing: '-0.01em' }}>
              120,000<span style={{ fontSize: 18, color: 'var(--text-3)', marginLeft: 6, fontWeight: 600 }}>원</span>
            </div>
            <div style={{ fontFamily: 'var(--font)', fontSize: 12.5, color: 'var(--text-3)', marginBottom: 20 }}>
              최종 업데이트 · 2026.04.18 10:23
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary" style={{ fontFamily: 'var(--font)' }}><Icon name="plus" size={13} /> 충전하기</button>
              <button className="btn btn-ghost" style={{ fontFamily: 'var(--font)' }}><Icon name="wallet" size={13} /> 출금 요청</button>
            </div>
          </div>
        )}

        {tab === 'refund' && (
          <div className="stack-trace" style={{ padding: 40, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>💳</div>
            <div className="err-title" style={{ color: 'var(--text)', fontFamily: 'var(--font)', fontSize: 17 }}>환불 내역이 없습니다</div>
            <div className="err-msg" style={{ fontFamily: 'var(--font)', color: 'var(--text-3)' }}>환불은 <strong style={{ color: 'var(--text-2)' }}>내 티켓</strong> 탭에서 각 티켓의 환불 요청 버튼으로 시작할 수 있습니다.</div>
          </div>
        )}
      </div>
    </div>
  );
}

window.MyPage = MyPage;
