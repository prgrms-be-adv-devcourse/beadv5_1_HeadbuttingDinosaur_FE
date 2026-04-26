import type { SessionUser } from '../types';

/**
 * Source: docs/redesign/layout.plan.md §3-9.
 *
 * Session row is always expanded (no toggle) — gating logged-out rendering is
 * the parent's responsibility, so user is always non-null here.
 *
 * Markup follows §6-6: section as <h2>, single-item <ul role="list"> with the
 * online dot decorative (aria-hidden) and the trailing "온라인" tag styled via
 * .side-meta.
 */
export interface SidebarSessionProps {
  user: SessionUser;
  className?: string;
}

export function SidebarSession({ user, className }: SidebarSessionProps) {
  const groupCls = className ? `side-group ${className}` : 'side-group';
  return (
    <>
      <h2 className="side-header">세션</h2>
      <ul className={groupCls} role="list">
        <li className="side-item side-item--mini">
          <span className="side-dot" aria-hidden="true" />
          <span>{user.nickname}</span>
          <span className="side-meta">온라인</span>
        </li>
      </ul>
    </>
  );
}
