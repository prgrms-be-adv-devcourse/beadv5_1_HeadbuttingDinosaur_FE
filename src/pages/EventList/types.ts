import type { EventStatus } from '@/types/event';

export interface EventVM {
  eventId: string;
  title: string;
  category: string;
  techStacks: string[];
  price: number;
  remainingQuantity: number;
  status: EventStatus;
  eventDateTime: string;
  thumbnailUrl?: string;
  isFree: boolean;
  isLowStock: boolean;
  dateLabel: string;
  timeLabel: string;
  viewCount?: number;
  purchaseCount?: number;
}

export interface EventListFilters {
  keyword: string;
  category: string;
  stack: string;
  page: number;
}

export interface EventListPage {
  items: EventVM[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
}

export type EventsQuery =
  | { status: 'loading'; previous?: EventListPage }
  | { status: 'success'; data: EventListPage; fetchedAt: number }
  | { status: 'error'; error: unknown; previous?: EventListPage };
