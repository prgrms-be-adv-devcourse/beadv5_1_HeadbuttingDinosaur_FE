/**
 * Shared types for the v2 Layout chrome.
 * Source: docs/archive/v2-cutover/layout.plan.md §3-1.
 */

export type RouteKey =
  | 'home'
  | 'events'
  | 'detail'
  | 'cart'
  | 'mypage'
  | 'login'
  | 'seller'
  | 'admin';

export type ActivityKey = RouteKey | 'search' | 'settings';

export interface ActivityItem {
  key: ActivityKey;
  /** Icon component name (e.g. 'terminal', 'folder', 'cart'). */
  icon: string;
  /** Tooltip + accessibility label. */
  label: string;
  /** Shown only when greater than 0. */
  badge?: number;
  /** When 'palette', clicking opens the command palette instead of navigating. */
  action?: 'palette';
}

export interface TabDef {
  key: RouteKey;
  label: string;
  icon: string;
}

export interface PaletteItem {
  key: string;
  label: string;
  hint: string;
  icon: string;
  /** Display-only ('g h' etc); the actual binding lives in useGlobalShortcuts. */
  shortcut?: string;
  action: () => void;
}

export interface UpcomingEventVM {
  eventId: string;
  title: string;
  /** Pre-formatted, e.g. "2026-05-12". */
  dateText: string;
  /** Pre-formatted, e.g. "무료" or "49,000원". */
  priceText: string;
}

export interface CategoryCount {
  name: string;
  count: number;
}

export interface SessionUser {
  nickname: string;
}

export type ThemeMode = 'light' | 'dark';

export type NavParams = { id?: string; category?: string };
export type NavigateFn = (key: RouteKey, params?: NavParams) => void;
