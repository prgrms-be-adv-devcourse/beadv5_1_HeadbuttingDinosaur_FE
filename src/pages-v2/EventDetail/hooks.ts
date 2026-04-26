import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { addCartItem } from '@/api/cart.api';
import { apiClient, unwrapApiData, type ApiResponse } from '@/api/client';
import type { EventDetailResponse } from '@/api/types';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';

import {
  toRecommendedCards,
  type RecommendationResponse,
  type RecommendedCardVM,
} from '@/pages-v2/_shared/recommendation';

import { toEventDetailVM } from './adapters';
import type { EventDetailQuery, EventDetailVM } from './types';

const STALE_MS = 60_000;
const LRU_LIMIT = 12;

const detailCache = new Map<
  string,
  { data: EventDetailVM; fetchedAt: number }
>();

const cachePut = (key: string, data: EventDetailVM): void => {
  if (detailCache.has(key)) detailCache.delete(key);
  detailCache.set(key, { data, fetchedAt: Date.now() });
  while (detailCache.size > LRU_LIMIT) {
    const oldest = detailCache.keys().next().value;
    if (oldest === undefined) break;
    detailCache.delete(oldest);
  }
};

const previousFrom = (prev: EventDetailQuery): EventDetailVM | undefined => {
  if (prev.status === 'success') return prev.data;
  if (prev.status === 'loading' || prev.status === 'error') return prev.previous;
  return undefined;
};

type ClassifiedError =
  | { kind: 'not-found' }
  | { kind: 'forbidden'; message?: string }
  | { kind: 'error'; error: unknown };

const classifyError = (err: unknown): ClassifiedError => {
  if (!axios.isAxiosError(err)) return { kind: 'error', error: err };
  const status = err.response?.status;
  if (status === 404) return { kind: 'not-found' };
  if (status === 403) {
    /* PROFILE_NOT_COMPLETED 403 은 client 인터셉터가 가로채 hook 도달 전에
     * 처리됨 (src/api/client.ts §403 분기). 여기 들어오는 403 은 비공개/
     * 권한 부족 케이스만. */
    const data = err.response?.data as { message?: string } | undefined;
    return { kind: 'forbidden', message: data?.message };
  }
  return { kind: 'error', error: err };
};

const fetchDetail = async (
  eventId: string,
  signal: AbortSignal,
): Promise<EventDetailVM> => {
  const res = await apiClient.get<ApiResponse<EventDetailResponse>>(
    `/events/${eventId}`,
    { signal },
  );
  return toEventDetailVM(unwrapApiData(res.data));
};

export type UseEventDetailReturn = EventDetailQuery & { refetch: () => void };

export function useEventDetail(eventId: string): UseEventDetailReturn {
  const [state, setState] = useState<EventDetailQuery>(() => {
    const hit = detailCache.get(eventId);
    return hit
      ? { status: 'success', data: hit.data, fetchedAt: hit.fetchedAt }
      : { status: 'loading' };
  });
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    const hit = detailCache.get(eventId);
    const fresh = hit && Date.now() - hit.fetchedAt < STALE_MS;
    if (fresh) {
      setState({
        status: 'success',
        data: hit.data,
        fetchedAt: hit.fetchedAt,
      });
      return;
    }
    setState((prev) => ({ status: 'loading', previous: previousFrom(prev) }));

    const ctrl = new AbortController();
    fetchDetail(eventId, ctrl.signal)
      .then((data) => {
        cachePut(eventId, data);
        setState({ status: 'success', data, fetchedAt: Date.now() });
      })
      .catch((err) => {
        if (ctrl.signal.aborted) return;
        const classified = classifyError(err);
        if (classified.kind === 'not-found') {
          setState({ status: 'not-found' });
        } else if (classified.kind === 'forbidden') {
          setState({ status: 'forbidden', message: classified.message });
        } else {
          setState((prev) => ({
            status: 'error',
            error: classified.error,
            previous: previousFrom(prev),
          }));
        }
      });

    return () => ctrl.abort();
  }, [eventId, refreshTick]);

  const refetch = useCallback(() => {
    detailCache.delete(eventId);
    setRefreshTick((n) => n + 1);
  }, [eventId]);

  return { ...state, refetch };
}

/* ── useRecommendedEvents (§4-(6) / §5-(6) / §8 항목 4) ─────────────────
 * Single-slot module cache — same user is assumed to get the same set of
 * recommendations across detail pages, so currentEventId only feeds the
 * filter/slice step (toRecommendedCards). Failure / empty / 비로그인 401 →
 * 'hidden' so the section silently disappears without affecting body
 * render. No refetch surface (auto-refresh on cart-add belongs in §6). */

export type RecommendedQuery =
  | { status: 'loading' }
  | { status: 'ready'; cards: RecommendedCardVM[] }
  | { status: 'hidden' };

const RECOMMEND_STALE_MS = 60_000;
let recommendCache: { api: RecommendationResponse; fetchedAt: number } | null =
  null;

const deriveRecommended = (currentEventId: string): RecommendedQuery => {
  if (!recommendCache) return { status: 'loading' };
  const cards = toRecommendedCards(recommendCache.api, currentEventId);
  return cards.length > 0 ? { status: 'ready', cards } : { status: 'hidden' };
};

const fetchRecommendations = async (
  signal: AbortSignal,
): Promise<RecommendationResponse> => {
  const res = await apiClient.get<ApiResponse<RecommendationResponse>>(
    '/events/user/recommendations',
    { signal },
  );
  return unwrapApiData(res.data);
};

export function useRecommendedEvents(currentEventId: string): RecommendedQuery {
  const [state, setState] = useState<RecommendedQuery>(() => {
    if (
      recommendCache &&
      Date.now() - recommendCache.fetchedAt < RECOMMEND_STALE_MS
    ) {
      return deriveRecommended(currentEventId);
    }
    return { status: 'loading' };
  });

  useEffect(() => {
    const fresh =
      recommendCache &&
      Date.now() - recommendCache.fetchedAt < RECOMMEND_STALE_MS;
    if (fresh) {
      setState(deriveRecommended(currentEventId));
      return;
    }
    setState({ status: 'loading' });

    const ctrl = new AbortController();
    fetchRecommendations(ctrl.signal)
      .then((api) => {
        recommendCache = { api, fetchedAt: Date.now() };
        setState(deriveRecommended(currentEventId));
      })
      .catch(() => {
        if (ctrl.signal.aborted) return;
        /* 401 / 5xx / network — 모두 흡수해 섹션만 안 그림. 본문 success
         * 분기는 영향 없음 (§5-(6) 격리 원칙). */
        setState({ status: 'hidden' });
      });

    return () => ctrl.abort();
  }, [currentEventId]);

  return state;
}

/* ── usePurchaseActions (§6.6 합성 hook / §9.3 PR 3) ─────────────────────
 * "장바구니에 담기" + "바로 구매하기" 두 액션을 한 hook 으로 노출. busy
 * state 를 공유해 동시 클릭 시 두 버튼이 같이 disabled. 비로그인 시 로그인
 * 페이지로 returnTo 인코딩해 redirect (§5-(4)). POST 는 사용자 명시 액션이라
 * AbortController 미사용 (§6.6). */

export type PurchaseBusy = 'adding' | 'buying' | null;

export interface UsePurchaseActionsReturn {
  busy: PurchaseBusy;
  addToCart: (quantity: number) => Promise<void>;
  buyNow: (quantity: number) => Promise<void>;
}

export function usePurchaseActions(eventId: string): UsePurchaseActionsReturn {
  const { isLoggedIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [busy, setBusy] = useState<PurchaseBusy>(null);

  const redirectToLogin = useCallback(() => {
    const returnTo = encodeURIComponent(location.pathname + location.search);
    navigate(`/login?returnTo=${returnTo}`);
  }, [location.pathname, location.search, navigate]);

  const addToCart = useCallback(
    async (quantity: number) => {
      if (!isLoggedIn) {
        redirectToLogin();
        return;
      }
      if (busy !== null) return;
      setBusy('adding');
      try {
        await addCartItem({ eventId, quantity });
        toast('장바구니에 담았습니다', 'success');
      } catch {
        toast('장바구니 담기에 실패했습니다. 잠시 후 다시 시도해주세요.', 'error');
      } finally {
        setBusy(null);
      }
    },
    [busy, eventId, isLoggedIn, redirectToLogin, toast],
  );

  const buyNow = useCallback(
    async (quantity: number) => {
      if (!isLoggedIn) {
        redirectToLogin();
        return;
      }
      if (busy !== null) return;
      setBusy('buying');
      try {
        await addCartItem({ eventId, quantity });
        navigate('/cart');
      } catch {
        toast('오류가 발생했습니다. 잠시 후 다시 시도해주세요.', 'error');
        setBusy(null);
      }
    },
    [busy, eventId, isLoggedIn, navigate, redirectToLogin, toast],
  );

  return { busy, addToCart, buyNow };
}
