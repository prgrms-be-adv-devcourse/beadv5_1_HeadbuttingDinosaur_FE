import { Icon } from '../../Icon';
import type { CategoryCount, NavigateFn, RouteKey } from '../types';

/**
 * Source: docs/redesign/layout.plan.md §3-7.
 *
 * Item active rule per §4-1: simple 1:1 with currentRoute (events item is
 * active only on 'events', not 'detail' — distinct from ActivityBar).
 *
 * Auth gating per §4-2: cart/mypage clicks while logged-out route to login;
 * the explicit "로그인" row is only shown for logged-out sessions.
 *
 * Categories use the shared aria-label "${name}, ${count}개" form (§6-6).
 */
export interface SidebarMenuProps {
  currentRoute: RouteKey;
  isLoggedIn: boolean;
  open: boolean;
  onToggle: () => void;
  totalEventCount: number;
  categories: CategoryCount[];
  onNavigate: NavigateFn;
  className?: string;
}

const LIST_ID = 'side-menu-group';

const itemCls = (active: boolean) => (active ? 'side-item active' : 'side-item');

export function SidebarMenu({
  currentRoute,
  isLoggedIn,
  open,
  onToggle,
  totalEventCount,
  categories,
  onNavigate,
  className,
}: SidebarMenuProps) {
  const groupCls = className ? `side-group ${className}` : 'side-group';

  const handleAuthRoute = (route: RouteKey) => {
    if ((route === 'cart' || route === 'mypage') && !isLoggedIn) {
      onNavigate('login');
      return;
    }
    onNavigate(route);
  };

  return (
    <>
      <button
        type="button"
        className="side-header"
        aria-expanded={open}
        aria-controls={LIST_ID}
        onClick={onToggle}
      >
        <span>메뉴</span>
        <Icon name={open ? 'chevd' : 'chev'} size={10} />
      </button>
      {open && (
        <ul id={LIST_ID} className={groupCls} role="list">
          <li>
            <button
              type="button"
              className={itemCls(currentRoute === 'home')}
              aria-current={currentRoute === 'home' ? 'page' : undefined}
              onClick={() => onNavigate('home')}
            >
              <span className="tri" aria-hidden="true">▸</span>
              <Icon name="terminal" size={13} />
              <span>홈</span>
            </button>
          </li>

          <li>
            <button
              type="button"
              className={itemCls(currentRoute === 'events')}
              aria-current={currentRoute === 'events' ? 'page' : undefined}
              onClick={() => onNavigate('events')}
            >
              <span className="tri" aria-hidden="true">▾</span>
              <Icon name="folder" size={13} />
              <span>이벤트 둘러보기</span>
              <span className="side-count">{totalEventCount}</span>
            </button>
          </li>

          {categories.map((cat) => (
            <li key={cat.name}>
              <button
                type="button"
                className="side-item side-nested"
                aria-label={`${cat.name}, ${cat.count}개`}
                onClick={() => onNavigate('events', { category: cat.name })}
              >
                <span className="side-prefix" aria-hidden="true">#</span>
                <span>{cat.name}</span>
                <span className="side-count" aria-hidden="true">{cat.count}</span>
              </button>
            </li>
          ))}

          <li>
            <button
              type="button"
              className={itemCls(currentRoute === 'cart')}
              aria-current={currentRoute === 'cart' ? 'page' : undefined}
              onClick={() => handleAuthRoute('cart')}
            >
              <span className="tri" aria-hidden="true">▸</span>
              <Icon name="cart" size={13} />
              <span>장바구니</span>
            </button>
          </li>

          <li>
            <button
              type="button"
              className={itemCls(currentRoute === 'mypage')}
              aria-current={currentRoute === 'mypage' ? 'page' : undefined}
              onClick={() => handleAuthRoute('mypage')}
            >
              <span className="tri" aria-hidden="true">▸</span>
              <Icon name="user" size={13} />
              <span>마이페이지</span>
            </button>
          </li>

          {!isLoggedIn && (
            <li>
              <button
                type="button"
                className={itemCls(currentRoute === 'login')}
                aria-current={currentRoute === 'login' ? 'page' : undefined}
                onClick={() => onNavigate('login')}
              >
                <span className="tri" aria-hidden="true">▸</span>
                <Icon name="terminal" size={13} />
                <span>로그인</span>
              </button>
            </li>
          )}
        </ul>
      )}
    </>
  );
}
