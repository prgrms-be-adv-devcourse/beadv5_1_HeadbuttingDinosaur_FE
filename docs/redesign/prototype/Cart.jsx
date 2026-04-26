// Cart — clean list + sticky summary. IDE flavor only in file-tab header.

const { useState: useStateC } = React;

function Cart({ nav, cart, setCart }) {
  const Icon = window.Icon;
  const items = cart;
  const total = items.reduce((s, i) => s + i.qty * i.price, 0);

  const setQty = (id, q) => setCart(xs => xs.map(i => i.eventId === id ? { ...i, qty: Math.max(1, q) } : i));
  const remove = id => setCart(xs => xs.filter(i => i.eventId !== id));

  return (
    <div className="editor-scroll">
      <div className="gutter">
        {Array.from({ length: 50 }, (_, i) => <span key={i} className="ln">{i + 1}</span>)}
      </div>
      <div className="editor-body" style={{ maxWidth: 980 }}>
        <h1 style={{ fontFamily: 'var(--font)', fontSize: 26, fontWeight: 700, marginBottom: 6, color: 'var(--text)' }}>장바구니</h1>
        <p style={{ fontFamily: 'var(--font)', fontSize: 14, color: 'var(--text-3)', marginBottom: 22 }}>
          담긴 티켓 {items.length}개 · 결제 전 최종 수량을 확인해주세요.
        </p>

        {items.length === 0 ? (
          <div className="stack-trace" style={{ padding: 40, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>🛒</div>
            <div className="err-title" style={{ color: 'var(--text)', fontFamily: 'var(--font)', fontSize: 17 }}>장바구니가 비어있습니다</div>
            <div className="err-msg" style={{ fontFamily: 'var(--font)', color: 'var(--text-3)', marginBottom: 18 }}>마음에 드는 이벤트를 찾아 티켓을 담아보세요.</div>
            <button className="btn btn-primary" style={{ fontFamily: 'var(--font)' }} onClick={() => nav('events')}>이벤트 둘러보기</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 320px', gap: 20, alignItems: 'start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {items.map(item => (
                <div key={item.eventId} className="flat-card" style={{ padding: 16, display: 'flex', gap: 14, alignItems: 'center' }}>
                  <div style={{
                    width: 72, height: 72, borderRadius: 8, flexShrink: 0,
                    background: `linear-gradient(135deg, ${window.accent(item.eventId)}18, ${window.accent(item.eventId)}38)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: window.accent(item.eventId), fontFamily: 'var(--font-mono)', fontSize: 22, opacity: 0.8,
                  }}>&lt;/&gt;</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--font)', fontSize: 15, fontWeight: 600, marginBottom: 4, color: 'var(--text)' }}>{item.title}</div>
                    <div style={{ fontFamily: 'var(--font)', fontSize: 12.5, color: 'var(--text-3)' }}>📅 {item.date}</div>
                    <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button onClick={() => setQty(item.eventId, item.qty - 1)} style={qtyBtnSm}><Icon name="minus" size={11} /></button>
                      <span style={{ fontFamily: 'var(--font)', minWidth: 20, textAlign: 'center', fontWeight: 600 }}>{item.qty}</span>
                      <button onClick={() => setQty(item.eventId, item.qty + 1)} style={qtyBtnSm}><Icon name="plus" size={11} /></button>
                      <span style={{ flex: 1 }} />
                      <button onClick={() => remove(item.eventId)} className="btn btn-ghost btn-sm" style={{ fontFamily: 'var(--font)' }}><Icon name="trash" size={12} /> 삭제</button>
                    </div>
                  </div>
                  <div style={{ fontFamily: 'var(--font)', fontSize: 16, fontWeight: 700, textAlign: 'right', minWidth: 96, color: 'var(--text)' }}>
                    {(item.qty * item.price).toLocaleString()}원
                  </div>
                </div>
              ))}
            </div>

            <div className="flat-card" style={{ padding: 20, position: 'sticky', top: 12 }}>
              <h3 style={{ fontFamily: 'var(--font)', fontSize: 16, fontWeight: 600, marginBottom: 14, color: 'var(--text)' }}>주문 요약</h3>
              <Row label="상품 합계" value={`${total.toLocaleString()}원`} />
              <Row label="수수료" value="0원" />
              <Row label="할인" value="0원" />
              <div style={{ height: 1, background: 'var(--border)', margin: '14px 0' }} />
              <Row label="총 결제금액" value={`${total.toLocaleString()}원`} bold />
              <button className="btn btn-primary btn-full btn-lg" style={{ marginTop: 16, fontFamily: 'var(--font)' }}
                onClick={() => alert('결제가 완료되었습니다! (프로토타입)')}>
                결제하기
              </button>
              <p style={{ marginTop: 10, fontFamily: 'var(--font)', fontSize: 12, color: 'var(--text-3)', lineHeight: 1.6 }}>
                결제 후 티켓은 즉시 발급되며, 행사 7일 전까지 전액 환불이 가능합니다.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const qtyBtnSm = {
  width: 28, height: 28, borderRadius: 6,
  border: '1px solid var(--border-2)', background: 'var(--editor-bg)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  color: 'var(--text-2)',
};

function Row({ label, value, bold }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'var(--font)', fontSize: bold ? 15 : 13.5, marginBottom: 8, color: bold ? 'var(--text)' : 'var(--text-2)', fontWeight: bold ? 700 : 400 }}>
      <span>{label}</span><span>{value}</span>
    </div>
  );
}

window.Cart = Cart;
