// PR 1 한정 mock. PR 2 에서 실제 getEventDetail 호출로 교체되며 본 파일은
// 같은 PR 에서 삭제 예정 (EventDetail.plan.md §9.1 N8).

import type { EventDetailResponse } from '@/api/types';
import { toEventDetailVM } from '../adapters';

const sampleResponse: EventDetailResponse = {
  eventId: 'sample-on-sale',
  title: 'Spring Camp 2026 — Reactive & Cloud Native',
  description:
    '리액티브 프로그래밍과 클라우드 네이티브 아키텍처를 한 번에 다루는 1일 컨퍼런스.\n\n실무자 12명의 발표 + 라이브 코딩 세션 + 네트워킹 라운지로 구성됩니다. 발표 자료와 녹화본은 행사 후 2주 이내 참가자 메일로 전달됩니다.',
  category: '컨퍼런스',
  techStacks: [
    { techStackId: 1, name: 'Java' },
    { techStackId: 2, name: 'Spring Boot' },
    { techStackId: 3, name: 'Kafka' },
  ],
  price: 49000,
  totalQuantity: 200,
  remainingQuantity: 14,
  eventDateTime: '2026-05-18T14:00:00',
  location: '서울 강남구 코엑스 3층',
  status: 'ON_SALE',
  sellerNickname: 'Spring User Group Korea',
  createdAt: '2026-03-01T09:00:00',
};

export const sampleEventDetail = toEventDetailVM(sampleResponse);

// 매진 분기 시각 검증용. 스텁 hook 에서 sampleEventDetail 대신 import 해서 사용.
export const sampleEventDetailSoldOut = toEventDetailVM({
  ...sampleResponse,
  eventId: 'sample-sold-out',
  title: 'TypeScript 5.7 마이그레이션 세미나',
  status: 'SOLD_OUT',
  remainingQuantity: 0,
  price: 15000,
});
