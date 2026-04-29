// EventDetail — clean 2-column: readable info left, sticky purchase panel right.

const { useState: useStateD } = React;

function EventDetail({ id, nav, isLoggedIn, addToCart }) {
  const Icon = window.Icon;
  const event = window.MOCK_EVENTS.find(e => e.eventId === id) ?? window.MOCK_EVENTS[0];
  const [qty, setQty] = useStateD(1);
  const c = window.accent(event.eventId);
  const canBuy = event.status === 'ON_SALE' && event.remainingQuantity > 0;
  const total = event.price * qty;

  const buy = () => {
    if (!isLoggedIn) { nav('login'); return; }
    addToCart(event, qty);
    nav('cart');
  };

  return (
    <div className="editor-scroll">
      <div className="gutter">
        {Array.from({ length: 60 }, (_, i) => (
          <span key={i} className={`ln ${i + 1 === 4 ? 'active' : ''}`}>{i + 1}</span>
        ))}
      </div>
      <div className="editor-body">
        {/* Breadcrumb */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 18, fontFamily: 'var(--font)', fontSize: 13, color: 'var(--text-3)' }}>
          <a onClick={() => nav('events')} style={{ cursor: 'pointer' }}>이벤트</a>
          <span>›</span>
          <span style={{ color: 'var(--text-2)' }} className="truncate">{event.title}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 340px', gap: 28, alignItems: 'start' }}>
          <div>
            {/* Hero banner */}
            <div style={{
              height: 240, borderRadius: 12, marginBottom: 24,
              background: `linear-gradient(135deg, ${c}15 0%, ${c}35 100%)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid var(--border)', position: 'relative',
            }}>
              <span style={{ fontSize: 72, fontFamily: 'var(--font-mono)', color: c, opacity: 0.35 }}>❯_</span>
            </div>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: c, fontWeight: 600, letterSpacing: '0.03em', textTransform: 'uppercase' }}>{event.category}</span>
              {event.status === 'ON_SALE'
                ? <span className="status-chip ok"><span className="dot" />판매중</span>
                : <span className="status-chip sold"><span className="dot" />매진</span>}
            </div>
            <h1 style={{ fontFamily: 'var(--font)', fontSize: 28, fontWeight: 700, lineHeight: 1.3, marginBottom: 14, color: 'var(--text)' }}>{event.title}</h1>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 22 }}>
              {event.techStacks.map(t => <span key={t} className="chip">{t}</span>)}
            </div>

            {/* Info rows */}
            <div className="flat-card" style={{ padding: '4px 0', marginBottom: 24 }}>
              <InfoRow icon="📅" label="일시" value={window.fmtDate(event.eventDateTime)} />
              <InfoRow icon="📍" label="장소" value={event.location} />
              <InfoRow icon="👤" label="주최" value={event.host} />
              <InfoRow icon="🎫" label="잔여 좌석" value={event.remainingQuantity === 0
                ? <span style={{ color: 'var(--danger)' }}>매진되었습니다</span>
                : `${event.remainingQuantity.toLocaleString()}석`} last />
            </div>

            {/* Description */}
            <section>
              <h2 style={{ fontFamily: 'var(--font)', fontSize: 17, fontWeight: 600, marginBottom: 10, color: 'var(--text)' }}>이벤트 소개</h2>
              <p style={{ fontFamily: 'var(--font)', fontSize: 15, color: 'var(--text-2)', lineHeight: 1.75 }}>
                실전형 워크샵과 라이브 코드 리뷰가 이어지는 하루. 현업 엔지니어들의 세션과 네트워킹 기회가 함께 제공됩니다.
                발표자 명단, 상세 스케줄, 핸즈온 자료는 티켓 구매 완료 후 이메일로 안내됩니다.
              </p>
              <ul style={{ marginTop: 14, paddingLeft: 20, listStyle: 'disc', fontFamily: 'var(--font)', fontSize: 14.5, color: 'var(--text-2)', lineHeight: 2 }}>
                <li>실무 중심의 세션 6개와 라이브 Q&amp;A</li>
                <li>참가자 간 네트워킹 런치 및 라이트닝 토크</li>
                <li>기술별 부스 체험 및 기념품 제공</li>
              </ul>
            </section>
          </div>

          {/* Purchase panel */}
          <div style={{ position: 'sticky', top: 12 }}>
            <div className="flat-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: 20 }}>
                <div style={{ fontFamily: 'var(--font)', fontSize: 12, color: 'var(--text-3)', marginBottom: 4 }}>티켓 가격</div>
                <div style={{ fontFamily: 'var(--font)', fontSize: 30, fontWeight: 800, color: event.price === 0 ? 'var(--term-green-dim)' : 'var(--text)', letterSpacing: '-0.01em' }}>
                  {event.price === 0 ? '무료' : `${event.price.toLocaleString()}원`}
                </div>

                {event.price > 0 && canBuy && (
                  <div style={{ marginTop: 20 }}>
                    <div style={{ fontFamily: 'var(--font)', fontSize: 13, fontWeight: 500, color: 'var(--text-2)', marginBottom: 8 }}>수량</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <button onClick={() => setQty(q => Math.max(1, q - 1))} style={qtyBtn}><Icon name="minus" size={13} /></button>
                      <span style={{ fontFamily: 'var(--font)', fontSize: 16, fontWeight: 700, minWidth: 28, textAlign: 'center' }}>{qty}</span>
                      <button onClick={() => setQty(q => Math.min(event.remainingQuantity, q + 1))} style={qtyBtn}><Icon name="plus" size={13} /></button>
                    </div>
                  </div>
                )}

                {event.price > 0 && (
                  <div style={{ padding: '14px 0 0', marginTop: 16, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'var(--font)', fontSize: 14, color: 'var(--text-2)' }}>합계</span>
                    <span style={{ fontFamily: 'var(--font)', fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>{total.toLocaleString()}원</span>
                  </div>
                )}

                <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {canBuy ? (
                    <>
                      <button className="btn btn-primary btn-full btn-lg" onClick={buy} style={{ fontFamily: 'var(--font)', fontSize: 14 }}>
                        바로 구매하기
                      </button>
                      <button className="btn btn-ghost btn-full" onClick={() => { if (!isLoggedIn) nav('login'); else addToCart(event, qty); }} style={{ fontFamily: 'var(--font)' }}>
                        <Icon name="cart" size={13} /> 장바구니에 담기
                      </button>
                    </>
                  ) : (
                    <button className="btn btn-ghost btn-full btn-lg" disabled style={{ fontFamily: 'var(--font)' }}>매진된 이벤트입니다</button>
                  )}
                </div>

                <div style={{ marginTop: 16, padding: '12px 14px', background: 'var(--editor-line)', borderLeft: '3px solid var(--brand)', borderRadius: '0 6px 6px 0', fontFamily: 'var(--font)', fontSize: 12.5, color: 'var(--text-3)', lineHeight: 1.7 }}>
                  결제 완료 후 티켓이 즉시 발급됩니다.<br />
                  행사 7일 전까지 100% 환불이 가능합니다.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value, last }) {
  return (
    <div style={{ display: 'flex', gap: 14, alignItems: 'center', padding: '12px 16px', borderBottom: last ? 'none' : '1px solid var(--border)' }}>
      <span style={{ fontSize: 17, flexShrink: 0 }}>{icon}</span>
      <div style={{ fontFamily: 'var(--font)', fontSize: 12.5, color: 'var(--text-3)', minWidth: 66 }}>{label}</div>
      <div style={{ fontFamily: 'var(--font)', fontSize: 14, color: 'var(--text)', fontWeight: 500 }}>{value}</div>
    </div>
  );
}

const qtyBtn = {
  width: 34, height: 34, borderRadius: 6,
  border: '1px solid var(--border-2)', background: 'var(--editor-bg)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  color: 'var(--text-2)',
};

window.EventDetail = EventDetail;
