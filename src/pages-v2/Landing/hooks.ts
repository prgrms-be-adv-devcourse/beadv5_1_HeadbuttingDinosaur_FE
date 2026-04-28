/**
 * Landing 데이터 훅.
 * PR 2 (Hero + Stats) — Landing.plan.md §12.2 / §5.
 *
 * - getFirstPage: 1차 응답 공유 fetcher. 모듈 캐시 + in-flight 프로미스 reuse
 *   로 같은 응답이 필요한 훅들이 호출해도 네트워크 1회 (§5.5).
 * - useFirstPage: raw EventListPage 를 LandingFirstPageQuery 로 노출.
 * - useLandingStats: useFirstPage 결과를 toStatsVM 으로 변환 (§5.5).
 *
 * 패턴은 EventList 의 useEvents 와 동일 (useState + useEffect + 캐시).
 * 단, 공유 in-flight 프로미스가 여러 컨슈머에게 reuse 되므로
 * AbortController 로 fetch 자체를 끊으면 다른 컨슈머가 죽는다.
 * 따라서 unmount 처리는 cancelled 플래그로 결과 무시 방식 (§5.5).
 *
 * (PR 3 진입 시 useLandingCategories / useFeaturedEvents 추가 — §5.3 참조.
 *  키가 4종으로 늘면 LRU 도 함께 도입 — 현재는 1종이라 생략, §12.2 트리밍 힌트.)
 */

import { useCallback, useEffect, useState } from 'react';
import { apiClient, unwrapApiData, type ApiResponse } from '@/api/client';
import type { EventListResponse } from '@/api/types';
import { toEventListPage } from '@/pages-v2/EventList/adapters';
import type { EventListPage } from '@/pages-v2/EventList/types';
import { toStatsVM } from './adapters';
import type { LandingFirstPageQuery, StatVM } from './types';

const FIRST_PAGE_SIZE = 10;
const FIRST_PAGE_KEY = `landing:events:firstpage:size=${FIRST_PAGE_SIZE}`;
const STALE_MS = 5 * 60_000;

// Landing 전용 모듈 캐시. EventList 캐시와 분리 (§5.2 키 네임스페이스).
const cache = new Map<string, { data: EventListPage; fetchedAt: number }>();

let firstPageInFlight: Promise<EventListPage> | null = null;

const fetchFirstPage = async (): Promise<EventListPage> => {
  const res = await apiClient.get<ApiResponse<EventListResponse>>('/events', {
    params: { page: 0, size: FIRST_PAGE_SIZE },
  });
  return toEventListPage(unwrapApiData(res.data));
};

export const getFirstPage = (): Promise<EventListPage> => {
  const hit = cache.get(FIRST_PAGE_KEY);
  if (hit && Date.now() - hit.fetchedAt < STALE_MS) {
    return Promise.resolve(hit.data);
  }
  if (firstPageInFlight) return firstPageInFlight;
  firstPageInFlight = fetchFirstPage()
    .then((page) => {
      cache.set(FIRST_PAGE_KEY, { data: page, fetchedAt: Date.now() });
      return page;
    })
    .finally(() => {
      firstPageInFlight = null;
    });
  return firstPageInFlight;
};

export const invalidateFirstPage = (): void => {
  cache.delete(FIRST_PAGE_KEY);
};

export type UseFirstPageReturn = LandingFirstPageQuery & {
  refetch: () => void;
};

export function useFirstPage(): UseFirstPageReturn {
  const [state, setState] = useState<LandingFirstPageQuery>(() => {
    const hit = cache.get(FIRST_PAGE_KEY);
    return hit
      ? { status: 'success', data: hit.data, fetchedAt: hit.fetchedAt }
      : { status: 'loading' };
  });
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    const hit = cache.get(FIRST_PAGE_KEY);
    if (hit && Date.now() - hit.fetchedAt < STALE_MS) {
      setState({ status: 'success', data: hit.data, fetchedAt: hit.fetchedAt });
      return;
    }
    setState((prev) => ({
      status: 'loading',
      previous: 'data' in prev ? prev.data : prev.previous,
    }));

    let cancelled = false;
    getFirstPage()
      .then((data) => {
        if (cancelled) return;
        setState({ status: 'success', data, fetchedAt: Date.now() });
      })
      .catch((error) => {
        if (cancelled) return;
        setState((prev) => ({
          status: 'error',
          error,
          previous: 'data' in prev ? prev.data : prev.previous,
        }));
      });

    return () => {
      cancelled = true;
    };
  }, [refreshTick]);

  const refetch = useCallback(() => {
    invalidateFirstPage();
    setRefreshTick((n) => n + 1);
  }, []);

  return { ...state, refetch };
}

export type UseLandingStatsReturn =
  | { status: 'loading'; previous?: StatVM[]; refetch: () => void }
  | {
      status: 'success';
      data: StatVM[];
      fetchedAt: number;
      refetch: () => void;
    }
  | {
      status: 'error';
      error: unknown;
      previous?: StatVM[];
      refetch: () => void;
    };

export function useLandingStats(): UseLandingStatsReturn {
  const q = useFirstPage();
  const previous =
    'previous' in q && q.previous ? toStatsVM(q.previous) : undefined;
  if (q.status === 'success') {
    return {
      status: 'success',
      data: toStatsVM(q.data),
      fetchedAt: q.fetchedAt,
      refetch: q.refetch,
    };
  }
  if (q.status === 'loading') {
    return { status: 'loading', previous, refetch: q.refetch };
  }
  return {
    status: 'error',
    error: q.error,
    previous,
    refetch: q.refetch,
  };
}
