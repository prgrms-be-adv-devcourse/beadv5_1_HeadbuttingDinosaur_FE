import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiClient, unwrapApiData, type ApiResponse } from '@/api/client';
import type { EventListResponse } from '@/api/types';
import type { EventListFilters, EventListPage, EventsQuery } from './types';
import {
  DEFAULT_CATEGORY,
  applyClientSideFilters,
  serializeFilters,
  sortByActiveFirst,
  toEventListPage,
  toFilterRequest,
} from './adapters';

const DEFAULT_FILTERS: EventListFilters = {
  keyword: '',
  category: DEFAULT_CATEGORY,
  stack: '',
  page: 0,
};

const readFilters = (sp: URLSearchParams): EventListFilters => ({
  keyword: sp.get('q') ?? DEFAULT_FILTERS.keyword,
  category: sp.get('cat') ?? DEFAULT_FILTERS.category,
  stack: sp.get('stack') ?? DEFAULT_FILTERS.stack,
  page: Number(sp.get('page') ?? DEFAULT_FILTERS.page),
});

const writeFilters = (
  sp: URLSearchParams,
  patch: Partial<EventListFilters>,
): URLSearchParams => {
  const next = new URLSearchParams(sp);
  const put = (k: string, v: string, isDefault: boolean) =>
    isDefault ? next.delete(k) : next.set(k, v);
  if ('keyword' in patch) put('q', patch.keyword!, !patch.keyword);
  if ('category' in patch)
    put('cat', patch.category!, patch.category === DEFAULT_CATEGORY);
  if ('stack' in patch) put('stack', patch.stack!, !patch.stack);
  if ('page' in patch) put('page', String(patch.page!), patch.page === 0);
  if ('keyword' in patch || 'category' in patch || 'stack' in patch)
    next.delete('page');
  return next;
};

export interface UseEventListFiltersReturn {
  filters: EventListFilters;
  setFilters: (
    patch: Partial<EventListFilters>,
    opts?: { replace?: boolean },
  ) => void;
}

export function useEventListFilters(): UseEventListFiltersReturn {
  const [sp, setSp] = useSearchParams();
  const filters = readFilters(sp);
  const setFilters: UseEventListFiltersReturn['setFilters'] = (patch, opts) =>
    setSp((prev) => writeFilters(prev, patch), {
      replace: opts?.replace ?? false,
    });
  return { filters, setFilters };
}

const STALE_MS = 60_000;
const LRU_LIMIT = 8;
const cache = new Map<string, { data: EventListPage; fetchedAt: number }>();

const cachePut = (key: string, data: EventListPage): void => {
  if (cache.has(key)) cache.delete(key);
  cache.set(key, { data, fetchedAt: Date.now() });
  while (cache.size > LRU_LIMIT) {
    const oldest = cache.keys().next().value;
    if (oldest === undefined) break;
    cache.delete(oldest);
  }
};

const fetchEvents = async (
  filters: EventListFilters,
  stackNameToId: Map<string, number>,
  signal: AbortSignal,
): Promise<EventListPage> => {
  const req = toFilterRequest(filters, stackNameToId);
  const res = await apiClient.get<ApiResponse<EventListResponse>>('/events', {
    params: req.params,
    signal,
  });
  // 서버가 keyword + category 혼합 적용을 무시할 수 있어 클라이언트에서도 한 번 더 좁힘.
  // 종료/취소 이벤트는 후순위로 정렬해 활성 이벤트가 먼저 노출되도록 한다.
  const filtered = applyClientSideFilters(
    toEventListPage(unwrapApiData(res.data)),
    filters,
  );
  return sortByActiveFirst(filtered);
};

export type UseEventsReturn = EventsQuery & { refetch: () => void };

export function useEvents(
  filters: EventListFilters,
  stackNameToId: Map<string, number>,
): UseEventsReturn {
  const key = serializeFilters(filters);
  const [state, setState] = useState<EventsQuery>(() => {
    const hit = cache.get(key);
    return hit
      ? { status: 'success', data: hit.data, fetchedAt: hit.fetchedAt }
      : { status: 'loading' };
  });
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    const hit = cache.get(key);
    const fresh = hit && Date.now() - hit.fetchedAt < STALE_MS;
    if (fresh) {
      setState({
        status: 'success',
        data: hit.data,
        fetchedAt: hit.fetchedAt,
      });
      return;
    }
    setState((prev) => ({
      status: 'loading',
      previous: 'data' in prev ? prev.data : prev.previous,
    }));

    const ctrl = new AbortController();
    fetchEvents(filters, stackNameToId, ctrl.signal)
      .then((data) => {
        cachePut(key, data);
        setState({ status: 'success', data, fetchedAt: Date.now() });
      })
      .catch((error) => {
        if (ctrl.signal.aborted) return;
        setState((prev) => ({
          status: 'error',
          error,
          previous: 'data' in prev ? prev.data : prev.previous,
        }));
      });

    return () => ctrl.abort();
    // filters/stackNameToId 변경은 key에 직렬화되어 반영됨
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, refreshTick]);

  const refetch = useCallback(() => {
    cache.delete(key);
    setRefreshTick((n) => n + 1);
  }, [key]);

  return { ...state, refetch };
}
