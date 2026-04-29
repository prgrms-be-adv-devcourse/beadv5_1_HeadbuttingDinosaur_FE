import { Icon } from '../Icon';
import type { ThemeMode } from './types';

/**
 * Source: docs/archive/v2-cutover/layout.plan.md §3-4 + §6-6 a11y markup.
 *
 * theme arrives as a 'light' | 'dark' resolved value (§4-3): 'system' has been
 * collapsed at the Layout level. Sun icon means "switch to light" (so it shows
 * when currently dark), and vice versa.
 *
 * The title-cmd "search box" is actually a <button> that opens the command
 * palette — there is no real <input> in the title bar. The §3-2
 * registerSearchInput / focusSearch hooks remain forward-looking; this PR
 * simply does not call registerSearchInput from here.
 */
export interface TitleBarProps {
  theme: ThemeMode;
  onToggleTheme: () => void;
  onOpenPalette: () => void;
  className?: string;
}

export function TitleBar({ theme, onToggleTheme, onOpenPalette, className }: TitleBarProps) {
  const containerCls = className ? `ide-title ${className}` : 'ide-title';
  const themeIcon = theme === 'dark' ? 'sun' : 'moon';

  return (
    <header className={containerCls} role="banner">
      <div className="traffic" aria-hidden="true">
        <span className="tc-red" />
        <span className="tc-yellow" />
        <span className="tc-green" />
      </div>
      <h1 className="title-text">DevTicket · 개발자를 위한 이벤트 티켓</h1>
      <button
        type="button"
        className="title-cmd"
        aria-label="명령 팔레트 열기 (⌘K)"
        onClick={onOpenPalette}
      >
        <Icon name="search" size={11} />
        <span>이벤트, 기술 스택으로 검색하기</span>
        <kbd>⌘K</kbd>
      </button>
      <button
        type="button"
        className="act-btn"
        aria-label="테마 전환"
        onClick={onToggleTheme}
      >
        <Icon name={themeIcon} size={14} />
      </button>
    </header>
  );
}
