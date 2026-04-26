import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '.';
import type { RouteKey } from './types';
import { pathFromRoute, routeFromPath } from './utils';

/**
 * Source: docs/redesign/layout.plan.md §7-0, §7-2 Step 8.
 *
 * Dev-only verification harness for the v2 Layout chrome. Mounted via
 * main.tsx when `import.meta.env.DEV && location.pathname === '/__layout-preview'`.
 *
 * The preview drives Layout via real routing (uses navigate so the
 * underlying useLocation flow is exercised), and renders a small mock pane
 * for each of the six RouteKeys so visual states can be cycled. Removed
 * in the first v2 page PR (§7-3).
 *
 * Inline styles are intentional here — this file is throwaway scaffolding
 * and is excluded from production via the DEV guard at the entry.
 */

const ROUTES: RouteKey[] = [
  'home',
  'events',
  'detail',
  'cart',
  'mypage',
  'login',
];

const MOCK_LABEL: Record<RouteKey, string> = {
  home: '홈 (Landing 자리)',
  events: '이벤트 목록',
  detail: '이벤트 상세',
  cart: '장바구니',
  mypage: '마이페이지',
  login: '로그인',
};

function MockPane({ route }: { route: RouteKey }) {
  return (
    <div
      style={{
        padding: 32,
        fontFamily: 'var(--font-mono)',
        color: 'var(--text-2)',
        fontSize: 13,
        lineHeight: 1.7,
      }}
    >
      <div style={{ color: 'var(--syn-comment)' }}>
        // Mock content — {MOCK_LABEL[route]}
      </div>
      <div>
        <span style={{ color: 'var(--syn-keyword)' }}>route</span>
        <span style={{ color: 'var(--syn-punct)' }}>: </span>
        <span style={{ color: 'var(--syn-string)' }}>"{route}"</span>
      </div>
      <div style={{ marginTop: 16, color: 'var(--text-3)' }}>
        Layout chrome (titlebar, activity rail, sidebar, tabs, status bar,
        minimap) should reflect this route. Try ⌘K, theme toggle, sidebar
        toggles, and the preview controls below.
      </div>
    </div>
  );
}

export default function LayoutPreview() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentRoute = routeFromPath(location.pathname);

  const goRoute = (key: RouteKey) => {
    const params = key === 'detail' ? { id: 'mock-event-1' } : undefined;
    navigate(pathFromRoute(key, params));
  };

  return (
    <Layout>
      <MockPane route={currentRoute} />
      <div
        style={{
          position: 'fixed',
          bottom: 36,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 500,
          padding: '8px 12px',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.18)',
          display: 'flex',
          gap: 6,
          fontFamily: 'var(--font-mono)',
          fontSize: 11.5,
        }}
      >
        <strong style={{ color: 'var(--text-3)', alignSelf: 'center' }}>
          Preview:
        </strong>
        {ROUTES.map((r) => {
          const isActive = currentRoute === r;
          return (
            <button
              key={r}
              type="button"
              onClick={() => goRoute(r)}
              style={{
                padding: '4px 10px',
                borderRadius: 4,
                border: '1px solid',
                borderColor: isActive ? 'var(--brand)' : 'var(--border)',
                background: isActive ? 'var(--brand-light)' : 'var(--editor-bg)',
                color: isActive ? 'var(--brand)' : 'var(--text-2)',
                fontFamily: 'inherit',
                fontSize: 'inherit',
                cursor: 'pointer',
              }}
            >
              {r}
            </button>
          );
        })}
      </div>
    </Layout>
  );
}
