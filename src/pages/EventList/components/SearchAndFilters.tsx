import type { RefObject } from 'react';
import { Chip } from '@/components/Chip';
import { Icon } from '@/components/Icon';
import { Kbd } from '@/components/Kbd';

export interface SearchAndFiltersProps {
  keyword: string;
  onKeywordChange: (next: string) => void;
  category: string;
  onCategoryChange: (next: string) => void;
  categories: readonly string[];
  searchInputRef?: RefObject<HTMLInputElement>;
}

export function SearchAndFilters({
  keyword,
  onKeywordChange,
  category,
  onCategoryChange,
  categories,
  searchInputRef,
}: SearchAndFiltersProps) {
  return (
    <div className="el-filters">
      <div className="el-search input input-code">
        <div className="input-control">
          <span className="input-icon-start" aria-hidden="true">
            <Icon name="search" size={16} />
          </span>
          <input
            ref={searchInputRef}
            className="input-field"
            type="search"
            placeholder="이벤트명이나 기술 스택으로 검색"
            value={keyword}
            onChange={(e) => onKeywordChange(e.target.value)}
            aria-label="이벤트 검색"
          />
          <span className="input-hint-end">
            <Kbd>/</Kbd>
          </span>
        </div>
      </div>

      <div className="el-filter-group">
        <div className="el-filter-label">카테고리</div>
        <div className="el-filter-chips">
          {categories.map((c) => (
            <Chip
              key={c}
              active={category === c}
              onClick={() => onCategoryChange(c)}
            >
              {c}
            </Chip>
          ))}
        </div>
      </div>
    </div>
  );
}
