/**
 * Landing 페이지 어댑터.
 * PR 2 (Hero + Stats) — Landing.plan.md §12.2.
 *
 * - `toStatsVM(firstPage)` — Stats 4 카드 합성 (§4 표 1, §11 #3).
 *   1=totalElements, 2=ON_SALE 길이, 3=remainingQuantity 합, 4='24+' 하드코딩.
 * - `buildTerminalLines(totalCount)` — TypedTerminal 라인 합성 (§11 #1).
 *   라인 1 의 카운트만 동적, 라인 2 는 프로토타입 하드코딩 유지.
 *
 * (PR 3 진입 시 toFeaturedItemVM / toCategoryCountVM 추가)
 */

import type { EventListPage } from '@/pages-v2/EventList/types';
import type { StatVM, TerminalLine } from './types';

/**
 * 4번 카드 ('참여 커뮤니티') v1 하드코딩 값.
 * §4 표 1 옵션 A — 백엔드 카운트 엔드포인트 부재. 합의되면 어댑터만 교체.
 */
const HOSTS_HARDCODED = '24+';

export const toStatsVM = (firstPage: EventListPage): StatVM[] => {
  const items = firstPage.items;
  const onSaleCount = items.filter((e) => e.status === 'ON_SALE').length;
  const remainingSum = items.reduce((acc, e) => acc + e.remainingQuantity, 0);
  return [
    { hint: '// active events',  num: firstPage.totalElements, unit: '개', label: '진행 중인 이벤트' },
    { hint: '// on sale',        num: onSaleCount,             unit: '매', label: '판매중인 티켓'   },
    { hint: '// seats left',     num: remainingSum,            unit: '+', label: '전체 잔여 좌석'   },
    { hint: '// communities',    num: HOSTS_HARDCODED,         unit: '팀', label: '참여 커뮤니티'   },
  ];
};

/**
 * TypedTerminal 라인 합성.
 * 라인 1 의 out 만 totalCount 로 합성. 미수신(undefined) 시 §6.1 보강에 따라
 * "다양한" 으로 fallback (라인 자체는 정적 노출 유지).
 * 라인 2 는 프로토타입 그대로 하드코딩 (§3 라인 데이터, §12.2 검증 케이스 4).
 */
export const buildTerminalLines = (
  totalCount: number | undefined,
): TerminalLine[] => {
  const countText =
    typeof totalCount === 'number' ? `${totalCount}개의` : '다양한';
  return [
    {
      prompt: '~',
      cmd: 'devticket search --stack=react --near=seoul',
      out: `→ ${countText} 이벤트를 찾았어요`,
    },
    {
      prompt: '~',
      cmd: 'devticket book "React Korea 18차 밋업"',
      out: '✓ 티켓 1매가 발급되었습니다',
    },
  ];
};
