import type { KeyboardEvent } from 'react';
import { Icon, type IconName } from '../Icon';
import type { RouteKey, TabDef } from './types';

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
 */
export interface TabBarProps {
  tabs: TabDef[];
  activeKey: RouteKey;
  onSelect: (key: RouteKey) => void;
  /** Omit (or pass single tab) to hide the close affordance. */
  onClose?: (key: RouteKey) => void;
  className?: string;
}

export function TabBar({ tabs, activeKey, onSelect, onClose, className }: TabBarProps) {
  const showClose = Boolean(onClose) && tabs.length > 1;
  const containerCls = className ? `ide-tabs ${className}` : 'ide-tabs';

  const handleTabKey = (e: KeyboardEvent<HTMLDivElement>, key: RouteKey) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(key);
    }
  };

  return (
    <div className={containerCls} role="tablist" aria-label="열린 페이지">
      {tabs.map((t) => {
        const isActive = activeKey === t.key;
        return (
          <div
            key={t.key}
            className={isActive ? 'tab active' : 'tab'}
            role="tab"
            aria-selected={isActive}
            aria-controls="ide-editor"
            tabIndex={isActive ? 0 : -1}
            onClick={() => onSelect(t.key)}
            onKeyDown={(e) => handleTabKey(e, t.key)}
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
                  onClose?.(t.key);
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
