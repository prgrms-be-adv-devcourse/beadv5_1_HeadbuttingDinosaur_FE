import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { EmptyStackTrace } from './components/EmptyStackTrace';
import { ErrorState } from './components/ErrorState';
import { EventCard } from './components/EventCard';
import { EventCardSkeleton } from './components/EventCardSkeleton';
import { Hero } from './components/Hero';
import { Pagination } from './components/Pagination';
import { ResultHeader } from './components/ResultHeader';
import { SearchAndFilters } from './components/SearchAndFilters';
import { DEFAULT_CATEGORY } from './adapters';
import {
  type UseEventsReturn,
  useEventListFilters,
  useEvents,
  useTechStacks,
} from './hooks';

import { useDebounce } from '@/hooks/useDebounce';
import { EVENT_CATEGORY_LABELS } from '@/pages/_shared/category';

const SEARCH_DEBOUNCE_MS = 400;

const CATEGORIES = ['전체', ...EVENT_CATEGORY_LABELS] as const;

const SKELETON_COUNT = 8;

function getDisplayPage(query: UseEventsReturn) {
  if (query.status === 'success') return query.data;
  if (query.status === 'loading') return query.previous;
  if (query.status === 'error') return query.previous;
  return undefined;
}

export default function EventList() {
  const navigate = useNavigate();
  const { filters, setFilters } = useEventListFilters();
  const techStacks = useTechStacks();
  const stackNames = useMemo(
    () => techStacks.items.map((s) => s.name),
    [techStacks.items],
  );
  const query = useEvents(filters, techStacks.byName);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // 입력은 로컬에서만 즉시 반영하고, 디바운스된 값만 URL/필터로 푸시 —
  // 매 키스트로크마다 ES 요청이 폭주하던 문제 완화.
  const [searchInput, setSearchInput] = useState(filters.keyword);
  const debouncedSearch = useDebounce(searchInput, SEARCH_DEBOUNCE_MS);
  const lastPushedKeywordRef = useRef(filters.keyword);

  useEffect(() => {
    if (debouncedSearch === filters.keyword) return;
    lastPushedKeywordRef.current = debouncedSearch;
    setFilters({ keyword: debouncedSearch });
    // setFilters 는 useSearchParams 기반으로 안정적이지 않을 수 있으나
    // 필요한 트리거는 debouncedSearch 변경뿐.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  // 외부에서 filters.keyword 가 바뀐 경우 (리셋, 뒤로가기 등) 입력값 동기화.
  // 우리가 방금 푸시한 값이면 무시해 사용자의 추가 타이핑을 덮지 않도록.
  useEffect(() => {
    if (filters.keyword === lastPushedKeywordRef.current) return;
    lastPushedKeywordRef.current = filters.keyword;
    setSearchInput(filters.keyword);
  }, [filters.keyword]);

  const displayPage = getDisplayPage(query);
  const hasActiveFilters =
    filters.keyword.trim() !== '' ||
    filters.category !== DEFAULT_CATEGORY ||
    filters.stack !== '';

  const onResetFilters = () => {
    setFilters({ keyword: '', category: DEFAULT_CATEGORY, stack: '', page: 0 });
  };

  const onOpenEvent = (eventId: string) => {
    navigate(`/events/${encodeURIComponent(eventId)}`);
  };

  return (
    <div className="editor-scroll">
      <div className="gutter" aria-hidden="true">
        {Array.from({ length: 60 }, (_, i) => (
          <span key={i} className={`ln${i === 0 ? ' active' : ''}`}>
            {i + 1}
          </span>
        ))}
      </div>
      <div className="editor-body el-page">
        <Hero totalCount={displayPage?.totalElements ?? 0} />
        <SearchAndFilters
          keyword={searchInput}
          onKeywordChange={setSearchInput}
          category={filters.category}
          onCategoryChange={(next) => setFilters({ category: next })}
          categories={CATEGORIES}
          stack={filters.stack}
          onStackChange={(next) => setFilters({ stack: next })}
          stacks={stackNames}
          searchInputRef={searchInputRef}
        />
        <ResultHeader
          filteredCount={displayPage?.totalElements ?? 0}
          totalCount={displayPage?.totalElements ?? 0}
        />

        {query.status === 'error' && !displayPage ? (
          <ErrorState onRetry={query.refetch} />
        ) : query.status === 'loading' && !displayPage ? (
          <div className="el-grid">
            {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
              <EventCardSkeleton key={i} />
            ))}
          </div>
        ) : !displayPage || displayPage.items.length === 0 ? (
          <EmptyStackTrace
            hasActiveFilters={hasActiveFilters}
            onReset={onResetFilters}
          />
        ) : (
          <>
            <div className="el-grid">
              {displayPage.items.map((event) => (
                <EventCard
                  key={event.eventId}
                  event={event}
                  onOpen={() => onOpenEvent(event.eventId)}
                />
              ))}
            </div>
            <Pagination
              page={displayPage.page}
              totalPages={displayPage.totalPages}
              hasNext={displayPage.hasNext}
              onPageChange={(next) => setFilters({ page: next })}
            />
          </>
        )}
      </div>
    </div>
  );
}
