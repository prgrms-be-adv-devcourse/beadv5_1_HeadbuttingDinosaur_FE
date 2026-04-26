import type {
  EventItem,
  EventListResponse,
  EventListRequest,
  EventSearchRequest,
  EventFilterRequest,
} from '@/api/types';
import type {
  EventVM,
  EventStatus,
  EventListPage,
  EventListFilters,
} from './types';

export const DEFAULT_PAGE_SIZE = 24;
export const DEFAULT_CATEGORY = '전체';

const KNOWN_STATUSES: readonly EventStatus[] = [
  'ON_SALE',
  'SOLD_OUT',
  'SALE_ENDED',
  'CANCELLED',
  'ENDED',
];

const pad2 = (n: number) => String(n).padStart(2, '0');

const toStatus = (raw: string): EventStatus =>
  (KNOWN_STATUSES as readonly string[]).includes(raw)
    ? (raw as EventStatus)
    : 'ENDED';

const toDateTimeLabels = (iso: string): { dateLabel: string; timeLabel: string } => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { dateLabel: '', timeLabel: '' };
  return {
    dateLabel: `${d.getFullYear()}.${pad2(d.getMonth() + 1)}.${pad2(d.getDate())}`,
    timeLabel: `${pad2(d.getHours())}:${pad2(d.getMinutes())}`,
  };
};

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
    isFree: api.price === 0,
    isLowStock: api.remainingQuantity > 0 && api.remainingQuantity < 10,
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
