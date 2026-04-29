import type { EventDetailResponse, TechStackItem } from '@/api/types';
import { toStatus, toDateTimeLabels, isFree, isLowStock } from '@/pages/_shared/eventFormat';
import type { EventStatus } from '@/types/event';
import type { EventDetailVM } from './types';

/**
 * 추천 카드 어댑터(`RecommendedCardVM`, `toRecommendedCards`, ...)는
 * `@/pages/_shared/recommendation`으로 승격됨 (Cart 와 공유 — Cart.plan.md § 9.2-17).
 */

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

