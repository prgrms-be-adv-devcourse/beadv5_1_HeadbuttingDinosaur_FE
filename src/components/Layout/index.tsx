import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { getEvents } from '@/api/events.api';
import type { EventItem } from '@/api/types';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import '@/styles/components/ide-chrome.css';

import { ActivityBar } from './ActivityBar';
import { CommandPalette } from './CommandPalette';
import { LayoutChromeProvider, useChrome } from './LayoutChromeContext';
import { Minimap } from './Minimap';
import { Sidebar } from './Sidebar';
import { StatusBar } from './StatusBar';
import { TabBar } from './TabBar';
import { TitleBar } from './TitleBar';
import { useCartCount } from './hooks/useCartCount';
import { useGlobalShortcuts } from './hooks/useGlobalShortcuts';
import type {
  CategoryCount,
  NavigateFn,
  SessionUser,
  TabDef,
  UpcomingEventVM,
} from './types';
import { detailIdFromPath, pathFromRoute, routeFromPath } from './utils';

/**
 * Source: docs/archive/v2-cutover/layout.plan.md §3-3.
 *
 * Single-prop API (children?). When omitted, renders <Outlet/> from the
 * router so this works as both a route element and a manual wrapper (the
 * dev preview passes children directly to bypass routing).
 *
 * The chrome state (palette open, search ref) lives in LayoutChromeProvider;
 * LayoutInner reads it via useChrome and Layout itself only wires the two
 * external callbacks (toggleTheme, logout) into the provider.
 *
 * Sidebar adapter is inlined here per §4-5 ("Layout/adapters.ts 또는 페이지
 * 어댑터") — small enough to keep in-file and avoid an extra abstraction.
 *
 * §6-7 aria-hidden on .ide while open is intentionally omitted: aria-modal
 * on the palette dialog already tells AT to ignore the background, and
 * adding aria-hidden on an ancestor of the focused dialog breaks SR focus
 * announcements (current ARIA APG guidance).
 */
export interface LayoutProps {
  children?: ReactNode;
}

const CATEGORY_LIST = ['컨퍼런스', '밋업', '해커톤', '스터디', '세미나', '워크샵'];

/**
 * Pinned tabs (no close affordance). `detail` is intentionally *not* in this
 * list — it becomes a dynamic per-event tab that is opened on first visit
 * and dismissable by the user. Login/seller/admin remain pinned but
 * conditional on auth state.
 */
const BASE_TABS: TabDef[] = [
  { key: 'home', label: '홈', icon: 'terminal', route: 'home' },
  { key: 'events', label: '이벤트 목록', icon: 'folder', route: 'events' },
  { key: 'cart', label: '장바구니', icon: 'cart', route: 'cart' },
  { key: 'mypage', label: '마이페이지', icon: 'user', route: 'mypage' },
];

const LOGIN_TAB: TabDef = { key: 'login', label: '로그인', icon: 'terminal', route: 'login' };

const SELLER_TAB: TabDef = { key: 'seller', label: '판매자 센터', icon: 'wallet', route: 'seller' };
const ADMIN_TAB: TabDef = { key: 'admin', label: '관리자 패널', icon: 'settings', route: 'admin' };

const detailTabKey = (id: string) => `detail:${id}`;

const SIDEBAR_FETCH_SIZE = 50;
const UPCOMING_LIMIT = 4;

function formatEventDate(iso: string): string {
  return iso.slice(0, 10);
}

function formatEventPrice(price: number): string {
  return price === 0 ? '무료' : `${price.toLocaleString()}원`;
}

function LayoutInner({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn, user, role } = useAuth();
  const { resolvedTheme } = useTheme();
  const { count: cartCount } = useCartCount();
  const chrome = useChrome();

  const [events, setEvents] = useState<EventItem[]>([]);
  const [totalEvents, setTotalEvents] = useState(0);
  const [openDetailIds, setOpenDetailIds] = useState<string[]>([]);

  const currentRoute = routeFromPath(location.pathname);
  const currentDetailId = detailIdFromPath(location.pathname);
  const sessionUser: SessionUser | null = user
    ? { nickname: user.nickname }
    : null;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getEvents({ page: 0, size: SIDEBAR_FETCH_SIZE });
        if (cancelled) return;
        const data = res.data?.data;
        setEvents(data?.content ?? []);
        setTotalEvents(data?.totalElements ?? 0);
      } catch {
        // chrome must not block on a sidebar feed failure
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const categories = useMemo<CategoryCount[]>(
    () =>
      CATEGORY_LIST.map((name) => ({
        name,
        count: events.filter((e) => e.category === name).length,
      })),
    [events],
  );

  const upcoming = useMemo<UpcomingEventVM[]>(
    () =>
      events
        .filter((e) => e.status === 'ON_SALE')
        .slice(0, UPCOMING_LIMIT)
        .map((e) => ({
          eventId: e.eventId,
          title: e.title,
          dateText: formatEventDate(e.eventDateTime),
          priceText: formatEventPrice(e.price),
        })),
    [events],
  );

  const lastDetailIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (currentDetailId) {
      lastDetailIdRef.current = currentDetailId;
      setOpenDetailIds((prev) =>
        prev.includes(currentDetailId) ? prev : [...prev, currentDetailId],
      );
    }
  }, [currentDetailId]);

  const onNavigate: NavigateFn = (key, params) => {
    const resolvedParams =
      key === 'detail' && !params?.id && lastDetailIdRef.current
        ? { ...params, id: lastDetailIdRef.current }
        : params;
    navigate(pathFromRoute(key, resolvedParams));
  };

  const detailTabs = useMemo<TabDef[]>(
    () =>
      openDetailIds.map((id) => {
        const ev = events.find((e) => String(e.eventId) === id);
        return {
          key: detailTabKey(id),
          label: ev?.title ?? `이벤트 #${id}`,
          icon: 'file',
          route: 'detail' as const,
          params: { id },
          closeable: true,
        };
      }),
    [openDetailIds, events],
  );

  const tabs = useMemo<TabDef[]>(
    () => [
      ...BASE_TABS,
      ...(isLoggedIn ? [] : [LOGIN_TAB]),
      ...(role === 'SELLER' || role === 'ADMIN' ? [SELLER_TAB] : []),
      ...(role === 'ADMIN' ? [ADMIN_TAB] : []),
      ...detailTabs,
    ],
    [isLoggedIn, role, detailTabs],
  );

  const activeTabKey =
    currentRoute === 'detail' && currentDetailId
      ? detailTabKey(currentDetailId)
      : currentRoute;

  const handleTabSelect = (tab: TabDef) => {
    onNavigate(tab.route, tab.params);
  };

  const handleTabClose = (tab: TabDef) => {
    if (tab.route !== 'detail' || !tab.params?.id) return;
    const closingId = tab.params.id;
    if (activeTabKey === tab.key) {
      // Prefer the neighbouring detail tab; otherwise fall back to the
      // events list so the editor pane is never left without a route.
      const idx = openDetailIds.indexOf(closingId);
      const remaining = openDetailIds.filter((id) => id !== closingId);
      const fallbackId =
        remaining[idx] ?? remaining[idx - 1] ?? remaining[remaining.length - 1] ?? null;
      if (fallbackId) {
        navigate(pathFromRoute('detail', { id: fallbackId }));
      } else {
        navigate(pathFromRoute('events'));
      }
    }
    setOpenDetailIds((prev) => prev.filter((id) => id !== closingId));
    if (lastDetailIdRef.current === closingId) {
      lastDetailIdRef.current = null;
    }
  };

  useGlobalShortcuts({
    isLoggedIn,
    onOpenPalette: chrome.openPalette,
    onClosePalette: chrome.closePalette,
    onFocusSearch: chrome.focusSearch,
    onNavigate,
  });

  return (
    <>
      <div className="ide" role="application" aria-label="DevTicket">
        <a className="skip-link" href="#ide-editor">
          본문으로 건너뛰기
        </a>
        <TitleBar
          theme={resolvedTheme}
          onToggleTheme={chrome.toggleTheme}
          onOpenPalette={chrome.openPalette}
        />
        <ActivityBar
          currentRoute={currentRoute}
          cartCount={cartCount}
          isLoggedIn={isLoggedIn}
          onNavigate={onNavigate}
          onOpenPalette={chrome.openPalette}
        />
        <Sidebar
          currentRoute={currentRoute}
          isLoggedIn={isLoggedIn}
          user={sessionUser}
          totalEventCount={totalEvents}
          categories={categories}
          upcoming={upcoming}
          onNavigate={onNavigate}
        />
        <TabBar
          tabs={tabs}
          activeKey={activeTabKey}
          onSelect={handleTabSelect}
          onClose={handleTabClose}
        />
        <main className="ide-editor" id="ide-editor" tabIndex={-1}>
          {children ?? <Outlet />}
        </main>
        <Minimap route={currentRoute} />
        <StatusBar
          currentRoute={currentRoute}
          isLoggedIn={isLoggedIn}
          user={sessionUser}
          onOpenPalette={chrome.openPalette}
        />
      </div>
      <CommandPalette open={chrome.paletteOpen} onClose={chrome.closePalette} />
    </>
  );
}

export default function Layout({ children }: LayoutProps) {
  const { toggleTheme } = useTheme();
  const { logout } = useAuth();
  return (
    <LayoutChromeProvider onToggleTheme={toggleTheme} onLogout={logout}>
      <LayoutInner>{children}</LayoutInner>
    </LayoutChromeProvider>
  );
}
