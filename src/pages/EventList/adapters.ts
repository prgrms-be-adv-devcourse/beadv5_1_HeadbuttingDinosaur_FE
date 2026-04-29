import type {
  EventItem,
  EventListResponse,
  EventListRequest,
  EventSearchRequest,
  EventFilterRequest,
} from '@/api/types';
import {
  toStatus,
  toDateTimeLabels,
  isFree,
  isLowStock,
} from '@/pages/_shared/eventFormat';
import {
  CATEGORY_LABEL_TO_ENUM,
  toCategoryLabel,
  type EventCategoryLabel,
} from '@/pages/_shared/category';
import type {
  EventVM,
  EventListPage,
  EventListFilters,
} from './types';

export const DEFAULT_PAGE_SIZE = 24;
export const DEFAULT_CATEGORY = '전체';

export const toEventVM = (api: EventItem): EventVM => {
  const { dateLabel, timeLabel } = toDateTimeLabels(api.eventDateTime);
  return {
    eventId: api.eventId,
    title: api.title,
    category: toCategoryLabel(api.category),
    techStacks: api.techStacks,
    price: api.price,
    remainingQuantity: api.remainingQuantity,
    status: toStatus(api.status),
    eventDateTime: api.eventDateTime,
    thumbnailUrl: api.thumbnailUrl,
    isFree: isFree(api.price),
    isLowStock: isLowStock(api.remainingQuantity),
    dateLabel,
    timeLabel,
  };
};

/**
 * 판매 시작 시각이 아직 도래하지 않은 이벤트는 목록에서 제외.
 * 백엔드가 `saleStartAt` 을 내려주지 않으면 (필드 부재) 통과시킨다 — 즉
 * 판단 불가일 때는 노출, 판단 가능한데 미래면 차단. `totalElements` 는
 * 서버 응답값을 그대로 신뢰한다 (페이지네이션 어긋남을 감수해야 정확한
 * 카운트를 얻으려면 별도 API 가 필요).
 */
const isSaleVisible = (api: EventItem): boolean => {
  if (!api.saleStartAt) return true;
  const start = new Date(api.saleStartAt).getTime();
  if (Number.isNaN(start)) return true;
  return start <= Date.now();
};

export const toEventListPage = (res: EventListResponse): EventListPage => ({
  items: res.content.filter(isSaleVisible).map(toEventVM),
  page: res.page,
  size: res.size,
  totalElements: res.totalElements,
  totalPages: res.totalPages,
  hasNext: res.page < res.totalPages - 1,
});

export type FilterRequest =
  | { kind: 'list'; params: EventListRequest }
  | { kind: 'search'; params: EventSearchRequest }
  | { kind: 'filter'; params: EventFilterRequest };

export const toFilterRequest = (
  filters: EventListFilters,
  stackNameToId: Map<string, number>,
  size: number = DEFAULT_PAGE_SIZE,
): FilterRequest => {
  const { keyword, category, stack, page } = filters;
  if (keyword.trim() !== '') {
    return { kind: 'search', params: { keyword: keyword.trim(), page, size } };
  }
  const hasCategory = category !== DEFAULT_CATEGORY && category !== '';
  const stackId = stack ? stackNameToId.get(stack) : undefined;
  if (hasCategory || stackId !== undefined) {
    const params: EventFilterRequest = { page, size };
    if (hasCategory) {
      // 백엔드 EventCategory enum 키 (영문) 로 변환. 미매핑이면 그대로 보내고 백엔드 검증에 맡김.
      params.category =
        CATEGORY_LABEL_TO_ENUM[category as EventCategoryLabel] ?? category;
    }
    if (stackId !== undefined) params.techStacks = [stackId];
    return { kind: 'filter', params };
  }
  return { kind: 'list', params: { page, size } };
};

export const serializeFilters = (f: EventListFilters): string =>
  `q=${f.keyword}|cat=${f.category}|stack=${f.stack}|page=${f.page}`;
