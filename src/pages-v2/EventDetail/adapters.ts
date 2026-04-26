import type { EventDetailResponse, TechStackItem } from '@/api/types';
import { toStatus, toDateTimeLabels, isFree, isLowStock } from '@/pages-v2/_shared/eventFormat';
import type { EventStatus } from '@/types-v2/event';
import type { EventDetailVM } from './types';

const toTechStackNames = (items: TechStackItem[]): string[] =>
  items.map((t) => t.name);

const deriveCanBuy = (status: EventStatus, remaining: number): boolean =>
  status === 'ON_SALE' && remaining > 0;

export const toEventDetailVM = (api: EventDetailResponse): EventDetailVM => {
  const status = toStatus(api.status);
  const { dateLabel, timeLabel } = toDateTimeLabels(api.eventDateTime);
  return {
    eventId: api.eventId,
    title: api.title,
    category: api.category,
    techStacks: toTechStackNames(api.techStacks),
    description: api.description,
    location: api.location,
    price: api.price,
    remainingQuantity: api.remainingQuantity,
    totalQuantity: api.totalQuantity,
    status,
    sellerNickname: api.sellerNickname,
    eventDateTime: api.eventDateTime,
    dateLabel,
    timeLabel,
    isFree: isFree(api.price),
    isLowStock: isLowStock(api.remainingQuantity),
    isSoldOut: api.remainingQuantity === 0,
    canBuy: deriveCanBuy(status, api.remainingQuantity),
    thumbnailUrl: api.thumbnailUrl,
  };
};

/* Recommended events (§3 표 2-B). Narrow types live here — `src/api/types.ts`
 * has no formal RecommendationResponse and SPEC §0 keeps the api/types
 * file untouched. */

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
