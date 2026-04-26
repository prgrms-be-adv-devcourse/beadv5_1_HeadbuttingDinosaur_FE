import { useEffect, useMemo } from 'react';
import EventListView from './EventList';
import { useEvents, useEventListFilters } from './hooks';

export default function EventListPage() {
  const { filters } = useEventListFilters();
  // PR 2에서 SearchAndFilters와 함께 실제 마스터 목록으로 교체.
  const stackNameToId = useMemo(() => new Map<string, number>(), []);
  const query = useEvents(filters, stackNameToId);

  useEffect(() => {
    if (import.meta.env.DEV && query.status === 'success') {
      // PR 1 검증: 응답 정상 시 변환된 EventVM[] 길이 확인.
      console.log('[EventList v2] items:', query.data.items.length);
    }
  }, [query]);

  return <EventListView />;
}
