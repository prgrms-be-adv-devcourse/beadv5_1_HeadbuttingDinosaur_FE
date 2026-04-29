import { useCallback, useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { PaletteList } from './PaletteList';
import { usePaletteCommands } from './usePaletteCommands';

/**
 * Source: docs/archive/v2-cutover/layout.plan.md §3-13 + §6-7 focus trap.
 *
 * Lifecycle (§6-7):
 *   open=true  → capture document.activeElement, reset query/index, focus input
 *   open=false → return null + restore the captured element's focus
 *
 * Focus trap: two sibling tabindex=0 sentinels around the dialog body. The
 * only natively focusable element inside is the search input — sentinels
 * always redirect Tab/Shift+Tab back to the input, keeping focus inside the
 * modal (the listbox uses aria-activedescendant, so options never take focus).
 *
 * Combobox a11y (§6-7):
 *   role="combobox" + aria-autocomplete="list" + aria-activedescendant
 *   pointing at "palette-item-${selectedIndex}" — PaletteList emits matching
 *   ids on each <li role="option">.
 *
 * Item run = side-effect + onClose, mirroring the prototype's split — the
 * hook author writes only the action, the dialog handles the close.
 */
export interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

const FOCUS_DELAY_MS = 10;

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);

  const { items } = usePaletteCommands(query);

  useEffect(() => {
    if (!open) {
      lastFocusedRef.current?.focus();
      lastFocusedRef.current = null;
      return;
    }
    lastFocusedRef.current = document.activeElement as HTMLElement | null;
    setQuery('');
    setSelectedIndex(0);
    const t = window.setTimeout(() => inputRef.current?.focus(), FOCUS_DELAY_MS);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (selectedIndex >= items.length) {
      setSelectedIndex(Math.max(0, items.length - 1));
    }
  }, [items.length, selectedIndex]);

  const run = useCallback(
    (i: number) => {
      const item = items[i];
      if (!item) return;
      item.action();
      onClose();
    },
    [items, onClose],
  );

  const handleInputKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((s) => Math.min(s + 1, Math.max(0, items.length - 1)));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((s) => Math.max(s - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      run(selectedIndex);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  const trapFocus = () => inputRef.current?.focus();

  if (!open) return null;

  const activeId =
    items.length > 0 && selectedIndex < items.length
      ? `palette-item-${selectedIndex}`
      : undefined;

  return (
    <div className="palette-backdrop" onClick={onClose}>
      <div
        className="palette"
        role="dialog"
        aria-modal="true"
        aria-label="명령 팔레트"
        onClick={(e) => e.stopPropagation()}
      >
        <div tabIndex={0} onFocus={trapFocus} aria-hidden="true" />
        <input
          ref={inputRef}
          className="palette-input"
          type="text"
          placeholder="명령이나 이벤트 검색..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedIndex(0);
          }}
          onKeyDown={handleInputKey}
          role="combobox"
          aria-expanded={items.length > 0}
          aria-autocomplete="list"
          aria-activedescendant={activeId}
          aria-label="명령 또는 이벤트 검색"
        />
        <PaletteList
          items={items}
          selectedIndex={selectedIndex}
          onHover={setSelectedIndex}
          onRun={run}
        />
        <div className="palette-hint">
          <span>
            <kbd>↑↓</kbd>이동
          </span>
          <span>
            <kbd>↵</kbd>실행
          </span>
          <span>
            <kbd>esc</kbd>닫기
          </span>
          <span className="palette-hint-count">{items.length}개 결과</span>
        </div>
        <div tabIndex={0} onFocus={trapFocus} aria-hidden="true" />
      </div>
    </div>
  );
}
