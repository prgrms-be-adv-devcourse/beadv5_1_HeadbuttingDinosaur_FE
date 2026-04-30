import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiClient, unwrapApiData, type ApiResponse } from '@/api/client';
import { getTechStacks } from '@/api/auth.api';
import { extractTechStacks } from '@/api/techStacks';
import type { EventListResponse, TechStackItem } from '@/api/types';
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
  // stack 필터가 활성일 때는 stackNameToId 가 채워졌는지에 따라 fetch 결과가
  // 달라지므로 (마스터 미로딩 시 techStacks 파라미터 없이 요청), 마스터 사이즈를
  // 캐시 키에 포함시켜 마스터 도착 후 재페치되도록 한다.
  const stackKeyFragment =
    filters.stack !== ''
      ? `|smap=${stackNameToId.size > 0 ? stackNameToId.get(filters.stack) ?? 'miss' : 'pending'}`
      : '';
  const key = serializeFilters(filters) + stackKeyFragment;
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

/* ── 기술 스택 마스터 ──────────────────────────────────────────────
 * 모듈 캐시 + in-flight 공유 — 같은 페이지 내 여러 컴포넌트가 호출해도 1회만 페치.
 * 응답 셰이프가 v1/v2 사이에 흔들렸던 이력 때문에 extractTechStacks 로 정규화. */
let techStacksCache: TechStackItem[] | null = null;
let techStacksInFlight: Promise<TechStackItem[]> | null = null;

export interface UseTechStacksReturn {
  items: TechStackItem[];
  byName: Map<string, number>;
  isLoading: boolean;
}

const fetchTechStacks = async (): Promise<TechStackItem[]> => {
  const res = await getTechStacks();
  return extractTechStacks(res.data);
};

export function useTechStacks(): UseTechStacksReturn {
  const [items, setItems] = useState<TechStackItem[]>(
    () => techStacksCache ?? [],
  );
  const [isLoading, setIsLoading] = useState(
    () => techStacksCache === null,
  );

  useEffect(() => {
    if (techStacksCache !== null) return;
    let cancelled = false;
    setIsLoading(true);
    const promise =
      techStacksInFlight ?? (techStacksInFlight = fetchTechStacks());
    promise
      .then((list) => {
        techStacksCache = list;
        techStacksInFlight = null;
        if (cancelled) return;
        setItems(list);
        setIsLoading(false);
      })
      .catch(() => {
        techStacksInFlight = null;
        if (cancelled) return;
        // 실패는 빈 배열 — 칩이 안 그려질 뿐 검색/카테고리는 정상 동작.
        setItems([]);
        setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const byName = new Map<string, number>(
    items.map((s) => [s.name, s.techStackId]),
  );
  return { items, byName, isLoading };
}
