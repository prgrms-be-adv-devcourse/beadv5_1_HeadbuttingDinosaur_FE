# EventList 페이지 v2 계획

## 1. 페이지 디렉토리 구조

EventList는 hero / 검색·필터 / 카드 그리드 / 상태(loading·error·empty·pagination) / 키보드 내비까지 책임이 많은 큰 페이지라 SPEC § 0 표준 구조를 그대로 따르되 `components/` 안을 더 분해한다.

```
src/pages-v2/EventList/
├── index.tsx                      ← 라우트 진입점
├── EventList.tsx                  ← 페이지 컨테이너 (조립 + 상태 분기)
├── components/
│   ├── Hero.tsx                   ← eyebrow + 타이틀 + 서브카피 + kbd 힌트
│   ├── SearchAndFilters.tsx       ← 검색 인풋 + 카테고리 chip row + 기술 스택 chip row
│   ├── ResultHeader.tsx           ← "이벤트 N개 / 전체 M개 중" 헤더
│   ├── EventCard.tsx              ← 카드 1개 (accent bar + chrome 헤더 + 본문 + 푸터)
│   ├── MetaLine.tsx               ← 카드 내부의 라벨/값 row (일시/장소/주최)
│   ├── EventCardSkeleton.tsx      ← 카드 로딩 placeholder
│   ├── EmptyStackTrace.tsx        ← 빈 결과 + 필터 초기화
│   ├── ErrorState.tsx             ← 네트워크/서버 에러 + 재시도
│   └── Pagination.tsx             ← 페이지네이션 (페이지네이션 vs 무한스크롤 최종 결정은 § 5/§ 9)
├── adapters.ts                    ← API ↔ EventVM 변환
├── hooks.ts                       ← 데이터 페칭 / URL 동기화 / 키보드 내비
└── types.ts                       ← EventVM, EventListFilters, EventListParams
```

### 실제로 만들 파일

| 파일 | 역할 |
|---|---|
| `index.tsx` | 라우트 진입점. URL 쿼리스트링 → 필터 초기값 도출. `useEventList` (데이터 + URL 동기화) + `useEventListKeyboard` 결합 후 `EventList.tsx`에 props 주입. |
| `EventList.tsx` | 페이지 컨테이너. gutter + editor-body 스캐폴드, `Hero` / `SearchAndFilters` / `ResultHeader` 조립, 데이터 상태에 따라 `EventCardSkeleton[]` / `ErrorState` / `EmptyStackTrace` / 그리드 + `Pagination` 분기. 자체 fetch 로직 없음. |
| `components/Hero.tsx` | eyebrow pill + h1 + 서브카피(필터된 개수 표시) + kbd 힌트 묶음. props로 `totalCount` 받음. |
| `components/SearchAndFilters.tsx` | 검색 인풋(controlled value만 받음, 디바운스는 훅에서) + 카테고리 chip row(각 카운트 포함) + 기술 스택 chip row. `inputRef`는 키보드 훅의 포커스 대상으로 노출. |
| `components/ResultHeader.tsx` | 좌측 "이벤트 N개", 우측 "전체 M개 중" 보조 라인. 필터 영역과 그리드 사이의 헤더. |
| `components/EventCard.tsx` | 단일 카드. 좌측 accent bar + chrome 헤더(`#카테고리 · 시각 · status chip`) + 타이틀(2 line clamp) + meta + 기술 스택 태그(+N) + 푸터(PRICE/STOCK). focused/hover 처리. 클릭 시 `onOpen(eventId)` 호출만 하고 라우팅은 컨테이너에서. |
| `components/MetaLine.tsx` | 카드 내부 `LABEL  값` 작은 row. `EventCard`에서만 쓰지만 반복 3회 + 정렬·ellipsis 룰이 동일해서 분리. |
| `components/EventCardSkeleton.tsx` | 로딩 시 그리드 자리에 8개 깔리는 placeholder. SPEC § 5의 신규 상태. |
| `components/EmptyStackTrace.tsx` | stack-trace 박스 빈 상태. 검색어/필터 적용 여부에 따라 메시지·리셋 버튼 분기. |
| `components/ErrorState.tsx` | 네트워크/서버 에러 박스 + 재시도 버튼. SPEC § 10 신규 상태. |
| `components/Pagination.tsx` | 페이지 이동 컨트롤. 컨테이너는 인터페이스(`page`, `hasNext`, `onPageChange`)만 알고, 무한스크롤로 바꿔도 컴포넌트만 교체. |
| `adapters.ts` | `ApiEvent → EventVM` 변환 + 카테고리/기술 스택 카운트 산출. `extractTechStacks`, `accent` 매핑 같은 표시용 파생 값은 어댑터/뷰 헬퍼 안에 가두고 컴포넌트로 새지 않게 한다. |
| `hooks.ts` | 두 훅 export — `useEventList` (필터 ↔ URL ↔ `src/api/events.api.ts` 호출 통합, 디바운스 + 페이지 전환), `useEventListKeyboard` (`/` `j` `k` `↵` `⌘K` 글로벌 핸들러). |
| `types.ts` | `EventVM`, `EventListFilters` (`{ keyword, category, stack, page }`), `EventListParams` (API 호출용), 카테고리·기술 스택 union. |

### 생략 파일 + 사유

| 생략 파일 | 사유 |
|---|---|
| `components/Chip.tsx`, `components/Kbd.tsx`, `components/StatusChip.tsx`, `components/Eyebrow.tsx` | SPEC § 0 공용 컴포넌트(Phase 1 산출물)라 페이지 디렉토리에 두지 않는다. `src/components-v2/`에서 import. |
| `components/SearchInput.tsx` | `SearchAndFilters` 안의 인풋은 `code-input` 패턴 + 검색 아이콘 + `/` kbd만 붙는 형태라 따로 뺄 만큼의 재사용성이 없다. `SearchAndFilters` 내부에 인라인 처리. |
| 라우터 등록 파일 | EventList 디렉토리 안에 두지 않음. 라우터 등록은 상위 `src/App.tsx`(또는 routes 모듈)에서 처리 — § 8에서 다룸. |

## 2. 컴포넌트 분해

`prototype/EventList.jsx`를 기준으로 v2의 분해. 공용은 SPEC § 0 Phase 1에서 만들어진 `src/components-v2/*`를 가리킨다. props는 시그니처만 표기한다(타입 정의는 § 1의 `types.ts`에서).

### 분해 표

| 이름 | 역할 | 위치 (파일) | 의존 컴포넌트 (공용 / 서브) |
|---|---|---|---|
| `EventList` | 페이지 컨테이너. 데이터 상태 분기(loading/error/empty/grid)와 자식 조립만 담당. | `EventList.tsx` | (서브) `Hero`, `SearchAndFilters`, `ResultHeader`, `EventCard`, `EventCardSkeleton`, `EmptyStackTrace`, `ErrorState`, `Pagination` |
| `Hero` | eyebrow pill + h1 + 서브카피(필터 후 개수) + kbd 힌트 4개. | `components/Hero.tsx` | (공용) `Eyebrow`, `Kbd` |
| `SearchAndFilters` | 검색 인풋 + 카테고리/기술 스택 chip row 묶음. controlled value만 props로 받음(디바운스는 훅). | `components/SearchAndFilters.tsx` | (공용) `Icon`, `Chip`, `Kbd` · (서브) — |
| `ResultHeader` | "이벤트 N개 / 전체 M개 중" 라인 + 하단 border. | `components/ResultHeader.tsx` | — |
| `EventCard` | 카드 1개. accent bar + chrome 헤더 + 본문(타이틀/meta/스택태그) + 푸터(PRICE/STOCK). focused 처리. | `components/EventCard.tsx` | (공용) `StatusChip` · (서브) `MetaLine` |
| `MetaLine` | 카드 내부 `LABEL  값` row (일시/장소/주최, 3회 반복). | `components/MetaLine.tsx` | — |
| `EventCardSkeleton` | 카드 자리 placeholder 1개. § 6에서 셰이프/애니메이션 상세화. | `components/EventCardSkeleton.tsx` | — |
| `EmptyStackTrace` | stack-trace 톤 빈 상태. 필터 적용 여부에 따라 카피·리셋 버튼 표시. | `components/EmptyStackTrace.tsx` | (공용) `Button` |
| `ErrorState` | 네트워크/서버 에러 박스 + 재시도. SPEC § 10 신규 상태. | `components/ErrorState.tsx` | (공용) `Button` |
| `Pagination` | 페이지 이동 컨트롤. (페이지네이션 vs 무한스크롤 결정은 § 5/§ 9.) | `components/Pagination.tsx` | (공용) `Button` |

### 각 컴포넌트 props 시그니처

```ts
// EventList.tsx — 자체 파일은 props 거의 없음. index.tsx가 훅 결과를 펼쳐 넘김.
type EventListProps = {
  filters: EventListFilters;
  setFilters: (next: Partial<EventListFilters>) => void;
  query: { status: 'loading' | 'error' | 'success'; data?: EventListPage; error?: unknown; refetch: () => void };
  totalCount: number;            // 전체 (필터 무관) 카운트 — Hero/ResultHeader 공용
  categoryCounts: Record<string, number>;
  focusIdx: number;              // 키보드 내비 인덱스
  cardRefs: React.MutableRefObject<(HTMLElement | null)[]>;
  searchInputRef: React.RefObject<HTMLInputElement>;
  onOpenEvent: (eventId: string) => void;
};

// Hero.tsx
type HeroProps = { filteredCount: number };

// SearchAndFilters.tsx
type SearchAndFiltersProps = {
  keyword: string; onKeywordChange: (next: string) => void;
  category: string; onCategoryChange: (next: string) => void;
  stack: string; onStackChange: (next: string) => void;
  categories: readonly string[];
  stacks: readonly string[];
  categoryCounts: Record<string, number>;
  searchInputRef: React.RefObject<HTMLInputElement>;
};

// ResultHeader.tsx
type ResultHeaderProps = { filteredCount: number; totalCount: number };

// EventCard.tsx
type EventCardProps = {
  event: EventVM;
  focused: boolean;
  onOpen: () => void;
  innerRef?: (el: HTMLElement | null) => void;
};

// MetaLine.tsx
type MetaLineProps = { label: string; value: string };

// EventCardSkeleton.tsx
type EventCardSkeletonProps = {}; // 단일 카드. 그리드에서 N번 렌더.

// EmptyStackTrace.tsx
type EmptyStackTraceProps = { hasActiveFilters: boolean; onReset: () => void };

// ErrorState.tsx
type ErrorStateProps = { onRetry: () => void; message?: string };

// Pagination.tsx
type PaginationProps = {
  page: number; totalPages: number; hasNext: boolean;
  onPageChange: (next: number) => void;
};
```

### 추가 분해 / 인라인 유지 권고

| 후보 | 결정 | 사유 |
|---|---|---|
| **검색 인풋** (SearchAndFilters 내부) | **인라인 유지** (별도 파일 X) | `code-input` 패턴 + 검색 아이콘 + `/` kbd만 붙는 짧은 마크업. 재사용 사례 없음. 분리 시 props 패스스루만 늘어남. |
| **카테고리 chip 그룹 / 기술 스택 chip 그룹** | **`SearchAndFilters` 안에 인라인 유지** | 둘 다 "라벨 + flex-wrap chip row" 같은 구조지만 카테고리는 카운트 표시·항상 1개 선택, 스택은 토글이라 props가 갈린다. 공통 추상화는 과잉이고, 별 파일로 빼면 부모/자식 분리 비용만 든다. SPEC § 0 `Chip`이 시각적 책임을 이미 담당. (필터가 더 늘면 그때 `FilterChipGroup`으로 일반화.) |
| **카드 그리드 (`<div grid>` + `.map`)** | **`EventList.tsx` 안에 인라인 유지** | 그리드 컨테이너는 CSS 한 줄(`auto-fill, minmax(280px, 1fr)`) + 매핑이 전부. loading/error/empty 분기와 같은 위치에 두는 편이 가독성이 높다. 별 컴포넌트 분리 이득 없음. |
| **카드 내 file-tab 헤더 / 푸터(PRICE·STOCK)** | **`EventCard.tsx` 안에 인라인 유지** | 헤더 ~6줄, 푸터 ~12줄로 짧고 `EventCard` 외에서 재사용 없음. 분리 시 카드의 시각적 흐름만 분산. (카드가 200줄을 넘기면 그때 `CardChromeHeader` / `CardPriceStockFooter`로 분리.) |
| **`MetaLine`** | **분리 유지 (§ 1 결정 그대로)** | 라벨 폭 30px, mono 라벨, 우측 ellipsis 등 룰이 동일한 row가 카드 안에서 3회 반복. 인라인 두면 같은 스타일이 3번 복붙됨. |
| **`EventCardSkeleton` 내부 라인 placeholder** | **인라인 유지** | 단일 카드 스켈레톤만으로 충분. 라인별 분해는 § 6에서 셰이프 확정 후 결정. |

## 3. API 매핑 테이블
(작성 예정)

## 4. URL 쿼리스트링 ↔ 상태 동기화
(작성 예정)

## 5. 데이터 페칭 전략
(작성 예정)

## 6. 신규 상태 처리 (로딩/에러/empty/페이징)
(작성 예정)

## 7. 키보드 인터랙션
(작성 예정)

## 8. 라우터 등록 방법
(작성 예정)

## 9. 의사결정 필요 지점
(작성 예정)

## 10. PR 분할 + 파일 생성 순서
(작성 예정)
