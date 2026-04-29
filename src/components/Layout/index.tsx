import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { getEvents } from '@/api/events.api';
import type { EventItem } from '@/api/types';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import {
  EVENT_CATEGORY_LABELS,
  toCategoryLabel,
} from '@/pages/_shared/category';
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
  RouteKey,
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

/* 백엔드 EventCategory enum (소모임 / 컨퍼런스 / 해커톤 / 스터디 / 프로젝트)
 * 과 일치. 이전에 하드코딩돼 있던 '밋업 / 세미나 / 워크샵' 은 백엔드 카테고리
 * 가 아니라 항상 0개로 표시됐었다. */
const CATEGORY_LIST: readonly string[] = EVENT_CATEGORY_LABELS;

/**
 * Only `home` is pinned. Everything else (events/cart/mypage/login/seller/
 * admin and per-event detail tabs) is closeable; the user can re-open a
 * route tab via the ActivityBar, Sidebar, or command palette. Route tabs
 * lazily appear in `openRouteTabs` once the user navigates to them, so a
 * fresh session shows only the home tab plus whichever route the URL
 * landed on.
 */
const HOME_TAB: TabDef = { key: 'home', label: '홈', icon: 'terminal', route: 'home' };

type CloseableRouteKey = Exclude<RouteKey, 'home' | 'detail'>;

const ROUTE_TAB_DEFS: Record<CloseableRouteKey, TabDef> = {
  events: { key: 'events', label: '이벤트 목록', icon: 'folder', route: 'events', closeable: true },
  cart: { key: 'cart', label: '장바구니', icon: 'cart', route: 'cart', closeable: true },
  mypage: { key: 'mypage', label: '마이페이지', icon: 'user', route: 'mypage', closeable: true },
  login: { key: 'login', label: '로그인', icon: 'terminal', route: 'login', closeable: true },
  // seller/admin 은 권한 보유자에게는 항상 핀 — 닫을 수 없음.
  seller: { key: 'seller', label: '판매자 센터', icon: 'wallet', route: 'seller', closeable: false },
  admin: { key: 'admin', label: '관리자 패널', icon: 'settings', route: 'admin', closeable: false },
};

/** Hard cap on dynamic detail tabs; oldest is evicted FIFO when exceeded. */
const DETAIL_TAB_LIMIT = 5;

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
  const [openRouteTabs, setOpenRouteTabs] = useState<CloseableRouteKey[]>([]);

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
        /* 백엔드가 enum 키(영문)/한글 라벨/대소문자가 섞인 형태로 내려와도
         * 같은 카테고리로 카운트되도록 toCategoryLabel 로 정규화 후 비교. */
        count: events.filter((e) => toCategoryLabel(e.category) === name).length,
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
      setOpenDetailIds((prev) => {
        if (prev.includes(currentDetailId)) return prev;
        const next = [...prev, currentDetailId];
        // FIFO eviction: keep the most recent DETAIL_TAB_LIMIT entries.
        return next.length > DETAIL_TAB_LIMIT
          ? next.slice(next.length - DETAIL_TAB_LIMIT)
          : next;
      });
    }
  }, [currentDetailId]);

  useEffect(() => {
    if (currentRoute === 'home' || currentRoute === 'detail') return;
    const key = currentRoute as CloseableRouteKey;
    setOpenRouteTabs((prev) => (prev.includes(key) ? prev : [...prev, key]));
  }, [currentRoute]);

  // 권한 보유자에게는 seller/admin 탭을 항상 핀으로 노출. 권한이 사라지면
  // (로그아웃/강등) `routeTabs` 의 role 필터가 자동으로 숨김.
  useEffect(() => {
    setOpenRouteTabs((prev) => {
      const next = new Set(prev);
      if (role === 'SELLER' || role === 'ADMIN') next.add('seller');
      if (role === 'ADMIN') next.add('admin');
      return next.size === prev.length ? prev : Array.from(next);
    });
  }, [role]);

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

  const routeTabs = useMemo<TabDef[]>(
    () =>
      openRouteTabs
        .filter((key) => {
          if (key === 'login') return !isLoggedIn;
          if (key === 'seller') return role === 'SELLER' || role === 'ADMIN';
          if (key === 'admin') return role === 'ADMIN';
          return true;
        })
        .map((key) => ROUTE_TAB_DEFS[key]),
    [openRouteTabs, isLoggedIn, role],
  );

  const tabs = useMemo<TabDef[]>(
    () => [HOME_TAB, ...routeTabs, ...detailTabs],
    [routeTabs, detailTabs],
  );

  const activeTabKey =
    currentRoute === 'detail' && currentDetailId
      ? detailTabKey(currentDetailId)
      : currentRoute;

  const handleTabSelect = (tab: TabDef) => {
    onNavigate(tab.route, tab.params);
  };

  const handleTabClose = (tab: TabDef) => {
    if (tab.route === 'detail' && tab.params?.id) {
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
      return;
    }

    if (tab.route === 'home') return;
    if (tab.closeable === false) return;
    const closingKey = tab.route as CloseableRouteKey;
    if (activeTabKey === tab.key) {
      navigate(pathFromRoute('home'));
    }
    setOpenRouteTabs((prev) => prev.filter((k) => k !== closingKey));
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
