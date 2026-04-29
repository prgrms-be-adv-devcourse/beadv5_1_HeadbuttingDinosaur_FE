// IDE shell — titlebar, activity rail, sidebar, tab bar, minimap, status bar,
// command palette. Chrome keeps IDE flavor; labels are Korean-first.

const { useState, useEffect, useRef } = React;

function TitleBar({ onOpenPalette, theme, onToggleTheme }) {
  const Icon = window.Icon;
  return (
    <div className="ide-title">
      <div className="traffic">
        <span className="tc-red" /><span className="tc-yellow" /><span className="tc-green" />
      </div>
      <span className="title-text">DevTicket · 개발자를 위한 이벤트 티켓</span>
      <div className="title-cmd" onClick={onOpenPalette}>
        <Icon name="search" size={11} />
        <span style={{ flex: 1, textAlign: 'left' }}>이벤트, 기술 스택으로 검색하기</span>
        <kbd>⌘K</kbd>
      </div>
      <button className="act-btn" style={{ width: 30, height: 26 }} onClick={onToggleTheme} title="테마 전환">
        <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={14} />
      </button>
    </div>
  );
}

function ActivityBar({ route, nav, isLoggedIn, cartCount }) {
  const Icon = window.Icon;
  const items = [
    { key: 'home',     icon: 'terminal', label: '홈',     active: route === 'home' },
    { key: 'events',   icon: 'folder',   label: '이벤트', active: ['events', 'detail'].includes(route) },
    { key: 'search',   icon: 'search',   label: '검색',   active: false, action: 'palette' },
    { key: 'cart',     icon: 'cart',     label: '장바구니', active: route === 'cart', badge: cartCount },
    { key: 'mypage',   icon: 'user',     label: '마이페이지', active: route === 'mypage' },
  ];
  return (
    <div className="ide-activity">
      {items.map(it => (
        <button key={it.key}
          className={`act-btn ${it.active ? 'active' : ''}`}
          title={it.label}
          onClick={() => {
            if (it.action === 'palette') window.__openPalette?.();
            else if ((it.key === 'cart' || it.key === 'mypage') && !isLoggedIn) nav('login');
            else nav(it.key);
          }}>
          <Icon name={it.icon} size={20} />
          {it.badge > 0 && <span className="act-badge">{it.badge}</span>}
        </button>
      ))}
      <div className="act-spacer" />
      <button className="act-btn" title="설정">
        <Icon name="settings" size={18} />
      </button>
    </div>
  );
}

function Sidebar({ route, nav, isLoggedIn, user }) {
  const Icon = window.Icon;
  const [openExp, setOpenExp] = useState(true);
  const [openUp, setOpenUp] = useState(true);
  const events = window.MOCK_EVENTS;
  const categories = ['컨퍼런스', '밋업', '해커톤', '스터디', '세미나', '워크샵'];
  const counts = {};
  categories.forEach(c => { counts[c] = events.filter(e => e.category === c).length; });

  const upcoming = events
    .filter(e => e.status === 'ON_SALE')
    .slice(0, 4);

  return (
    <div className="ide-sidebar">
      <div className="side-header" onClick={() => setOpenExp(!openExp)}>
        <span>메뉴</span>
        <Icon name={openExp ? 'chevd' : 'chev'} size={10} />
      </div>
      {openExp && (
        <div className="side-group">
          <div className={`side-item ${route === 'home' ? 'active' : ''}`} onClick={() => nav('home')}>
            <span className="tri">▸</span>
            <Icon name="terminal" size={13} />
            <span>홈</span>
          </div>
          <div className={`side-item ${route === 'events' ? 'active' : ''}`} onClick={() => nav('events')}>
            <span className="tri">▾</span>
            <Icon name="folder" size={13} />
            <span>이벤트 둘러보기</span>
            <span className="side-count">{events.length}</span>
          </div>
          <div style={{ paddingLeft: 14 }}>
            {categories.map(cat => (
              <div key={cat} className="side-item" style={{ paddingLeft: 28 }}
                onClick={() => { nav('events'); window.__setCat?.(cat); }}>
                <span style={{ color: 'var(--text-4)', fontSize: 11, width: 10, textAlign: 'center' }}>#</span>
                <span>{cat}</span>
                <span className="side-count">{counts[cat]}</span>
              </div>
            ))}
          </div>
          <div className={`side-item ${route === 'cart' ? 'active' : ''}`} onClick={() => isLoggedIn ? nav('cart') : nav('login')}>
            <span className="tri">▸</span>
            <Icon name="cart" size={13} />
            <span>장바구니</span>
          </div>
          <div className={`side-item ${route === 'mypage' ? 'active' : ''}`} onClick={() => isLoggedIn ? nav('mypage') : nav('login')}>
            <span className="tri">▸</span>
            <Icon name="user" size={13} />
            <span>마이페이지</span>
          </div>
          {!isLoggedIn && (
            <div className={`side-item ${route === 'login' ? 'active' : ''}`} onClick={() => nav('login')}>
              <span className="tri">▸</span>
              <Icon name="terminal" size={13} />
              <span>로그인</span>
            </div>
          )}
        </div>
      )}

      <div className="side-header" onClick={() => setOpenUp(!openUp)} style={{ borderTop: '1px solid var(--border)' }}>
        <span>다가오는 이벤트</span>
        <Icon name={openUp ? 'chevd' : 'chev'} size={10} />
      </div>
      {openUp && (
        <div className="side-group">
          {upcoming.map(e => (
            <div key={e.eventId} className="side-item" onClick={() => nav('detail', { id: e.eventId })}
              style={{ display: 'block', padding: '7px 12px' }}>
              <div style={{ fontFamily: 'var(--font)', fontSize: 12, color: 'var(--text-2)', fontWeight: 500, lineHeight: 1.4, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.title}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--text-4)' }}>
                {window.fmtDate(e.eventDateTime).slice(0, 10)} · {e.price === 0 ? '무료' : e.price.toLocaleString() + '원'}
              </div>
            </div>
          ))}
        </div>
      )}

      {isLoggedIn && (
        <>
          <div className="side-header" style={{ borderTop: '1px solid var(--border)' }}>세션</div>
          <div className="side-group">
            <div className="side-item" style={{ fontSize: 11.5, color: 'var(--text-3)' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--term-green)' }} />
              <span>{user?.nickname}</span>
              <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-4)' }}>온라인</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function TabBar({ tabs, activeKey, onSelect, onClose }) {
  const Icon = window.Icon;
  return (
    <div className="ide-tabs">
      {tabs.map(t => (
        <div key={t.key} className={`tab ${activeKey === t.key ? 'active' : ''}`} onClick={() => onSelect(t.key)}>
          <Icon name={t.icon} size={13} />
          <span>{t.label}</span>
          {tabs.length > 1 && (
            <span className="close" onClick={e => { e.stopPropagation(); onClose(t.key); }}>
              <Icon name="x" size={12} />
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

function Minimap({ route }) {
  const patterns = {
    events: ['kw','','kw','fn','','str','cmt','','kw','','','fn','','','str','','cmt','','','kw','fn','','','','str'],
    detail: ['kw','','fn','','','str','','','kw','','','fn','str','','','str','','','kw','','fn','','','','','cmt'],
    cart:   ['kw','','','fn','','str','','kw','','','fn','','','str','','cmt','','kw','','fn','','','','','',''],
    mypage: ['kw','fn','','','str','','','kw','','','fn','','str','','','cmt','','kw','fn','','str',''],
    login:  ['kw','','','fn','','str','','','cmt','','kw','fn','','','str','','',''],
  };
  const base = patterns[route] || patterns.events;
  const lines = Array.from({ length: 80 }, (_, i) => base[i % base.length]);
  return (
    <div className="ide-minimap">
      {lines.map((cls, i) => {
        const w = 70 + ((i * 37) % 30);
        return <div key={i} className={`mini-line ${cls}`} style={{ width: `${w}%` }} />;
      })}
      <div className="mini-window" />
    </div>
  );
}

function StatusBar({ route, isLoggedIn, user }) {
  const Icon = window.Icon;
  const label = { home: '홈', events: '이벤트 목록', detail: '이벤트 상세', cart: '장바구니', mypage: '마이페이지', login: '로그인' }[route] || '';
  return (
    <div className="ide-status">
      <div className="status-item clickable"><Icon name="git" size={12} /><span>DevTicket</span></div>
      <div className="status-item term-ok">● 정상</div>
      <div className="status-item"><span>{label}</span></div>
      <div className="status-spacer" />
      <div className="status-item">한국어</div>
      <div className="status-item">
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--term-green)' }} />
        <span>{isLoggedIn ? `${user?.nickname} 님` : '비회원'}</span>
      </div>
      <div className="status-item clickable" onClick={() => window.__openPalette?.()}>
        <kbd style={{ background: 'rgba(255,255,255,0.15)', padding: '0 4px', borderRadius: 2 }}>⌘K</kbd>
      </div>
    </div>
  );
}

function CommandPalette({ open, onClose, nav, isLoggedIn }) {
  const Icon = window.Icon;
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => { if (open) { setTimeout(() => inputRef.current?.focus(), 10); setQ(''); setSel(0); } }, [open]);

  const items = [
    { key: 'home',   label: '홈',         hint: '시작 화면',            icon: 'terminal', shortcut: 'g h', action: () => nav('home') },
    { key: 'events', label: '이벤트 목록', hint: '모든 이벤트 둘러보기', icon: 'folder',   shortcut: 'g e', action: () => nav('events') },
    { key: 'cart',   label: '장바구니',   hint: '담은 티켓 확인', icon: 'cart',   shortcut: 'g c', action: () => isLoggedIn ? nav('cart') : nav('login') },
    { key: 'mypage', label: '마이페이지', hint: '내 티켓 · 주문 내역', icon: 'user',   shortcut: 'g m', action: () => isLoggedIn ? nav('mypage') : nav('login') },
    { key: 'login',  label: isLoggedIn ? '로그아웃' : '로그인', hint: isLoggedIn ? '세션 종료' : '계정에 로그인', icon: 'terminal', shortcut: '', action: () => isLoggedIn ? window.__logout?.() : nav('login') },
    { key: 'theme',  label: '테마 전환',   hint: '라이트 ↔ 다크', icon: 'moon',   shortcut: '', action: () => window.__toggleTheme?.() },
    ...window.MOCK_EVENTS.map(e => ({
      key: 'ev_' + e.eventId, label: e.title, hint: `${e.category} · ${e.price === 0 ? '무료' : e.price.toLocaleString() + '원'}`, icon: 'ticket', shortcut: '',
      action: () => nav('detail', { id: e.eventId })
    })),
  ];
  const filt = q.trim()
    ? items.filter(i => (i.label + i.hint).toLowerCase().includes(q.toLowerCase()))
    : items;

  const run = (i) => { filt[i]?.action(); onClose(); };

  const onKey = e => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSel(s => Math.min(s + 1, filt.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSel(s => Math.max(s - 1, 0)); }
    else if (e.key === 'Enter') { e.preventDefault(); run(sel); }
    else if (e.key === 'Escape') { onClose(); }
  };

  if (!open) return null;
  return (
    <div className="palette-backdrop" onClick={onClose}>
      <div className="palette" onClick={e => e.stopPropagation()}>
        <input ref={inputRef} className="palette-input" placeholder="명령이나 이벤트 검색..."
          value={q} onChange={e => { setQ(e.target.value); setSel(0); }} onKeyDown={onKey} style={{ fontFamily: 'var(--font)' }} />
        <div className="palette-list">
          {filt.length === 0 ? (
            <div style={{ padding: '18px 14px', color: 'var(--text-4)', fontSize: 13, fontFamily: 'var(--font)' }}>검색 결과가 없습니다</div>
          ) : filt.map((it, i) => (
            <div key={it.key} className={`palette-item ${sel === i ? 'sel' : ''}`}
              onMouseEnter={() => setSel(i)} onClick={() => run(i)}>
              <Icon name={it.icon} size={14} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="truncate" style={{ fontFamily: 'var(--font)', color: 'var(--text)' }}>{it.label}</div>
                <div style={{ fontSize: 11, color: 'var(--text-4)', fontFamily: 'var(--font)' }}>{it.hint}</div>
              </div>
              {it.shortcut && <span className="shortcut">{it.shortcut}</span>}
            </div>
          ))}
        </div>
        <div className="palette-hint">
          <span><kbd>↑↓</kbd>이동</span>
          <span><kbd>↵</kbd>실행</span>
          <span><kbd>esc</kbd>닫기</span>
          <span style={{ marginLeft: 'auto', color: 'var(--text-4)' }}>{filt.length}개 결과</span>
        </div>
      </div>
    </div>
  );
}

function Layout({ children, route, nav, isLoggedIn, user, logout, cartCount, theme, onToggleTheme }) {
  const [palette, setPalette] = useState(false);

  useEffect(() => {
    window.__openPalette = () => setPalette(true);
    window.__toggleTheme = onToggleTheme;
    window.__logout = logout;
    return () => {
      delete window.__openPalette;
      delete window.__toggleTheme;
      delete window.__logout;
    };
  }, [onToggleTheme, logout]);

  const tabForRoute = {
    home:   { key: 'home',   label: '홈',         icon: 'terminal' },
    events: { key: 'events', label: '이벤트 목록', icon: 'folder' },
    detail: { key: 'detail', label: '이벤트 상세', icon: 'file' },
    cart:   { key: 'cart',   label: '장바구니',   icon: 'cart' },
    mypage: { key: 'mypage', label: '마이페이지', icon: 'user' },
    login:  { key: 'login',  label: '로그인',     icon: 'terminal' },
  };
  const openTabs = Object.values(tabForRoute);

  useEffect(() => {
    const onKey = e => {
      const inInput = /INPUT|TEXTAREA/.test(e.target.tagName);
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setPalette(true); return; }
      if (e.key === 'Escape') { setPalette(false); return; }
      if (inInput) return;
      if (e.key === '/') { e.preventDefault(); window.__focusSearch?.(); return; }
      if (e.key === 'g') { window.__seqG = true; setTimeout(() => window.__seqG = false, 800); return; }
      if (window.__seqG) {
        window.__seqG = false;
        if (e.key === 'h') nav('home');
        else if (e.key === 'e') nav('events');
        else if (e.key === 'c') isLoggedIn ? nav('cart') : nav('login');
        else if (e.key === 'm') isLoggedIn ? nav('mypage') : nav('login');
      }
      if (e.key === 'j' || e.key === 'k') window.__cardNav?.(e.key === 'j' ? 1 : -1);
      if (e.key === 'Enter') window.__cardOpen?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [nav, isLoggedIn]);

  return (
    <div className="ide">
      <TitleBar onOpenPalette={() => setPalette(true)} theme={theme} onToggleTheme={onToggleTheme} />
      <ActivityBar route={route} nav={nav} isLoggedIn={isLoggedIn} cartCount={cartCount} />
      <Sidebar route={route} nav={nav} isLoggedIn={isLoggedIn} user={user} />
      <TabBar tabs={openTabs} activeKey={route} onSelect={nav} onClose={() => {}} />
      <div className="ide-editor" id="ide-editor">
        {children}
      </div>
      <Minimap route={route} />
      <StatusBar route={route} isLoggedIn={isLoggedIn} user={user} />
      <CommandPalette open={palette} onClose={() => setPalette(false)} nav={nav} isLoggedIn={isLoggedIn} />
    </div>
  );
}

window.Layout = Layout;
