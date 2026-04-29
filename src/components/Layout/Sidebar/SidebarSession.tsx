import type { SessionUser } from '../types';
import { useChrome } from '../LayoutChromeContext';

/**
 * Source: docs/archive/v2-cutover/layout.plan.md §3-9.
 *
 * Session row is always expanded (no toggle) — gating logged-out rendering is
 * the parent's responsibility, so user is always non-null here.
 *
 * The online state is conveyed by the green .side-dot, so the trailing slot
 * doubles as a logout affordance instead of a redundant "온라인" label.
 */
export interface SidebarSessionProps {
  user: SessionUser;
  className?: string;
}

export function SidebarSession({ user, className }: SidebarSessionProps) {
  const groupCls = className ? `side-group ${className}` : 'side-group';
  const { logout } = useChrome();
  return (
    <>
      <h2 className="side-header">세션</h2>
      <ul className={groupCls} role="list">
        <li className="side-item side-item--mini">
          <span className="side-dot" aria-hidden="true" title="온라인" />
          <span>{user.nickname}</span>
          <button
            type="button"
            className="side-meta side-meta--button"
            onClick={logout}
            aria-label={`${user.nickname} 로그아웃`}
          >
            로그아웃
          </button>
        </li>
      </ul>
    </>
  );
}
