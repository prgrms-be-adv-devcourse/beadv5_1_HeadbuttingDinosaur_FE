/**
 * URL ↔ RouteKey conversion for the v2 Layout chrome.
 * Source: docs/archive/v2-cutover/layout.plan.md §4-1.
 *
 * `/` maps to 'home' per the Landing-introduced policy. Until the cutover PR
 * wires Landing to `/`, this PR's dev preview drives currentRoute directly via
 * mock state, so the mismatch with the production `/` (currently EventList) is
 * not exercised at runtime.
 */

import type { NavParams, RouteKey } from './types';

export function routeFromPath(pathname: string): RouteKey {
  if (pathname === '/') return 'home';
  if (pathname === '/events' || pathname.startsWith('/events/')) {
    return pathname === '/events' ? 'events' : 'detail';
  }
  if (pathname === '/cart' || pathname.startsWith('/cart/')) return 'cart';
  if (pathname === '/mypage' || pathname.startsWith('/mypage/')) return 'mypage';
  if (pathname === '/login') return 'login';
  return 'home';
}

export function pathFromRoute(key: RouteKey, params?: NavParams): string {
  switch (key) {
    case 'home':
      return '/';
    case 'events': {
      const category = params?.category;
      if (category) {
        return `/events?category=${encodeURIComponent(category)}`;
      }
      return '/events';
    }
    case 'detail': {
      const id = params?.id;
      if (!id) {
        throw new Error("pathFromRoute('detail') requires params.id");
      }
      return `/events/${encodeURIComponent(id)}`;
    }
    case 'cart':
      return '/cart';
    case 'mypage':
      return '/mypage';
    case 'login':
      return '/login';
  }
}
