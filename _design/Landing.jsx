// Landing — first-impression page. Developer-toned hero with terminal,
// key stats, category grid, featured events, and a clear CTA.

const { useState: useStateH, useEffect: useEffectH } = React;

function TypedTerminal() {
  const Icon = window.Icon;
  const lines = [
    { prompt: '~', cmd: 'devticket search --stack=react --near=seoul', out: '→ 12개의 이벤트를 찾았어요' },
    { prompt: '~', cmd: 'devticket book "React Korea 18차 밋업"',       out: '✓ 티켓 1매가 발급되었습니다' },
  ];
  const [shown, setShown] = useStateH(0);
  const [typed, setTyped] = useStateH('');
  const [showOut, setShowOut] = useStateH(false);

  useEffectH(() => {
    if (shown >= lines.length) return;
    const cur = lines[shown].cmd;
    if (typed.length < cur.length) {
      const t = setTimeout(() => setTyped(cur.slice(0, typed.length + 1)), 38);
      return () => clearTimeout(t);
    }
    if (!showOut) {
      const t = setTimeout(() => setShowOut(true), 320);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => { setShown(s => s + 1); setTyped(''); setShowOut(false); }, 1600);
    return () => clearTimeout(t);
  }, [typed, shown, showOut]);

  useEffectH(() => {
    if (shown >= lines.length) {
      const t = setTimeout(() => { setShown(0); setTyped(''); setShowOut(false); }, 2200);
      return () => clearTimeout(t);
    }
  }, [shown]);

  return (
    <div style={{
      background: 'var(--editor-bg)', border: '1px solid var(--border)',
      borderRadius: 10, overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.08)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px',
        background: 'var(--chrome)', borderBottom: '1px solid var(--border)',
      }}>
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#FF5F56' }} />
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#FFBD2E' }} />
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#27C93F' }} />
        <span style={{ marginLeft: 10, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)' }}>
          devticket — zsh — 88×20
        </span>
      </div>
      <div style={{ padding: '16px 18px', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-2)', lineHeight: 1.9, minHeight: 150 }}>
        {lines.slice(0, shown).map((l, i) => (
          <div key={i}>
            <div><span style={{ color: 'var(--term-green)' }}>❯</span> <span style={{ color: 'var(--text-4)' }}>{l.prompt}</span> <span style={{ color: 'var(--text)' }}>{l.cmd}</span></div>
            <div style={{ color: 'var(--text-3)', paddingLeft: 14 }}>{l.out}</div>
          </div>
        ))}
        {shown < lines.length && (
          <div>
            <div>
              <span style={{ color: 'var(--term-green)' }}>❯</span> <span style={{ color: 'var(--text-4)' }}>{lines[shown].prompt}</span>{' '}
              <span style={{ color: 'var(--text)' }}>{typed}</span>
              <span style={{ display: 'inline-block', width: 7, height: 14, background: 'var(--term-green)', marginLeft: 2, verticalAlign: 'middle', animation: 'blink 1s steps(2,end) infinite' }} />
            </div>
            {showOut && <div style={{ color: 'var(--text-3)', paddingLeft: 14 }}>{lines[shown].out}</div>}
          </div>
        )}
      </div>
      <style>{`@keyframes blink { 50% { opacity: 0; } }`}</style>
    </div>
  );
}

function Stat({ num, unit, label, hint }) {
  return (
    <div style={{
      padding: '18px 20px', border: '1px solid var(--border)', borderRadius: 10,
      background: 'var(--surface)',
    }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-4)', marginBottom: 6, letterSpacing: '0.04em' }}>{hint}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 2 }}>
        <span style={{ fontFamily: 'var(--font)', fontSize: 30, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em' }}>{num}</span>
        <span style={{ fontFamily: 'var(--font)', fontSize: 14, color: 'var(--text-3)', fontWeight: 500 }}>{unit}</span>
      </div>
      <div style={{ fontFamily: 'var(--font)', fontSize: 13, color: 'var(--text-2)' }}>{label}</div>
    </div>
  );
}

function CategoryTile({ cat, count, icon, onClick, color }) {
  return (
    <button onClick={onClick} style={{
      textAlign: 'left', padding: '16px 18px', borderRadius: 10,
      border: '1px solid var(--border)', background: 'var(--surface)',
      cursor: 'pointer', transition: 'all 0.15s',
      display: 'flex', flexDirection: 'column', gap: 8,
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = ''; }}>
      <div style={{
        width: 34, height: 34, borderRadius: 8, background: `${color}18`, color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700,
      }}>{icon}</div>
      <div style={{ fontFamily: 'var(--font)', fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>{cat}</div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, color: 'var(--text-4)' }}>{count}개 이벤트</div>
    </button>
  );
}

function FeaturedRow({ ev, idx, onClick }) {
  const c = window.accent(ev.eventId);
  const lowStock = ev.status === 'ON_SALE' && ev.remainingQuantity < 10 && ev.remainingQuantity > 0;
  const sold = ev.status === 'SOLD_OUT';
  return (
    <div onClick={onClick} style={{
      display: 'grid', gridTemplateColumns: '36px 56px 1fr auto', gap: 14, alignItems: 'center',
      padding: '14px 16px', borderRadius: 10, cursor: 'pointer',
      border: '1px solid var(--border)', background: 'var(--surface)',
      transition: 'all 0.12s',
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = c; e.currentTarget.style.background = 'var(--editor-line)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--surface)'; }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-4)' }}>
        {String(idx + 1).padStart(2, '0')}
      </div>
      <div style={{
        width: 48, height: 48, borderRadius: 8,
        background: `linear-gradient(135deg, ${c}20, ${c}45)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: c, fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 700,
      }}>&lt;/&gt;</div>
      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: c, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>#{ev.category}</span>
          {sold ? <span className="status-chip sold"><span className="dot" />매진</span>
            : lowStock ? <span className="status-chip sold"><span className="dot" />{ev.remainingQuantity}석</span>
            : <span className="status-chip ok"><span className="dot" />판매중</span>}
        </div>
        <div style={{ fontFamily: 'var(--font)', fontSize: 14, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {ev.title}
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, color: 'var(--text-4)', marginTop: 2 }}>
          {window.fmtDate(ev.eventDateTime).slice(0, 10)} · {ev.techStacks.slice(0, 3).join(' · ')}
        </div>
      </div>
      <div style={{ fontFamily: 'var(--font)', fontSize: 15, fontWeight: 700, color: ev.price === 0 ? 'var(--term-green-dim)' : 'var(--text)', whiteSpace: 'nowrap' }}>
        {ev.price === 0 ? '무료' : ev.price.toLocaleString() + '원'}
      </div>
    </div>
  );
}

function Landing({ nav }) {
  const Icon = window.Icon;
  const events = window.MOCK_EVENTS;
  const featured = events.filter(e => e.status === 'ON_SALE').slice(0, 5);
  const categories = [
    { cat: '컨퍼런스', icon: 'CF', color: '#4F46E5' },
    { cat: '밋업',     icon: 'MT', color: '#0EA5E9' },
    { cat: '해커톤',   icon: 'HT', color: '#10B981' },
    { cat: '스터디',   icon: 'ST', color: '#F59E0B' },
    { cat: '세미나',   icon: 'SM', color: '#8B5CF6' },
    { cat: '워크샵',   icon: 'WS', color: '#EC4899' },
  ];
  const counts = {};
  categories.forEach(c => { counts[c.cat] = events.filter(e => e.category === c.cat).length; });

  const totalTickets = events.reduce((s, e) => s + e.remainingQuantity, 0);
  const openEvents = events.filter(e => e.status === 'ON_SALE').length;

  return (
    <div className="editor-scroll">
      <div className="gutter">
        {Array.from({ length: 80 }, (_, i) => <span key={i} className={`ln ${i === 0 ? 'active' : ''}`}>{i + 1}</span>)}
      </div>
      <div className="editor-body" style={{ maxWidth: 1100 }}>
        {/* HERO */}
        <section style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 36, alignItems: 'center', padding: '28px 0 44px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 11px', borderRadius: 999, background: 'var(--term-green-soft)', color: 'var(--term-green-dim)', fontFamily: 'var(--font-mono)', fontSize: 11.5, fontWeight: 600, marginBottom: 18 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--term-green)' }} />
              v1.0 · 베타 서비스 운영 중
            </div>
            <h1 style={{
              fontFamily: 'var(--font)', fontSize: 44, fontWeight: 800,
              lineHeight: 1.15, letterSpacing: '-0.025em', color: 'var(--text)', marginBottom: 16,
            }}>
              개발자의 다음 한 줄을 바꿀<br/>
              <span style={{ color: 'var(--brand)' }}>이벤트와 티켓</span>, 한 곳에서.
            </h1>
            <p style={{ fontFamily: 'var(--font)', fontSize: 16, color: 'var(--text-3)', lineHeight: 1.65, marginBottom: 24, maxWidth: 480 }}>
              컨퍼런스부터 밋업·해커톤·스터디까지. 관심 있는 기술 스택으로 바로 찾고, 몇 번의 클릭으로 티켓을 예매하세요.
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button className="btn btn-primary btn-lg" onClick={() => nav('events')} style={{ fontFamily: 'var(--font)', fontSize: 14 }}>
                이벤트 둘러보기 <span style={{ opacity: 0.7 }}>→</span>
              </button>
              <button className="btn btn-ghost btn-lg" onClick={() => window.__openPalette?.()} style={{ fontFamily: 'var(--font)', fontSize: 14 }}>
                <Icon name="search" size={14} /> 빠른 검색 <kbd className="kbd" style={{ marginLeft: 4 }}>⌘K</kbd>
              </button>
            </div>
            <div style={{ marginTop: 20, display: 'flex', gap: 16, fontFamily: 'var(--font-mono)', fontSize: 11.5, color: 'var(--text-4)', flexWrap: 'wrap' }}>
              <span>// 키보드 친화적</span>
              <span>// 수수료 없음</span>
              <span>// 즉시 환불</span>
            </div>
          </div>
          <div>
            <TypedTerminal />
          </div>
        </section>

        {/* STATS */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 44 }}>
          <Stat hint="// events.length"   num={events.length} unit="개"  label="진행 중인 이벤트" />
          <Stat hint="// .status=ON_SALE" num={openEvents}    unit="건"  label="판매중인 티켓" />
          <Stat hint="// remaining.sum"   num={totalTickets.toLocaleString()} unit="석" label="전체 잔여 좌석" />
          <Stat hint="// hosts"           num="24+"           unit="팀"  label="참여 커뮤니티" />
        </section>

        {/* CATEGORIES */}
        <section style={{ marginBottom: 44 }}>
          <SectionHead title="카테고리별 이벤트" hint="category" caption="관심 있는 포맷을 선택해보세요" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10 }}>
            {categories.map(c => (
              <CategoryTile key={c.cat} cat={c.cat} count={counts[c.cat]} icon={c.icon} color={c.color}
                onClick={() => { nav('events'); setTimeout(() => window.__setCat?.(c.cat), 50); }} />
            ))}
          </div>
        </section>

        {/* FEATURED */}
        <section style={{ marginBottom: 44 }}>
          <SectionHead title="이번 주 주목할 이벤트" hint="featured" caption="마감 임박 및 신규 오픈 순"
            action={<a onClick={() => nav('events')} style={{ fontFamily: 'var(--font)', fontSize: 13, color: 'var(--brand)', fontWeight: 600, cursor: 'pointer' }}>전체 보기 →</a>} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {featured.map((e, i) => (
              <FeaturedRow key={e.eventId} ev={e} idx={i} onClick={() => nav('detail', { id: e.eventId })} />
            ))}
          </div>
        </section>

        {/* CTA */}
        <section style={{
          padding: '28px 32px', borderRadius: 12,
          border: '1px dashed var(--border-2)',
          background: 'linear-gradient(135deg, var(--brand-light) 0%, transparent 70%)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap',
          marginBottom: 40,
        }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, color: 'var(--text-4)', marginBottom: 6 }}>// get started</div>
            <h3 style={{ fontFamily: 'var(--font)', fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>
              지금 바로 다음 컨퍼런스를 예약하세요
            </h3>
            <p style={{ fontFamily: 'var(--font)', fontSize: 14, color: 'var(--text-3)' }}>
              회원가입은 30초면 끝나요. 신용카드, 계좌이체, 예치금 모두 지원합니다.
            </p>
          </div>
          <button className="btn btn-primary btn-lg" onClick={() => nav('events')} style={{ fontFamily: 'var(--font)', fontSize: 14, flexShrink: 0 }}>
            시작하기 →
          </button>
        </section>
      </div>
    </div>
  );
}

function SectionHead({ title, hint, caption, action }) {
  return (
    <div style={{ marginBottom: 16, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
      <div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-4)', marginBottom: 4, letterSpacing: '0.04em' }}>// {hint}</div>
        <h2 style={{ fontFamily: 'var(--font)', fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>{title}</h2>
        {caption && <p style={{ fontFamily: 'var(--font)', fontSize: 13, color: 'var(--text-3)' }}>{caption}</p>}
      </div>
      {action}
    </div>
  );
}

window.Landing = Landing;
