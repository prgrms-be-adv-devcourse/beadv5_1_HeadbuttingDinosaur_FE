// EventList — readable hero + friendly event cards. IDE flavor stays in the chrome (tabs, gutter, minimap), not the content.

const { useState: useStateE, useRef: useRefE, useEffect: useEffectE } = React;

function Hero({ filtered }) {
  const Icon = window.Icon;
  return (
    <div style={{ marginBottom: 26 }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 12px', borderRadius: 999, background: 'var(--term-green-soft)', color: 'var(--term-green-dim)', fontFamily: 'var(--font-mono)', fontSize: 11.5, fontWeight: 600, marginBottom: 14 }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--term-green)' }} />
        개발자를 위한 이벤트 플랫폼
      </div>
      <h1 style={{ fontFamily: 'var(--font)', fontSize: 34, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: 10, color: 'var(--text)' }}>
        다음 컨퍼런스를 찾아보세요
      </h1>
      <p style={{ fontFamily: 'var(--font)', fontSize: 15, color: 'var(--text-3)', lineHeight: 1.6 }}>
        컨퍼런스, 밋업, 해커톤, 워크샵까지 — {filtered.length}개의 이벤트가 기다리고 있습니다.
      </p>
      <div style={{ marginTop: 12, display: 'flex', gap: 14, fontFamily: 'var(--font-mono)', fontSize: 11.5, color: 'var(--text-4)', flexWrap: 'wrap' }}>
        <span><kbd className="kbd">⌘K</kbd> 검색</span>
        <span><kbd className="kbd">/</kbd> 검색창 포커스</span>
        <span><kbd className="kbd">j</kbd> <kbd className="kbd">k</kbd> 카드 이동</span>
        <span><kbd className="kbd">↵</kbd> 열기</span>
      </div>
    </div>
  );
}

function SearchAndFilters({ keyword, setKeyword, cat, setCat, stack, setStack, stacks, cats, counts }) {
  const Icon = window.Icon;
  const inputRef = useRefE(null);
  useEffectE(() => { window.__focusSearch = () => inputRef.current?.focus(); return () => delete window.__focusSearch; }, []);
  return (
    <div style={{ marginBottom: 22 }}>
      <div className="code-input" style={{ marginBottom: 14, height: 44 }}>
        <Icon name="search" size={16} />
        <input ref={inputRef} placeholder="이벤트명이나 기술 스택으로 검색"
          value={keyword} onChange={e => setKeyword(e.target.value)} style={{ fontFamily: 'var(--font)', fontSize: 14, color: 'var(--text)' }} />
        <kbd>/</kbd>
      </div>

      <div style={{ marginBottom: 10 }}>
        <div style={{ fontFamily: 'var(--font)', fontSize: 12.5, fontWeight: 600, color: 'var(--text-3)', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.05em' }}>카테고리</div>
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {cats.map(c => (
            <button key={c} className={`chip ${cat === c ? 'active' : ''}`} onClick={() => setCat(c)} style={{ fontFamily: 'var(--font)' }}>
              {c}{counts[c] !== undefined && <span style={{ opacity: 0.6, marginLeft: 4, fontSize: 10.5 }}>{counts[c]}</span>}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div style={{ fontFamily: 'var(--font)', fontSize: 12.5, fontWeight: 600, color: 'var(--text-3)', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.05em' }}>기술 스택</div>
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {stacks.map(s => (
            <button key={s} className={`chip ${stack === s ? 'active' : ''}`}
              onClick={() => setStack(x => x === s ? '' : s)}>{s}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

function EventCard({ event, onClick, focused, innerRef }) {
  const Icon = window.Icon;
  const c = window.accent(event.eventId);
  const lowStock = event.status === 'ON_SALE' && event.remainingQuantity < 10 && event.remainingQuantity > 0;
  const sold = event.status === 'SOLD_OUT';

  const dateStr = window.fmtDate(event.eventDateTime);
  const [d, t] = dateStr.split(' ');

  return (
    <article ref={innerRef}
      onClick={onClick}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.15s',
        display: 'flex', flexDirection: 'column',
        position: 'relative',
        ...(focused ? { borderColor: c, boxShadow: `0 0 0 2px ${c}30` } : {}),
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = c; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 12px 28px ${c}22`; }}
      onMouseLeave={e => { if (!focused) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; } }}>

      {/* Left accent bar */}
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: c }} />

      {/* Header — like a file tab */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '9px 14px 9px 16px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--chrome)',
        fontFamily: 'var(--font-mono)', fontSize: 11,
      }}>
        <span style={{ color: c, fontWeight: 700 }}>#{event.category}</span>
        <span style={{ color: 'var(--text-4)' }}>·</span>
        <span style={{ color: 'var(--text-4)' }}>{t}</span>
        <span style={{ marginLeft: 'auto' }}>
          {sold ? <span className="status-chip sold"><span className="dot" />매진</span>
            : event.price === 0 ? <span className="status-chip free"><span className="dot" />무료</span>
            : <span className="status-chip ok"><span className="dot" />판매중</span>}
        </span>
      </div>

      {/* Body */}
      <div style={{ padding: '16px 18px 14px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 style={{
          fontFamily: 'var(--font)', fontSize: 16, fontWeight: 700,
          color: 'var(--text)', lineHeight: 1.4, marginBottom: 12,
          minHeight: '2.8em',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {event.title}
        </h3>

        {/* Meta grid — structured rows, dev-ish label style */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12, fontFamily: 'var(--font)', fontSize: 12.5 }}>
          <MetaLine label="일시" value={`${d} · ${t}`} />
          <MetaLine label="장소" value={event.location.split(' ').slice(0, 3).join(' ')} />
          <MetaLine label="주최" value={event.host} />
        </div>

        {/* Stack tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 14 }}>
          {event.techStacks.slice(0, 3).map(t => (
            <span key={t} style={{
              fontFamily: 'var(--font-mono)', fontSize: 10.5,
              padding: '2px 7px', borderRadius: 3,
              background: 'var(--editor-line)', color: 'var(--text-2)',
              border: '1px solid var(--border)',
            }}>{t}</span>
          ))}
          {event.techStacks.length > 3 && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-4)', alignSelf: 'center', padding: '0 3px' }}>+{event.techStacks.length - 3}</span>}
        </div>

        {/* Footer — price + stock */}
        <div style={{
          marginTop: 'auto',
          paddingTop: 12,
          borderTop: '1px dashed var(--border-2)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-4)', marginBottom: 1, letterSpacing: '0.04em' }}>PRICE</div>
            <div style={{ fontFamily: 'var(--font)', fontSize: 17, fontWeight: 800, color: event.price === 0 ? 'var(--term-green-dim)' : 'var(--text)', letterSpacing: '-0.01em' }}>
              {event.price === 0 ? '무료' : `${event.price.toLocaleString()}원`}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-4)', marginBottom: 1, letterSpacing: '0.04em' }}>STOCK</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: sold ? 'var(--danger)' : lowStock ? 'var(--danger)' : 'var(--text-2)' }}>
              {sold ? '0석' : lowStock ? `⚡ ${event.remainingQuantity}석` : `${event.remainingQuantity}석`}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function MetaLine({ label, value }) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--text-4)', width: 30, flexShrink: 0, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{label}</span>
      <span style={{ color: 'var(--text-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>{value}</span>
    </div>
  );
}

function EmptyStackTrace({ onReset }) {
  return (
    <div className="stack-trace" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }}>
      <div className="err-title" style={{ fontFamily: 'var(--font)' }}>🔍 검색 결과가 없습니다</div>
      <div className="err-msg" style={{ fontFamily: 'var(--font)' }}>적용된 필터에 해당하는 이벤트를 찾지 못했어요.</div>
      <div className="hint" style={{ fontFamily: 'var(--font)', fontSize: 13 }}>
        카테고리나 기술 스택 필터를 줄여보거나 검색어를 비워보세요.
        <button className="btn btn-primary btn-sm" style={{ marginLeft: 12 }} onClick={onReset}>필터 초기화</button>
      </div>
    </div>
  );
}

function EventList({ nav }) {
  const [keyword, setKeyword] = useStateE('');
  const [cat, setCat] = useStateE('전체');
  const [stack, setStack] = useStateE('');
  const [focusIdx, setFocusIdx] = useStateE(-1);
  const cardRefs = useRefE([]);

  useEffectE(() => { window.__setCat = setCat; return () => delete window.__setCat; }, []);

  const cats = ['전체', '컨퍼런스', '밋업', '해커톤', '스터디', '세미나', '워크샵'];
  const stacks = ['Java', 'Spring Boot', 'TypeScript', 'React', 'Node.js', 'Go', 'Rust', 'Docker', 'Kubernetes', 'AWS', 'Python'];

  const counts = {};
  cats.forEach(c => { counts[c] = c === '전체' ? window.MOCK_EVENTS.length : window.MOCK_EVENTS.filter(e => e.category === c).length; });

  const filtered = window.MOCK_EVENTS.filter(e =>
    (cat === '전체' || e.category === cat) &&
    (!stack || e.techStacks.includes(stack)) &&
    (!keyword || (e.title + e.techStacks.join(' ')).toLowerCase().includes(keyword.toLowerCase()))
  );

  useEffectE(() => {
    window.__cardNav = (dir) => {
      setFocusIdx(i => {
        const n = Math.max(0, Math.min(filtered.length - 1, (i < 0 ? 0 : i + dir)));
        cardRefs.current[n]?.scrollIntoView({ block: 'nearest' });
        return n;
      });
    };
    window.__cardOpen = () => {
      if (focusIdx >= 0 && filtered[focusIdx]) nav('detail', { id: filtered[focusIdx].eventId });
    };
    return () => { delete window.__cardNav; delete window.__cardOpen; };
  }, [filtered, focusIdx, nav]);

  const reset = () => { setKeyword(''); setCat('전체'); setStack(''); };

  return (
    <div className="editor-scroll">
      <div className="gutter">
        {Array.from({ length: 60 }, (_, i) => (
          <span key={i} className={`ln ${i === 0 ? 'active' : ''}`}>{i + 1}</span>
        ))}
      </div>
      <div className="editor-body" style={{ maxWidth: 1100 }}>
        <Hero filtered={filtered} />
        <SearchAndFilters
          keyword={keyword} setKeyword={setKeyword}
          cat={cat} setCat={setCat}
          stack={stack} setStack={setStack}
          stacks={stacks} cats={cats} counts={counts} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontFamily: 'var(--font)', fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
            이벤트 <span style={{ color: 'var(--text-3)', fontWeight: 500 }}>{filtered.length}개</span>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-4)' }}>
            전체 {window.MOCK_EVENTS.length}개 중
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyStackTrace onReset={reset} />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {filtered.map((e, i) => (
              <EventCard key={e.eventId} event={e} focused={focusIdx === i}
                innerRef={el => cardRefs.current[i] = el}
                onClick={() => nav('detail', { id: e.eventId })} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

window.EventList = EventList;
