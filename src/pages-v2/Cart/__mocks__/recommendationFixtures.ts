/**
 * 추천 카드 PR 4 시각 검증용 fixtures.
 *
 * Cart.plan.md § 10.3 PR 4. 실 API (`/events/user/recommendations`) 와
 * 어댑터 (`_shared/recommendation.ts :: toRecommendedCards`) 가 만들어내는
 * `RecommendedCardVM` 형태를 그대로 따른다 — 어댑터 합류 시 인터페이스
 * 충돌 없이 `useRecommendedEvents` 의 placeholder 를 실 호출로 교체할
 * 수 있도록 함.
 *
 * 파일은 PR 4 끝(혹은 다음 정리 PR)에서 제거될 예정. 인라인 mock 금지
 * 규칙을 위해 일시적으로 유지.
 */

import type { RecommendedCardVM } from '@/pages-v2/_shared/recommendation';

export const mockRecommendedCards: RecommendedCardVM[] = [
  {
    eventId: 'evt-rec-1',
    title: 'AWS Summit Seoul 2026',
    category: '컨퍼런스',
    price: 0,
    isFree: true,
    eventDateTime: '2026-05-14T10:00:00',
    dateLabel: '5월 14일 (목) 10:00',
  },
  {
    eventId: 'evt-rec-2',
    title: 'Frontend Fest — React 19 패턴',
    category: '워크숍',
    price: 39000,
    isFree: false,
    eventDateTime: '2026-05-22T13:00:00',
    dateLabel: '5월 22일 (금) 13:00',
  },
  {
    eventId: 'evt-rec-3',
    title: 'Devops Meetup Vol.12',
    category: '밋업',
    price: 0,
    isFree: true,
    eventDateTime: '2026-06-05T19:30:00',
    dateLabel: '6월 5일 (금) 19:30',
  },
  {
    eventId: 'evt-rec-4',
    title: 'AI for Web Engineers',
    category: '세미나',
    price: 25000,
    isFree: false,
    eventDateTime: '2026-06-12T14:00:00',
    dateLabel: '6월 12일 (금) 14:00',
  },
  {
    eventId: 'evt-rec-5',
    title: 'Backend Advanced — 분산 시스템 실전',
    category: '컨퍼런스',
    price: 89000,
    isFree: false,
    eventDateTime: '2026-06-20T09:00:00',
    dateLabel: '6월 20일 (토) 09:00',
  },
];
