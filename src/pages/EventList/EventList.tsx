import { useMemo, useRef } from 'react';
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
} from './hooks';

import { EVENT_CATEGORY_LABELS } from '@/pages/_shared/category';

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
  const stackNameToId = useMemo(() => new Map<string, number>(), []);
  const query = useEvents(filters, stackNameToId);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const displayPage = getDisplayPage(query);
  const hasActiveFilters =
    filters.keyword.trim() !== '' || filters.category !== DEFAULT_CATEGORY;

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
          keyword={filters.keyword}
          onKeywordChange={(next) => setFilters({ keyword: next })}
          category={filters.category}
          onCategoryChange={(next) => setFilters({ category: next })}
          categories={CATEGORIES}
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
