import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchEvents } from '@/api/events.api';
import { useAuth } from '@/contexts/AuthContext';
import { useChrome } from '../LayoutChromeContext';
import type { PaletteItem } from '../types';
import { pathFromRoute } from '../utils';

/**
 * Source: docs/archive/v2-cutover/layout.plan.md §3-15.
 *
 * Static commands (6 routes / theme / login-logout) are filtered locally on
 * label+hint substring; event search results are merged in via a debounced
 * `searchEvents` call when the query is non-empty.
 *
 * Item actions perform only their side effect — closing the palette is the
 * parent CommandPalette's responsibility (mirrors the prototype's
 * run() = action() + onClose() split). This keeps each command unit-testable
 * and prevents close-coupling action authors with the palette lifecycle.
 */
export interface UsePaletteCommandsResult {
  items: PaletteItem[];
  loading: boolean;
}

const DEBOUNCE_MS = 200;
const SEARCH_PAGE_SIZE = 10;

export function usePaletteCommands(query: string): UsePaletteCommandsResult {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const { toggleTheme, logout } = useChrome();

  const [eventItems, setEventItems] = useState<PaletteItem[]>([]);
  const [loading, setLoading] = useState(false);

  const staticItems = useMemo<PaletteItem[]>(() => {
    const goCart = () =>
      navigate(isLoggedIn ? pathFromRoute('cart') : pathFromRoute('login'));
    const goMypage = () =>
      navigate(isLoggedIn ? pathFromRoute('mypage') : pathFromRoute('login'));

    return [
      {
        key: 'home',
        label: '홈',
        hint: '시작 화면',
        icon: 'terminal',
        shortcut: 'g h',
        action: () => navigate(pathFromRoute('home')),
      },
      {
        key: 'events',
        label: '이벤트 목록',
        hint: '모든 이벤트 둘러보기',
        icon: 'folder',
        shortcut: 'g e',
        action: () => navigate(pathFromRoute('events')),
      },
      {
        key: 'cart',
        label: '장바구니',
        hint: '담은 티켓 확인',
        icon: 'cart',
        shortcut: 'g c',
        action: goCart,
      },
      {
        key: 'mypage',
        label: '마이페이지',
        hint: '내 티켓 · 주문 내역',
        icon: 'user',
        shortcut: 'g m',
        action: goMypage,
      },
      {
        key: 'auth',
        label: isLoggedIn ? '로그아웃' : '로그인',
        hint: isLoggedIn ? '세션 종료' : '계정에 로그인',
        icon: 'terminal',
        action: () => {
          if (isLoggedIn) {
            logout();
          } else {
            navigate(pathFromRoute('login'));
          }
        },
      },
      {
        key: 'theme',
        label: '테마 전환',
        hint: '라이트 ↔ 다크',
        icon: 'moon',
        action: toggleTheme,
      },
    ];
  }, [navigate, isLoggedIn, toggleTheme, logout]);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setEventItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const res = await searchEvents({
          keyword: trimmed,
          page: 0,
          size: SEARCH_PAGE_SIZE,
        });
        if (cancelled) return;
        const events = res.data?.data?.content ?? [];
        const items: PaletteItem[] = events.map((event) => ({
          key: `ev_${event.eventId}`,
          label: event.title,
          hint: `${event.category} · ${
            event.price === 0 ? '무료' : `${event.price.toLocaleString()}원`
          }`,
          icon: 'ticket',
          action: () =>
            navigate(pathFromRoute('detail', { id: event.eventId })),
        }));
        setEventItems(items);
      } catch {
        if (!cancelled) setEventItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, navigate]);

  const items = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) return staticItems;
    const q = trimmed.toLowerCase();
    const filtered = staticItems.filter((it) =>
      `${it.label} ${it.hint}`.toLowerCase().includes(q),
    );
    return [...filtered, ...eventItems];
  }, [query, staticItems, eventItems]);

  return { items, loading };
}
