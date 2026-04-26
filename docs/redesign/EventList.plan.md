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

### 사용하는 API (실제 시그니처)

`src/api/events.api.ts`의 세 함수가 모두 같은 엔드포인트(`GET /events`)를 다른 파라미터 셰이프로 호출한다.

```ts
// src/api/events.api.ts
getEvents(params?: EventListRequest)        // { page?, size? }
searchEvents(params: EventSearchRequest)    // { keyword, page?, size? }
filterEvents(params: EventFilterRequest)    // { category?, techStacks? (number[]), page?, size? }
// 모두 같은 응답: EventListResponse = { content: EventItem[], page, size, totalElements, totalPages }
```

세 함수가 한 엔드포인트로 합쳐지므로 `hooks.ts`에서 **활성 필터 조합에 따라 분기**한다 (keyword 있으면 `searchEvents`, category/stack 있으면 `filterEvents`, 둘 다 없으면 `getEvents`). 동시에 keyword + category가 함께 들어오는 경우는 백엔드가 단일 엔드포인트 한 콜로 받는지 확인 필요 → § 9 결정 항목.

기술 스택 필터는 `number[]` (ID)이라 `src/api/auth.api.ts#getTechStacks` (또는 `techStacks.ts#extractTechStacks`)로 마스터 목록을 한 번 받아 **이름 → ID 매핑 캐시**를 둔다. 어댑터는 이 매핑을 받아 변환한다.

### 표 1 — 요청 파라미터 매핑

| 프로토타입 필터 | API 파라미터 | 호출 함수 | 비고 |
|---|---|---|---|
| 검색어 (`keyword`) | `keyword: string` | `searchEvents` | 빈 문자열이면 호출 분기에서 제외. 디바운스(§ 5)는 hook에서. |
| 카테고리 (`cat`, `'전체' \| '컨퍼런스' \| ...`) | `category?: string` | `filterEvents` | `'전체'`면 파라미터 자체를 빼고 보낸다. 카테고리 카운트 표시는 응답으로는 못 받음 → 클라이언트에서 현재 페이지 분포로 계산하거나 별도 집계 API 필요 (§ 9). |
| 기술 스택 (`stack: string`, 단일 선택) | `techStacks?: number[]` | `filterEvents` | API는 **다중**(`number[]`) 지원. 프로토타입은 단일 토글이지만 v2도 단일 선택 유지(§ 9에서 확정). 이름 → ID 변환 필요 — `getTechStacks` 마스터로 매핑. |
| 페이지 | `page?: number`, `size?: number` | 모든 함수 공통 | **0-base** 또는 **1-base** 백엔드 컨벤션 확인 필요 (응답이 `page`/`totalPages` 반환 → 그대로 컨트롤). 기본 `size`는 24(그리드 8×3) 가정 — § 5에서 확정. |
| 정렬 | (API 미노출) | — | 프로토타입에 정렬 UI 없음. 서버 기본 정렬 그대로 수용. 정렬 필요 시 백엔드 추가 요청 → § 9. |

### 표 2 — 응답 필드 매핑 (mock event → API event)

소스: `src/api/types.ts#EventItem` (목록 응답의 단일 항목).

| MOCK_EVENTS 필드 | 실제 API 필드 (`EventItem`) | 변환 로직 |
|---|---|---|
| `eventId` | `eventId: string` | 그대로. |
| `title` | `title: string` | 그대로. |
| `category` | `category: string` | 그대로. (카테고리 enum/한글 라벨 정규화는 § 9.) |
| `price` | `price: number` | 그대로. `price === 0`이면 카드 푸터 "무료" + status chip "무료" 분기 (어댑터에서 파생 플래그 `isFree` 노출). |
| `remainingQuantity` | `remainingQuantity: number` | 그대로. `< 10 && > 0`이면 "low stock" 파생 플래그 `isLowStock` 추가. |
| `status` (`'ON_SALE' \| 'SOLD_OUT'`) | `status: string` | API는 free-form `string`. 실제 값은 기존 코드 기준 `'ON_SALE' \| 'SOLD_OUT' \| 'SALE_ENDED' \| 'CANCELLED' \| 'ENDED'`(`src/pages/seller/*`, `src/components-v2/Layout/index.tsx` 사용 사례). 어댑터에서 union으로 좁히고, 카드는 `'ON_SALE'` / `'SOLD_OUT'` / 기타("판매 종료")로 표시 분기. |
| `eventDateTime` | `eventDateTime: string` (ISO) | 그대로 받고, 어댑터에서 `dateLabel`(`YYYY.MM.DD`) + `timeLabel`(`HH:mm`) 파생 필드 노출. 카드 chrome 헤더와 메타 line이 같은 포맷 사용. |
| `techStacks` (`string[]`) | `techStacks: string[]` | 그대로. (목록 응답은 이름 배열, 상세는 `TechStackItem[]`로 다름 — 본 페이지는 목록만 사용.) `slice(0, 3)` + `+N` 표시는 `EventCard` 내부 책임. |
| `location` | **API 미존재** | `EventItem`엔 없음 (`EventDetailResponse`에만 있음). 카드에서 노출하던 라인을 어떻게 할지 § 9 결정 — **A안**: 백엔드에 `location`을 `EventListResponse`에 포함 요청 / **B안**: 카드에서 `location` 메타 라인 제거 / **C안**: 호버 시 lazy detail 호출. **기본 가정 B안**(B 채택 시 메타 라인은 `일시`만 남김). |
| `host` | **API 미존재** | 마찬가지. `EventDetailResponse`엔 `sellerNickname`이 대응. § 9 결정 — 기본 가정 B안(카드에서 host 라인 제거). |
| (없음) | `thumbnailUrl?: string` | 프로토타입은 글리프 그라디언트만 씀. v2도 기본 그라디언트 유지하되 `thumbnailUrl`이 있으면 카드 좌측 썸네일 슬롯에 사용 — § 9 옵션. |

> **메모**: `location` / `host` 가용성에 따라 `EventCard`의 `MetaLine` 행 수가 1~3개로 달라진다. § 2에서 정의한 `MetaLine` props는 그대로 두고, 어댑터가 사용 가능한 메타만 채워서 카드가 `Array<{label, value}>`로 받도록 변경하는 옵션도 § 9에서 같이 정리.

### 어댑터 위치

```
src/pages-v2/EventList/adapters.ts
```

- `toEventVM(api: EventItem, opts?: { ... }) => EventVM` — 위 변환 + 파생 플래그(`isFree`, `isLowStock`, `dateLabel`, `timeLabel`).
- `toEventListPage(res: EventListResponse) => EventListPage` — `{ items: EventVM[], page, size, totalElements, totalPages, hasNext }`. `hasNext`는 `page < totalPages - 1` 등 백엔드 0/1-base 컨벤션 확정 후 적용 (§ 5).
- `toFilterRequest(filters: EventListFilters, stackNameToId: Map<string, number>) => { kind: 'list' | 'search' | 'filter', params }` — 어떤 API 함수를 부를지/파라미터 셰이프까지 어댑터에서 결정해서 hook은 그대로 호출.
- 컴포넌트는 `EventVM` / `EventListPage`만 알고 `EventItem`/`EventListResponse`는 전혀 모른다.

### 표 3 — 에러 응답

`apiClient`(`src/api/client.ts`)의 axios 응답 형태(`ApiResponse<T>`)를 hook에서 try/catch로 잡고, 아래 매핑으로 UI 분기.

| HTTP | 의미 | UI 처리 |
|---|---|---|
| **200, `content: []`** | 정상이지만 결과 없음 | `EmptyStackTrace` (검색어/필터 적용 여부에 따라 카피·"필터 초기화" 버튼 분기). |
| **400** | 파라미터 형식 오류 (예: `techStacks` ID가 음수) | `ErrorState` "요청 형식이 잘못되었습니다." + 필터 초기화 권유 + 재시도. (정상 사용에서 나오면 안 됨 — 발생 시 콘솔에 원본 메시지 로깅.) |
| **401** | 인증 만료/누락 | 이벤트 목록은 **공개**라 정상 호출에서 401 안 나오는 게 맞음. 발생 시 `src/lib/auth`의 401 인터셉터가 토큰 정리 → 페이지는 비로그인 상태로 그대로 표시. UI는 일반 `ErrorState`로 폴백. |
| **403** | 접근 권한 없음 | 동일. 공개 목록에선 비정상. `ErrorState` 폴백. |
| **404** | 엔드포인트 자체 부재 | 빌드/배포 사고. `ErrorState` "이벤트 목록을 불러올 수 없습니다." + 재시도. |
| **422** | 비즈니스 검증 실패 | 동일하게 `ErrorState`. 메시지는 서버가 주는 `message` 우선 표시(있을 때). |
| **5xx** | 서버 오류 | `ErrorState` "일시적인 오류입니다. 잠시 후 다시 시도해주세요." + 재시도 버튼. |
| **네트워크 끊김 / 타임아웃** | axios `error.code === 'ERR_NETWORK'` 등 | `ErrorState` "네트워크 연결을 확인해주세요." + 재시도. |

> 재시도 버튼은 hook이 노출한 `refetch`를 호출. 디바운스/페이지 등 모든 입력 상태는 보존(URL 동기화 덕에 새로고침으로도 같은 결과 재현 가능).

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
