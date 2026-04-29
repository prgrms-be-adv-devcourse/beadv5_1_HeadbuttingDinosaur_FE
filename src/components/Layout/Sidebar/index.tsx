import { useState } from 'react';
import type {
  CategoryCount,
  NavigateFn,
  RouteKey,
  SessionUser,
  UpcomingEventVM,
} from '../types';
import { SidebarMenu } from './SidebarMenu';
import { SidebarUpcoming } from './SidebarUpcoming';
import { SidebarSession } from './SidebarSession';

/**
 * Source: docs/archive/v2-cutover/layout.plan.md §3-6.
 *
 * Container only — owns the two collapse states (menu, upcoming) per §3-6 and
 * gates SidebarSession on auth (§4-2). Session is always expanded (§3-9).
 *
 * Selecting an upcoming event delegates to onNavigate('detail', { id: … }) so
 * route-shaping stays in the parent (§4-1 routing rules).
 */
export interface SidebarProps {
  currentRoute: RouteKey;
  isLoggedIn: boolean;
  user: SessionUser | null;
  totalEventCount: number;
  categories: CategoryCount[];
  upcoming: UpcomingEventVM[];
  onNavigate: NavigateFn;
  className?: string;
}

export function Sidebar({
  currentRoute,
  isLoggedIn,
  user,
  totalEventCount,
  categories,
  upcoming,
  onNavigate,
  className,
}: SidebarProps) {
  const [menuOpen, setMenuOpen] = useState(true);
  const [upcomingOpen, setUpcomingOpen] = useState(true);

  const containerCls = className ? `ide-sidebar ${className}` : 'ide-sidebar';

  const handleSelectEvent = (eventId: string) => {
    onNavigate('detail', { id: eventId });
  };

  return (
    <aside className={containerCls} aria-label="사이드 네비게이션">
      <SidebarMenu
        currentRoute={currentRoute}
        isLoggedIn={isLoggedIn}
        open={menuOpen}
        onToggle={() => setMenuOpen((v) => !v)}
        totalEventCount={totalEventCount}
        categories={categories}
        onNavigate={onNavigate}
      />
      <SidebarUpcoming
        open={upcomingOpen}
        onToggle={() => setUpcomingOpen((v) => !v)}
        events={upcoming}
        onSelectEvent={handleSelectEvent}
      />
      {isLoggedIn && user && <SidebarSession user={user} />}
    </aside>
  );
}
