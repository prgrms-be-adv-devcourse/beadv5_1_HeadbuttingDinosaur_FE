import { Icon, type IconName } from '../Icon';
import type { ActivityItem, NavigateFn, RouteKey } from './types';

/**
 * Source: docs/redesign/layout.plan.md §3-5 + §6-6 a11y markup.
 *
 * Items list is a component-internal constant per §3-5. The settings button
 * is rendered separately after the spacer; it is intentionally not wired —
 * §3-5 leaves its click target undecided.
 *
 * Auth gating per §4-2: cart/mypage clicks while logged-out route to login;
 * the cart badge only shows for logged-in users with at least one item.
 *
 * Active rule per §4-1: 'events' item stays active across the events and
 * detail routes (a single nav slot for the events flow).
 */
export interface ActivityBarProps {
  currentRoute: RouteKey;
  cartCount: number;
  isLoggedIn: boolean;
  onNavigate: NavigateFn;
  onOpenPalette: () => void;
  className?: string;
}

const ITEMS: ActivityItem[] = [
  { key: 'home', icon: 'terminal', label: '홈' },
  { key: 'events', icon: 'folder', label: '이벤트' },
  { key: 'search', icon: 'search', label: '검색', action: 'palette' },
  { key: 'cart', icon: 'cart', label: '장바구니' },
  { key: 'mypage', icon: 'user', label: '마이페이지' },
];

function isItemActive(item: ActivityItem, currentRoute: RouteKey): boolean {
  if (item.action === 'palette') return false;
  if (item.key === 'events') {
    return currentRoute === 'events' || currentRoute === 'detail';
  }
  return item.key === currentRoute;
}

export function ActivityBar({
  currentRoute,
  cartCount,
  isLoggedIn,
  onNavigate,
  onOpenPalette,
  className,
}: ActivityBarProps) {
  const containerCls = className ? `ide-activity ${className}` : 'ide-activity';

  const handleClick = (item: ActivityItem) => {
    if (item.action === 'palette') {
      onOpenPalette();
      return;
    }
    if ((item.key === 'cart' || item.key === 'mypage') && !isLoggedIn) {
      onNavigate('login');
      return;
    }
    onNavigate(item.key as RouteKey);
  };

  return (
    <nav className={containerCls} aria-label="주요 메뉴">
      {ITEMS.map((item) => {
        const active = isItemActive(item, currentRoute);
        const showBadge = item.key === 'cart' && isLoggedIn && cartCount > 0;
        const ariaLabel = showBadge ? `${item.label} ${cartCount}개` : item.label;
        return (
          <button
            key={item.key}
            type="button"
            className={active ? 'act-btn active' : 'act-btn'}
            aria-label={ariaLabel}
            aria-current={active ? 'page' : undefined}
            onClick={() => handleClick(item)}
          >
            <Icon name={item.icon as IconName} size={20} />
            {showBadge && (
              <span className="act-badge" aria-hidden="true">
                {cartCount}
              </span>
            )}
          </button>
        );
      })}
      <div className="act-spacer" />
      <button type="button" className="act-btn" aria-label="설정">
        <Icon name="settings" size={18} />
      </button>
    </nav>
  );
}
