import type { EventDetailResponse, TechStackItem } from '@/api/types';
import { toStatus, toDateTimeLabels, isFree, isLowStock } from '@/pages/_shared/eventFormat';
import { toCategoryLabel } from '@/pages/_shared/category';
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

const isFutureIso = (iso?: string): boolean => {
  if (!iso) return false;
  const t = new Date(iso).getTime();
  return Number.isFinite(t) && t > Date.now();
};

export const toEventDetailVM = (api: EventDetailResponse): EventDetailVM => {
  const rawStatus = toStatus(api.status);
  // 백엔드 EventDetailResponse 는 단일 thumbnailUrl 이 아니라 sortOrder 정렬된
  // imageUrls 만 내려주므로 첫 장을 썸네일로 사용.
  const thumbnailUrl = api.imageUrls?.[0];
  // 상태 enum 이 ON_SALE 이어도 saleStartAt 이 미래면 판매 예정으로 표기.
  const isScheduled =
    rawStatus === 'SCHEDULED' ||
    (rawStatus === 'ON_SALE' && isFutureIso(api.saleStartAt));
  const status: EventStatus = isScheduled ? 'SCHEDULED' : rawStatus;
  const { dateLabel, timeLabel } = toDateTimeLabels(api.eventDateTime);
  return {
    eventId: api.eventId,
    title: api.title,
    category: toCategoryLabel(api.category),
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
    isSoldOut: api.remainingQuantity === 0 && !isScheduled,
    canBuy: !isScheduled && deriveCanBuy(rawStatus, api.remainingQuantity),
    isScheduled,
    saleStartAt: api.saleStartAt,
    saleEndAt: api.saleEndAt,
    maxQuantityPerUser: api.maxQuantityPerUser,
    thumbnailUrl,
  };
};

