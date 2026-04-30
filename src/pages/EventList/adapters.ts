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

/* 백엔드가 keyword + category 동시 적용을 무시하는 경우를 대비한 클라이언트
 * safety net. 활성 필터가 모두 적용된 결과만 노출하도록 items 만 좁힘 —
 * totalElements / page 는 서버 값 유지. */
export const applyClientSideFilters = (
  page: EventListPage,
  filters: EventListFilters,
): EventListPage => {
  const hasCategory =
    filters.category !== DEFAULT_CATEGORY && filters.category !== '';
  const hasKeyword = filters.keyword.trim() !== '';
  if (!hasCategory && !hasKeyword) return page;
  const kw = filters.keyword.trim().toLowerCase();
  const items = page.items.filter((e) => {
    if (hasCategory && e.category !== filters.category) return false;
    if (hasKeyword && !e.title.toLowerCase().includes(kw)) return false;
    return true;
  });
  return { ...page, items };
};

/* 종료/취소된 이벤트를 후순위로 — 활성(ON_SALE/SOLD_OUT/SCHEDULED)이 먼저,
 * 그 안에서는 서버가 정렬한 순서를 유지하기 위해 stable sort. */
const STATUS_PRIORITY: Record<string, number> = {
  ON_SALE: 0,
  SOLD_OUT: 1,
  SCHEDULED: 2,
  SALE_ENDED: 3,
  ENDED: 3,
  CANCELLED: 4,
};

export const sortByActiveFirst = (page: EventListPage): EventListPage => {
  const items = page.items
    .map((e, i) => ({ e, i }))
    .sort((a, b) => {
      const pa = STATUS_PRIORITY[a.e.status] ?? 9;
      const pb = STATUS_PRIORITY[b.e.status] ?? 9;
      if (pa !== pb) return pa - pb;
      return a.i - b.i;
    })
    .map((x) => x.e);
  return { ...page, items };
};

/* 백엔드 `/events` 엔드포인트는 keyword/category/techStacks 를 함께 받아도
 * 정상 처리하므로 (혼합 미지원이면 단일 응답 fallback) 프론트는 항상 모든
 * 활성 필터를 한 요청에 합쳐 보낸다. 키워드 검색 후 카테고리 필터가 미적용
 * 되던 버그(`search` 분기에서 category 가 누락되던 케이스)를 해소. */
export type CombinedRequest = EventListRequest &
  Partial<Pick<EventSearchRequest, 'keyword'>> &
  Partial<Pick<EventFilterRequest, 'category' | 'techStacks'>>;

export type FilterRequest = { kind: 'combined'; params: CombinedRequest };

export const toFilterRequest = (
  filters: EventListFilters,
  stackNameToId: Map<string, number>,
  size: number = DEFAULT_PAGE_SIZE,
): FilterRequest => {
  const { keyword, category, stack, page } = filters;
  const params: CombinedRequest = { page, size };
  const trimmed = keyword.trim();
  if (trimmed !== '') params.keyword = trimmed;
  const hasCategory = category !== DEFAULT_CATEGORY && category !== '';
  if (hasCategory) {
    params.category =
      CATEGORY_LABEL_TO_ENUM[category as EventCategoryLabel] ?? category;
  }
  const stackId = stack ? stackNameToId.get(stack) : undefined;
  if (stackId !== undefined) params.techStacks = [stackId];
  return { kind: 'combined', params };
};

export const serializeFilters = (f: EventListFilters): string =>
  `q=${f.keyword}|cat=${f.category}|stack=${f.stack}|page=${f.page}`;
