/**
 * Landing 페이지 전용 타입.
 * PR 1 (TypedTerminal) 에서 `TerminalLine` 정의.
 * PR 2 (Hero + Stats) 에서 `StatVM`, `LandingFirstPageQuery` 추가
 * (Landing.plan.md §12.2).
 * PR 3 (Categories + Featured) 에서 `CategoryTileVM`, `FeaturedItemVM`,
 * `LandingCategoriesQuery`, `LandingFeaturedQuery` 추가
 * (Landing.plan.md §12.3).
 */

import type { EventVM, EventListPage } from '@/pages/EventList/types';

export interface TerminalLine {
  /** 프롬프트 표시용 ('~' 등) */
  prompt: string;
  /** 한 글자씩 타이핑되는 명령어 */
  cmd: string;
  /** cmd 완료 후 노출되는 출력 라인 */
  out: string;
}

/**
 * Stats 섹션 4 카드의 단일 view model.
 * `num` 은 number/string 모두 허용 — 4번 카드는 `'24+'` 하드코딩 (§4 표1, §11 #3).
 * 0 vs 미수신 구분: 데이터 단계의 query.status 로만 판단 (§6.2).
 */
export interface StatVM {
  /** 카드 상단 mono 힌트 (예: "// active events") */
  hint: string;
  /** 큰 숫자 블록 (number 또는 '24+' 같은 string) */
  num: number | string;
  /** 숫자 뒤 단위 ('개' / '+' 등). 없으면 빈 문자열 */
  unit: string;
  /** 하단 라벨 (예: "진행 중인 이벤트") */
  label: string;
}

/**
 * Landing 의 1차 응답(`getEvents({ page:0, size:10 })`) query state.
 * EventList 의 `EventsQuery` 와 같은 차별 유니온 패턴 — `loading`/`error` 시
 * `previous` 를 보존해 UI 깜빡임을 막는다 (§5.1).
 *
 * Stats 와 (PR 3 의) Featured 가 같은 응답을 공유하기 때문에
 * raw `EventListPage` 단위로 보관한다.
 */
export type LandingFirstPageQuery =
  | { status: 'loading'; previous?: EventListPage }
  | { status: 'success'; data: EventListPage; fetchedAt: number }
  | { status: 'error'; error: unknown; previous?: EventListPage };

/**
 * Categories 6 타일 view model (§2 Categories, §6.3).
 * - `cat`: 한국어 카테고리명 (URL/필터 키, EventList plan §4 라인 165–166).
 * - `count`: 6 병렬 `filterEvents` 의 totalElements. 부분 실패 시 `null`
 *   → 타일에 `—` 표시 (카운트 0 (`0개 이벤트`) 과 구분, §12.3 D / 머지조건).
 * - `icon`: 약자 글리프 ('CF' 등). 장식용 — `aria-hidden="true"` (§9.6).
 * - `accent`: 카테고리 고정 accent 토큰 키 ('indigo'/'sky'/...).
 *   CSS 변수로 주입해 hover borderColor 결선 (§2 Categories).
 */
export interface CategoryTileVM {
  cat: string;
  count: number | null;
  icon: string;
  accent: AccentToken;
}

/**
 * SPEC §0 accent 팔레트 키 (회전/카테고리 매핑 공용).
 * `red` 는 카테고리 매핑에서 사용하지 않지만 Featured accent 회전에서 쓰임.
 */
export type AccentToken =
  | 'indigo'
  | 'sky'
  | 'emerald'
  | 'amber'
  | 'violet'
  | 'pink'
  | 'red';

/**
 * Featured 5 rows view model (§2 Featured).
 * `EventVM` 에서 행 렌더에 필요한 필드만 좁힌 형태 +
 * 순번(rank, 1-based) + accent (eventId 회전).
 */
export type FeaturedItemVM = Pick<
  EventVM,
  | 'eventId'
  | 'title'
  | 'category'
  | 'price'
  | 'remainingQuantity'
  | 'status'
  | 'eventDateTime'
  | 'techStacks'
  | 'isFree'
  | 'dateLabel'
> & {
  rank: number;
  accent: AccentToken;
};

/**
 * Categories 섹션 query state (§6.3).
 * 6 병렬 호출의 부분 실패는 `data[i].count === null` 로 표현하므로
 * 전체 차원에서는 success / loading / error 만 노출.
 */
export type LandingCategoriesQuery =
  | { status: 'loading'; previous?: CategoryTileVM[] }
  | { status: 'success'; data: CategoryTileVM[]; fetchedAt: number }
  | { status: 'error'; error: unknown; previous?: CategoryTileVM[] };

/**
 * Featured 섹션 query state (§6.4).
 * 1차 `/events/recommendations` 실패/빈 → `getEvents` 폴백 → 5개 슬라이스.
 * 폴백 단계에서도 hooks 내부에서 합성하므로 query 표면은 단순 3-state.
 */
export type LandingFeaturedQuery =
  | { status: 'loading'; previous?: FeaturedItemVM[] }
  | { status: 'success'; data: FeaturedItemVM[]; fetchedAt: number }
  | { status: 'error'; error: unknown; previous?: FeaturedItemVM[] };
