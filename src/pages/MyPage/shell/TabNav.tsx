import { Link } from 'react-router-dom';
import { Icon } from '@/components';
import type { TabMeta } from '../shared/tabs';
import type { TabKey } from '../shared/types';

export interface TabNavProps {
  active: TabKey;
  tabs: readonly TabMeta[];
}

export function TabNav({ active, tabs }: TabNavProps) {
  return (
    <div className="mypage-tab-track" role="tablist">
      {tabs.map((t) => {
        const isActive = active === t.key;
        return (
          <Link
            key={t.key}
            to={t.path}
            role="tab"
            aria-selected={isActive}
            className={`mypage-tab ${isActive ? 'is-active' : ''}`}
            replace
          >
            <Icon name={t.icon} size={13} />
            <span>{t.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
