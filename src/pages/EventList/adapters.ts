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
    category: api.category,
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

export const toEventListPage = (res: EventListResponse): EventListPage => ({
  items: res.content.map(toEventVM),
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
    if (hasCategory) params.category = category;
    if (stackId !== undefined) params.techStacks = [stackId];
    return { kind: 'filter', params };
  }
  return { kind: 'list', params: { page, size } };
};

export const serializeFilters = (f: EventListFilters): string =>
  `q=${f.keyword}|cat=${f.category}|stack=${f.stack}|page=${f.page}`;
