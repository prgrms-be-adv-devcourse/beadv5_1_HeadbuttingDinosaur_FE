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
  if (pathname === '/seller' || pathname.startsWith('/seller/')) return 'seller';
  if (pathname === '/admin' || pathname.startsWith('/admin/')) return 'admin';
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
        return `/events?cat=${encodeURIComponent(category)}`;
      }
      return '/events';
    }
    case 'detail': {
      const id = params?.id;
      // Without an id we cannot build a real detail URL — fall back to the
      // list so the tab click is never a no-op. Callers that have a specific
      // detail in mind (e.g. Layout's last-visited tracker) should pass the id.
      return id ? `/events/${encodeURIComponent(id)}` : '/events';
    }
    case 'cart':
      return '/cart';
    case 'mypage':
      return '/mypage';
    case 'seller':
      return '/seller';
    case 'admin':
      return '/admin';
    case 'login':
      return '/login';
  }
}

export function detailIdFromPath(pathname: string): string | null {
  if (!pathname.startsWith('/events/')) return null;
  const id = pathname.slice('/events/'.length).split('/')[0]?.split('?')[0];
  return id ? decodeURIComponent(id) : null;
}
