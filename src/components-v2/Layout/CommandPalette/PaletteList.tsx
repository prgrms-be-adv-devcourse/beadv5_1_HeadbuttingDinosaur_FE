import { Icon, type IconName } from '../../Icon';
import type { PaletteItem } from '../types';

/**
 * Source: docs/redesign/layout.plan.md §3-14 + §6-7 a11y.
 *
 * Empty-state rendering ("검색 결과가 없습니다") is this component's
 * responsibility per §3-14. When empty, the listbox is omitted entirely —
 * an aria-controls relationship from the input is broken in that state, but
 * the alternative (a non-option child inside the listbox) muddies semantics.
 *
 * Items render as <li role="option"> per §6-7 with stable id="palette-item-${i}";
 * the parent CommandPalette wires aria-activedescendant on the input so
 * arrow-key navigation is announced without moving DOM focus off the input.
 *
 * Hover updates selectedIndex (mouse-driven) via onHover; click runs the
 * action via onRun. Keyboard arrow handling lives at the input/parent level.
 */
export interface PaletteListProps {
  items: PaletteItem[];
  selectedIndex: number;
  onHover: (index: number) => void;
  onRun: (index: number) => void;
  className?: string;
}

export function PaletteList({
  items,
  selectedIndex,
  onHover,
  onRun,
  className,
}: PaletteListProps) {
  if (items.length === 0) {
    const emptyCls = className ? `palette-empty ${className}` : 'palette-empty';
    return <div className={emptyCls}>검색 결과가 없습니다</div>;
  }

  const listCls = className ? `palette-list ${className}` : 'palette-list';

  return (
    <ul className={listCls} role="listbox" aria-label="검색 결과">
      {items.map((item, i) => {
        const isSelected = i === selectedIndex;
        return (
          <li
            key={item.key}
            id={`palette-item-${i}`}
            role="option"
            aria-selected={isSelected}
            className={isSelected ? 'palette-item sel' : 'palette-item'}
            onMouseEnter={() => onHover(i)}
            onClick={() => onRun(i)}
          >
            <Icon name={item.icon as IconName} size={14} className="fi" />
            <div className="palette-item-body">
              <div className="palette-item-label truncate">{item.label}</div>
              <div className="palette-item-hint">{item.hint}</div>
            </div>
            {item.shortcut && <span className="shortcut">{item.shortcut}</span>}
          </li>
        );
      })}
    </ul>
  );
}
