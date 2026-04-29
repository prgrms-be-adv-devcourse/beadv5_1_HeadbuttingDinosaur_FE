import type { KeyboardEvent } from 'react';
import { Icon, type IconName } from '../Icon';
import type { TabDef } from './types';

/**
 * Source: docs/archive/v2-cutover/layout.plan.md §3-10.
 *
 * Each tab is a <div role="tab"> rather than a <button> so the inner close
 * <button> remains valid HTML (button-in-button is invalid). Selection is
 * still keyboard-accessible via Enter / Space + tabIndex roving (active tab
 * is the only one in the tab order; others are reachable via Tab → arrow nav
 * within the tablist would be the next refinement, currently out of scope).
 *
 * §6-6 a11y: role="tablist" + aria-label, each tab aria-selected and
 * aria-controls="ide-editor"; close button has explicit aria-label.
 *
 * Close affordance is per-tab via `tab.closeable`. Only the home tab is
 * pinned; route tabs (events/cart/mypage/login/seller/admin) and dynamic
 * detail tabs are all user-dismissible.
 */
export interface TabBarProps {
  tabs: TabDef[];
  activeKey: string;
  onSelect: (tab: TabDef) => void;
  onClose?: (tab: TabDef) => void;
  className?: string;
}

export function TabBar({ tabs, activeKey, onSelect, onClose, className }: TabBarProps) {
  const containerCls = className ? `ide-tabs ${className}` : 'ide-tabs';

  const handleTabKey = (e: KeyboardEvent<HTMLDivElement>, tab: TabDef) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(tab);
    }
  };

  return (
    <div className={containerCls} role="tablist" aria-label="열린 페이지">
      {tabs.map((t) => {
        const isActive = activeKey === t.key;
        const showClose = Boolean(onClose) && t.closeable;
        return (
          <div
            key={t.key}
            className={isActive ? 'tab active' : 'tab'}
            role="tab"
            aria-selected={isActive}
            aria-controls="ide-editor"
            tabIndex={isActive ? 0 : -1}
            onClick={() => onSelect(t)}
            onKeyDown={(e) => handleTabKey(e, t)}
          >
            <Icon name={t.icon as IconName} size={13} />
            <span>{t.label}</span>
            {showClose && (
              <button
                type="button"
                className="close"
                aria-label={`${t.label} 탭 닫기`}
                onClick={(e) => {
                  e.stopPropagation();
                  onClose?.(t);
                }}
              >
                <Icon name="x" size={12} />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
