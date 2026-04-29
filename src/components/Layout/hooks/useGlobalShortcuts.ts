import { useEffect, useRef } from 'react';
import type { NavigateFn } from '../types';

/**
 * Source: docs/redesign/layout.plan.md §3-16 + §6-5 keyboard table.
 *
 * Always-on keys (work even inside inputs):
 *   Cmd/Ctrl+K → onOpenPalette
 *   Escape     → onClosePalette
 *
 * Outside-input keys:
 *   /          → onFocusSearch
 *   g h/e/c/m  → onNavigate (cart/mypage gate to login when !isLoggedIn)
 *   j / k      → onCardNav(±1) — only if the page wires it
 *   Enter      → onCardOpen — only if wired AND focus is not on an
 *                interactive element (avoids double-firing native handlers)
 *
 * `g` is a two-key sequence with a 1s timeout; an unrelated key in the pending
 * window resets it but falls through so 'g' can restart and 'j'/'k' still work.
 *
 * The handler is bound once via useEffect and reads opts via a ref to avoid
 * re-binding the listener every render.
 */
export interface UseGlobalShortcutsOptions {
  isLoggedIn: boolean;
  onOpenPalette: () => void;
  onClosePalette: () => void;
  onFocusSearch: () => void;
  onNavigate: NavigateFn;
  onCardNav?: (delta: 1 | -1) => void;
  onCardOpen?: () => void;
}

const G_SEQUENCE_TIMEOUT_MS = 1000;

function isInInput(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA') return true;
  if (target.isContentEditable) return true;
  return false;
}

function isInteractiveTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === 'BUTTON' || tag === 'A') return true;
  const role = target.getAttribute('role');
  return role === 'button' || role === 'tab' || role === 'option' || role === 'link';
}

export function useGlobalShortcuts(opts: UseGlobalShortcutsOptions): void {
  const optsRef = useRef(opts);
  optsRef.current = opts;

  useEffect(() => {
    let gPending = false;
    let gTimer: number | null = null;

    const clearG = () => {
      gPending = false;
      if (gTimer != null) {
        window.clearTimeout(gTimer);
        gTimer = null;
      }
    };

    const handler = (e: KeyboardEvent) => {
      const o = optsRef.current;
      const target = e.target;

      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        o.onOpenPalette();
        clearG();
        return;
      }

      if (e.key === 'Escape') {
        o.onClosePalette();
        clearG();
        return;
      }

      if (isInInput(target)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (gPending) {
        const k = e.key.toLowerCase();
        let consumed = true;
        if (k === 'h') o.onNavigate('home');
        else if (k === 'e') o.onNavigate('events');
        else if (k === 'c') o.onNavigate(o.isLoggedIn ? 'cart' : 'login');
        else if (k === 'm') o.onNavigate(o.isLoggedIn ? 'mypage' : 'login');
        else consumed = false;
        clearG();
        if (consumed) {
          e.preventDefault();
          return;
        }
      }

      if (e.key === 'g') {
        gPending = true;
        gTimer = window.setTimeout(clearG, G_SEQUENCE_TIMEOUT_MS);
        return;
      }

      if (e.key === '/') {
        e.preventDefault();
        o.onFocusSearch();
        return;
      }

      if (e.key === 'j' && o.onCardNav) {
        e.preventDefault();
        o.onCardNav(1);
        return;
      }

      if (e.key === 'k' && o.onCardNav) {
        e.preventDefault();
        o.onCardNav(-1);
        return;
      }

      if (e.key === 'Enter' && o.onCardOpen) {
        if (isInteractiveTarget(target)) return;
        o.onCardOpen();
      }
    };

    document.addEventListener('keydown', handler);
    return () => {
      document.removeEventListener('keydown', handler);
      clearG();
    };
  }, []);
}
