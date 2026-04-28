/**
 * Landing 페이지 어댑터.
 * PR 2 (Hero + Stats) — Landing.plan.md §12.2.
 *
 * - `toStatsVM(firstPage)` — Stats 4 카드 합성 (§4 표 1, §11 #3).
 *   1=totalElements, 2=ON_SALE 길이, 3=remainingQuantity 합, 4='24+' 하드코딩.
 * - `buildTerminalLines(totalCount)` — TypedTerminal 라인 합성 (§11 #1).
 *   라인 1 의 카운트만 동적, 라인 2 는 프로토타입 하드코딩 유지.
 *
 * PR 3 (Categories + Featured) — Landing.plan.md §12.3.
 *
 * - `CATEGORY_DEFINITIONS` — 6 카테고리 마스터 (§2 Categories,
 *   prototype/Landing.jsx L161–L167). 한국어 카테고리명 + 약자 + accent 키.
 * - `toCategoryTileVM(def, count)` — master + 응답 totalElements → tile VM.
 *   `count: null` 보존 (부분 실패) vs `0` (정상 0건) 구분 (§12.3 머지조건).
 * - `toFeaturedItemVM(EventVM, rank)` — EventVM 좁힘 + rank/accent 부착.
 * - `sortByDateAsc(list)` — Featured 폴백(`getEvents`) 시 `eventDateTime`
 *   오름차순 정렬용 (§12.3 §11 #4).
 * - `pickAccentByEventId(id)` — `eventId` 해시 기반 accent 회전. 프로토타입
 *   `accent()` 의 하드코딩 매핑은 mock 전용이라 일반 ID 에는 못 쓰므로
 *   결정적 해시 매핑으로 대체 (같은 ID → 항상 같은 accent).
 */

import type { EventListPage, EventVM } from '@/pages-v2/EventList/types';
import type {
  AccentToken,
  CategoryTileVM,
  FeaturedItemVM,
  StatVM,
  TerminalLine,
} from './types';

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

/* ===== PR 3: Categories + Featured ===== */

/**
 * 6 카테고리 마스터 (§2 Categories, prototype/Landing.jsx L161–L167).
 * `cat` 은 EventList 필터 키와 1:1 — 한국어 그대로 (URL 인코딩만, §8.1).
 * `accent` 는 SPEC §0 accent 팔레트 키. 6 카테고리 전부 색이 다름.
 */
export interface CategoryDefinition {
  cat: string;
  icon: string;
  accent: AccentToken;
}

export const CATEGORY_DEFINITIONS: readonly CategoryDefinition[] = [
  { cat: '컨퍼런스', icon: 'CF', accent: 'indigo'  },
  { cat: '밋업',     icon: 'MT', accent: 'sky'     },
  { cat: '해커톤',   icon: 'HT', accent: 'emerald' },
  { cat: '스터디',   icon: 'ST', accent: 'amber'   },
  { cat: '세미나',   icon: 'SM', accent: 'violet'  },
  { cat: '워크샵',   icon: 'WS', accent: 'pink'    },
] as const;

/**
 * `count: null` 은 호출부에서 부분 실패 신호로 사용 (§12.3 D / 머지조건).
 * 정상 0건은 `count: 0` 으로 들어오며 타일에 `0개 이벤트` 표시.
 */
export const toCategoryTileVM = (
  def: CategoryDefinition,
  count: number | null,
): CategoryTileVM => ({
  cat: def.cat,
  count,
  icon: def.icon,
  accent: def.accent,
});

/**
 * Featured accent 회전. 프로토타입 `accent()` 는 mock eventId(`a`/`b`/...)
 * 전용 하드코딩 맵이라 실제 UUID/숫자 ID 에 못 쓴다.
 * 대신 ID 의 char-sum 해시로 7개 토큰 중 하나를 결정적으로 고른다 —
 * 같은 ID 는 항상 같은 accent (재마운트/재정렬에서도 안정).
 */
const ACCENT_ROTATION: readonly AccentToken[] = [
  'indigo', 'sky', 'emerald', 'amber', 'violet', 'pink', 'red',
] as const;

export const pickAccentByEventId = (eventId: string): AccentToken => {
  let h = 0;
  for (let i = 0; i < eventId.length; i++) {
    h = (h + eventId.charCodeAt(i)) | 0;
  }
  return ACCENT_ROTATION[Math.abs(h) % ACCENT_ROTATION.length];
};

export const toFeaturedItemVM = (
  ev: EventVM,
  rank: number,
): FeaturedItemVM => ({
  eventId: ev.eventId,
  title: ev.title,
  category: ev.category,
  price: ev.price,
  remainingQuantity: ev.remainingQuantity,
  status: ev.status,
  eventDateTime: ev.eventDateTime,
  techStacks: ev.techStacks,
  isFree: ev.isFree,
  dateLabel: ev.dateLabel,
  rank,
  accent: pickAccentByEventId(ev.eventId),
});

/**
 * Featured 폴백 시 `eventDateTime` 오름차순 정렬 (§12.3 §11 #4).
 * 원본 배열을 변경하지 않도록 복사본 정렬.
 */
export const sortByDateAsc = <T extends { eventDateTime: string }>(
  list: readonly T[],
): T[] =>
  [...list].sort((a, b) =>
    a.eventDateTime < b.eventDateTime ? -1 : a.eventDateTime > b.eventDateTime ? 1 : 0,
  );
