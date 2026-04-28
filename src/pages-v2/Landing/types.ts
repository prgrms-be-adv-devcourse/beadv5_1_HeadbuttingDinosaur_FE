/**
 * Landing 페이지 전용 타입.
 * PR 1 (TypedTerminal) 에서 `TerminalLine` 정의.
 * PR 2 (Hero + Stats) 에서 `StatVM`, `LandingFirstPageQuery` 추가
 * (Landing.plan.md §12.2).
 * CategoryTileVM / FeaturedItemVM 등은 PR 3 진입 시 추가.
 */

import type { EventListPage } from '@/pages-v2/EventList/types';

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
