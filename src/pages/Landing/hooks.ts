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
 * PR 3 (Categories + Featured) — Landing.plan.md §12.3 / §5.
 *
 * - useLandingCategories: 6 카테고리 마스터 × `filterEvents({ size:1 })`
 *   `Promise.allSettled` (부분 실패 시 해당 타일만 `count: null`).
 *   캐시 키 `landing:categories:counts`, stale 10분.
 * - useFeaturedEvents: 1차 `getEventRecommendations` (anon) 또는
 *   `recommendEvents` (authed, §11 #8) → 실패/빈 시 `getEvents({ size:10 })`
 *   폴백 → ON_SALE 필터 + `eventDateTime` asc + 5개. 캐시 키는 인증 상태별
 *   (`landing:featured:anon` / `landing:featured:auth`), stale 5분.
 * - 두 훅 모두 PR 2 의 `getFirstPage` 를 재사용하지 않음 (§12.3 — PR 2/3
 *   병렬 빌드 보장). API 래퍼(`filterEvents`/`getEventRecommendations`/
 *   `getEvents`) 가 signal 을 받지 않아 unmount 처리는 cancelled 플래그로
 *   통일 (PR 2 와 같은 방식).
 */

import { useCallback, useEffect, useState } from 'react';
import { apiClient, unwrapApiData, type ApiResponse } from '@/api/client';
import {
  filterEvents,
  getEvents,
  recommendEvents,
} from '@/api/events.api';
import { getEventRecommendations } from '@/api/ai.api';
import { useAuth } from '@/contexts/AuthContext';
import type {
  EventFilterResponse,
  EventListResponse,
  RecommendationResponse,
} from '@/api/types';
import { toEventListPage } from '@/pages/EventList/adapters';
import type { EventListPage, EventVM } from '@/pages/EventList/types';
import {
  CATEGORY_LABEL_TO_ENUM,
  type EventCategoryLabel,
} from '@/pages/_shared/category';
import {
  CATEGORY_DEFINITIONS,
  sortByDateAsc,
  toCategoryTileVM,
  toFeaturedItemVM,
  toStatsVM,
} from './adapters';
import type {
  CategoryTileVM,
  FeaturedItemVM,
  LandingCategoriesQuery,
  LandingFeaturedQuery,
  LandingFirstPageQuery,
  StatVM,
} from './types';

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
      previous:
        'data' in prev
          ? prev.data
          : 'previous' in prev
            ? prev.previous
            : undefined,
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
          previous:
        'data' in prev
          ? prev.data
          : 'previous' in prev
            ? prev.previous
            : undefined,
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

/* ===== PR 3: Categories + Featured ===== */

const CATEGORIES_KEY = 'landing:categories:counts';
const CATEGORIES_STALE_MS = 10 * 60_000;
const categoriesCache = new Map<
  string,
  { data: CategoryTileVM[]; fetchedAt: number }
>();
let categoriesInFlight: Promise<CategoryTileVM[]> | null = null;

const fetchCategoryCounts = async (): Promise<CategoryTileVM[]> => {
  // 백엔드 EventCategory enum 키로 변환해서 호출. 5 병렬 + Promise.allSettled —
  // 한 카테고리 실패해도 나머지는 살림.
  const results = await Promise.allSettled(
    CATEGORY_DEFINITIONS.map((def) => {
      const enumKey =
        CATEGORY_LABEL_TO_ENUM[def.cat as EventCategoryLabel] ?? def.cat;
      return filterEvents({ category: enumKey, page: 0, size: 1 });
    }),
  );
  return CATEGORY_DEFINITIONS.map((def, i) => {
    const r = results[i];
    if (r.status === 'fulfilled') {
      const data = unwrapApiData<EventFilterResponse>(r.value.data);
      return toCategoryTileVM(def, data.totalElements);
    }
    return toCategoryTileVM(def, null);
  });
};

export const getCategoryCounts = (): Promise<CategoryTileVM[]> => {
  const hit = categoriesCache.get(CATEGORIES_KEY);
  if (hit && Date.now() - hit.fetchedAt < CATEGORIES_STALE_MS) {
    return Promise.resolve(hit.data);
  }
  if (categoriesInFlight) return categoriesInFlight;
  categoriesInFlight = fetchCategoryCounts()
    .then((data) => {
      categoriesCache.set(CATEGORIES_KEY, { data, fetchedAt: Date.now() });
      return data;
    })
    .finally(() => {
      categoriesInFlight = null;
    });
  return categoriesInFlight;
};

export const invalidateCategoryCounts = (): void => {
  categoriesCache.delete(CATEGORIES_KEY);
};

export type UseLandingCategoriesReturn = LandingCategoriesQuery & {
  refetch: () => void;
};

export function useLandingCategories(): UseLandingCategoriesReturn {
  const [state, setState] = useState<LandingCategoriesQuery>(() => {
    const hit = categoriesCache.get(CATEGORIES_KEY);
    return hit
      ? { status: 'success', data: hit.data, fetchedAt: hit.fetchedAt }
      : { status: 'loading' };
  });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const hit = categoriesCache.get(CATEGORIES_KEY);
    if (hit && Date.now() - hit.fetchedAt < CATEGORIES_STALE_MS) {
      setState({ status: 'success', data: hit.data, fetchedAt: hit.fetchedAt });
      return;
    }
    setState((prev) => ({
      status: 'loading',
      previous:
        'data' in prev
          ? prev.data
          : 'previous' in prev
            ? prev.previous
            : undefined,
    }));

    let cancelled = false;
    getCategoryCounts()
      .then((data) => {
        if (cancelled) return;
        setState({ status: 'success', data, fetchedAt: Date.now() });
      })
      .catch((error) => {
        // Promise.allSettled 라 정상 흐름에선 reject 가 없지만,
        // 캐시 / fetcher 외 단계에서 throw 발생 시 안전망.
        if (cancelled) return;
        setState((prev) => ({
          status: 'error',
          error,
          previous:
        'data' in prev
          ? prev.data
          : 'previous' in prev
            ? prev.previous
            : undefined,
        }));
      });

    return () => {
      cancelled = true;
    };
  }, [tick]);

  const refetch = useCallback(() => {
    invalidateCategoryCounts();
    setTick((n) => n + 1);
  }, []);

  return { ...state, refetch };
}

/* Featured 캐시는 인증 상태별로 키를 분리. 비로그인 → /events/recommendations
 * (anon), 로그인 → /events/user/recommendations (authed). 같은 캐시에 섞이면
 * 로그인 / 로그아웃 transition 시 잘못된 데이터 노출 가능 (§11 #8). */
const FEATURED_KEY_ANON = 'landing:featured:anon';
const FEATURED_KEY_AUTH = 'landing:featured:auth';
const FEATURED_STALE_MS = 5 * 60_000;
const FEATURED_FALLBACK_PAGE_SIZE = 10;
const FEATURED_LIMIT = 5;
const featuredCache = new Map<
  string,
  { data: FeaturedItemVM[]; fetchedAt: number }
>();
const featuredInFlight = new Map<string, Promise<FeaturedItemVM[]>>();

/**
 * 폴백 + 추천 hydration 양쪽에서 쓰는 1차 페이지. PR 2 의 `getFirstPage`
 * 와 별 캐시 키 — Featured 단독 빌드 보장 (§12.3).
 */
const fetchFeaturedFallbackEvents = async (): Promise<EventVM[]> => {
  const res = await getEvents({ page: 0, size: FEATURED_FALLBACK_PAGE_SIZE });
  const page = toEventListPage(unwrapApiData<EventListResponse>(res.data));
  return sortByDateAsc(page.items.filter((e) => e.status === 'ON_SALE'));
};

const fetchFeatured = async (authed: boolean): Promise<FeaturedItemVM[]> => {
  // 1차: 인증 상태에 따라 엔드포인트 분기 (§11 #8).
  // - authed:  /events/user/recommendations (개인화, Authorization 필요)
  // - anon:    /events/recommendations (글로벌)
  // 둘 다 RecommendationResponse 셰이프 (eventIdList) 동일.
  let recIds: string[] = [];
  try {
    const res = authed
      ? await recommendEvents()
      : await getEventRecommendations();
    const data = unwrapApiData<RecommendationResponse>(
      res.data as ApiResponse<RecommendationResponse> | RecommendationResponse,
    );
    recIds = data?.eventIdList ?? [];
  } catch {
    // 실패는 폴백으로 흡수 (§12.3 §11 #4). authed 401/403 도 동일하게 폴백.
  }
  if (recIds.length > 0) {
    // RecommendationResponse 는 ID 만 — 행 렌더에 필요한 필드는 1차 페이지로 hydration.
    const events = await fetchFeaturedFallbackEvents();
    const byId = new Map(events.map((e) => [e.eventId, e] as const));
    const hydrated = recIds
      .map((id) => byId.get(id))
      .filter((e): e is EventVM => Boolean(e))
      .slice(0, FEATURED_LIMIT);
    if (hydrated.length > 0) {
      return hydrated.map((e, i) => toFeaturedItemVM(e, i + 1));
    }
  }
  // 폴백: ON_SALE + date asc + 앞 5개.
  const events = await fetchFeaturedFallbackEvents();
  return events
    .slice(0, FEATURED_LIMIT)
    .map((e, i) => toFeaturedItemVM(e, i + 1));
};

export const getFeatured = (authed: boolean): Promise<FeaturedItemVM[]> => {
  const key = authed ? FEATURED_KEY_AUTH : FEATURED_KEY_ANON;
  const hit = featuredCache.get(key);
  if (hit && Date.now() - hit.fetchedAt < FEATURED_STALE_MS) {
    return Promise.resolve(hit.data);
  }
  const inflight = featuredInFlight.get(key);
  if (inflight) return inflight;
  const promise = fetchFeatured(authed)
    .then((data) => {
      featuredCache.set(key, { data, fetchedAt: Date.now() });
      return data;
    })
    .finally(() => {
      featuredInFlight.delete(key);
    });
  featuredInFlight.set(key, promise);
  return promise;
};

/* 두 캐시 모두 비움 — 사용자가 "다시 시도" 를 누른 시점에 인증 상태가
 * 어느 쪽이든 다음 fetch 가 강제되도록. */
export const invalidateFeatured = (): void => {
  featuredCache.clear();
};

export type UseFeaturedEventsReturn = LandingFeaturedQuery & {
  refetch: () => void;
};

export function useFeaturedEvents(): UseFeaturedEventsReturn {
  const { isLoggedIn } = useAuth();
  const cacheKey = isLoggedIn ? FEATURED_KEY_AUTH : FEATURED_KEY_ANON;

  const [state, setState] = useState<LandingFeaturedQuery>(() => {
    if (!isLoggedIn) return { status: 'login-required' };
    const hit = featuredCache.get(cacheKey);
    return hit
      ? { status: 'success', data: hit.data, fetchedAt: hit.fetchedAt }
      : { status: 'loading' };
  });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    /* 비로그인 시 개인화 추천을 호출하지 않고 안내 상태로 둠 (Cart /
     * EventDetail 의 'hidden' 패턴과 같은 취지 — 401/500 흡수 + 빈 페치 회피). */
    if (!isLoggedIn) {
      setState({ status: 'login-required' });
      return;
    }
    const hit = featuredCache.get(cacheKey);
    if (hit && Date.now() - hit.fetchedAt < FEATURED_STALE_MS) {
      setState({ status: 'success', data: hit.data, fetchedAt: hit.fetchedAt });
      return;
    }
    setState((prev) => ({
      status: 'loading',
      previous:
        'data' in prev
          ? prev.data
          : 'previous' in prev
            ? prev.previous
            : undefined,
    }));

    let cancelled = false;
    getFeatured(isLoggedIn)
      .then((data) => {
        if (cancelled) return;
        setState({ status: 'success', data, fetchedAt: Date.now() });
      })
      .catch(() => {
        // AI 추천 + 폴백 모두 실패 → 빈 리스트로 흡수 (에러 UI 노출 안 함).
        if (cancelled) return;
        setState({ status: 'success', data: [], fetchedAt: Date.now() });
      });

    return () => {
      cancelled = true;
    };
    // isLoggedIn 변동 (로그인 / 로그아웃) 시 다른 캐시 키로 재진입.
  }, [tick, isLoggedIn, cacheKey]);

  const refetch = useCallback(() => {
    invalidateFeatured();
    setTick((n) => n + 1);
  }, []);

  return { ...state, refetch };
}
