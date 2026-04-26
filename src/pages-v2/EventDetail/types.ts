import type { EventStatus } from '@/types-v2/event';

export interface EventDetailVM {
  eventId: string;
  title: string;
  category: string;
  techStacks: string[];
  description: string;
  location: string;
  price: number;
  remainingQuantity: number;
  totalQuantity: number;
  status: EventStatus;
  sellerNickname: string;
  eventDateTime: string;
  dateLabel: string;
  timeLabel: string;
  isFree: boolean;
  isLowStock: boolean;
  isSoldOut: boolean;
  canBuy: boolean;
  thumbnailUrl?: string;
}

export type EventDetailQuery =
  | { status: 'loading'; previous?: EventDetailVM }
  | { status: 'success'; data: EventDetailVM; fetchedAt: number }
  | { status: 'not-found' }
  | { status: 'forbidden' }
  | { status: 'error'; error: unknown; previous?: EventDetailVM };
