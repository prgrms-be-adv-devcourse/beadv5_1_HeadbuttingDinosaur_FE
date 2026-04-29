import { Icon } from '../Icon';
import type { RouteKey, SessionUser } from './types';

/**
 * Source: docs/archive/v2-cutover/layout.plan.md §3-12 + §6-6 a11y markup.
 *
 * Layout (left → right):
 *   git icon · DevTicket | ● 정상 | route label | (spacer) | 한국어 | ● user | ⌘K
 *
 * Only the ⌘K trigger is interactive — the prototype's git slot is decorative
 * with `clickable` styling but no wired handler, so v2 drops the class to keep
 * the §6-5 rule "clickable elements are buttons" honest.
 */
export interface StatusBarProps {
  currentRoute: RouteKey;
  isLoggedIn: boolean;
  user: SessionUser | null;
  onOpenPalette: () => void;
  className?: string;
}

const ROUTE_LABEL: Record<RouteKey, string> = {
  home: '홈',
  events: '이벤트 목록',
  detail: '이벤트 상세',
  cart: '장바구니',
  mypage: '마이페이지',
  login: '로그인',
};

const LANGUAGE_LABEL = '한국어';

export function StatusBar({
  currentRoute,
  isLoggedIn,
  user,
  onOpenPalette,
  className,
}: StatusBarProps) {
  const containerCls = className ? `ide-status ${className}` : 'ide-status';
  const sessionText = isLoggedIn ? `${user?.nickname ?? ''} 님` : '비회원';

  return (
    <footer className={containerCls} role="contentinfo">
      <div className="status-item">
        <Icon name="git" size={12} />
        <span>DevTicket</span>
      </div>
      <div className="status-item term-ok" aria-label="시스템 상태: 정상">
        <span aria-hidden="true">●</span>
        <span aria-hidden="true">정상</span>
      </div>
      <div className="status-item">
        <span>{ROUTE_LABEL[currentRoute]}</span>
      </div>
      <div className="status-spacer" />
      <div className="status-item">{LANGUAGE_LABEL}</div>
      <div className="status-item">
        <span className="term-ok" aria-hidden="true">●</span>
        <span>{sessionText}</span>
      </div>
      <button
        type="button"
        className="status-item clickable"
        aria-label="명령 팔레트 열기"
        onClick={onOpenPalette}
      >
        <kbd>⌘K</kbd>
      </button>
    </footer>
  );
}
