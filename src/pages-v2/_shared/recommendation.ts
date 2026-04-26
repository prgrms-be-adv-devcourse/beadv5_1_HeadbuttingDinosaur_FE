/**
 * Recommended events 어댑터.
 *
 * EventDetail 와 Cart 두 페이지가 `recommendEvents()` 응답을 공유하므로
 * `_shared/`로 승격 (Cart.plan.md § 1, § 9.2-17, § 10.1 step 3).
 *
 * `src/api/types.ts`에 동명 `RecommendationResponse`가 있지만 그것은
 * `{ userId, eventIdList }` 형태(다른 엔드포인트 가정). 본 모듈은
 * EventDetail/Cart 가 실제 사용하는 narrow 응답 형태를 별도로 정의한다.
 */

import { toDateTimeLabels, isFree } from './eventFormat';

export interface RawRecommendedEvent {
  eventId: string;
  title: string;
  price?: number;
  eventDateTime?: string;
  category?: string;
}

export interface RecommendationResponse {
  events?: RawRecommendedEvent[];
}

export interface RecommendedCardVM {
  eventId: string;
  title: string;
  category: string;
  price: number;
  isFree: boolean;
  eventDateTime?: string;
  dateLabel: string;
}

const RECOMMEND_LIMIT = 5;
const FALLBACK_CATEGORY = '추천';
const FALLBACK_DATE_LABEL = '일정 확인';

const toRecommendedCardVM = (raw: RawRecommendedEvent): RecommendedCardVM => {
  const price = raw.price ?? 0;
  const dateLabel = raw.eventDateTime
    ? (toDateTimeLabels(raw.eventDateTime).dateLabel || FALLBACK_DATE_LABEL)
    : FALLBACK_DATE_LABEL;
  return {
    eventId: raw.eventId,
    title: raw.title,
    category: raw.category ?? FALLBACK_CATEGORY,
    price,
    isFree: isFree(price),
    eventDateTime: raw.eventDateTime,
    dateLabel,
  };
};

export const toRecommendedCards = (
  api: RecommendationResponse,
  currentEventId: string,
): RecommendedCardVM[] =>
  (api.events ?? [])
    .filter((e) => e.eventId !== currentEventId)
    .slice(0, RECOMMEND_LIMIT)
    .map(toRecommendedCardVM);
