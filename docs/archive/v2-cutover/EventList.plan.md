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

URL은 페이지 상태의 **단일 진실 소스(SoT)**. React state는 URL의 derived view. 이렇게 하면 뒤로가기/앞으로가기/공유/새로고침이 자동으로 같은 결과를 재현한다.

### 1) 쿼리 파라미터 키

| 필터 | 키 | 값 형식 | 기본값 (URL에서 생략) |
|---|---|---|---|
| 검색어 | `q` | 문자열 (URL 인코딩) | `''` (빈 문자열) |
| 카테고리 | `cat` | 한글 라벨 그대로 (`'컨퍼런스'`, `'밋업'`, …) | `'전체'` |
| 기술 스택 | `stack` | 단일 이름 (`'React'`) — 다중 도입 시 콤마 (§ 2 결정) | `''` (없음) |
| 페이지 | `page` | 숫자 (백엔드 컨벤션 따라 0/1-base — § 5에서 확정) | `0` (또는 `1`) |

키는 짧게(`q`, `cat`, `stack`, `page`). 외부에서 공유 가능한 표면이라 길고 직관적이지 않은 이름(`techStacks`, `categoryName`)은 피한다.

### 2) 다중 값 처리

- 현 단계: 기술 스택은 **단일 선택** (프로토타입과 동일). `?stack=React`.
- 향후 다중 도입 시: **콤마 join** (`?stack=React,Go`) 채택. 이유 — URL 짧음, history entry 차이 줄어듦, axios `params` serializer 기본 동작과 충돌 안 남(직접 join). 반복 키 방식(`?stack=React&stack=Go`)은 가독성 떨어지고 `URLSearchParams.get()`이 첫 값만 반환해 실수 유발.
- 어댑터(`adapters.ts#toFilterRequest`)가 콤마 문자열 → `number[]` (ID 배열)로 풀어 API 파라미터로 변환.

### 3) 빈 값 처리

- 기본값과 같으면 URL에서 **키 자체를 제거** (`?q=&cat=전체&page=0` 같은 노이즈 금지).
- 공유 URL이 짧고, "필터 없음" 상태가 `/events`로 정규화되어 캐시/북마크 친화적.
- 정규화는 `writeFilters` 한 곳에서 보장 (아래 코드).

### 4) 디바운스 시 URL 업데이트 타이밍

- 검색어 인풋은 **로컬 즉시 / URL 디바운스(300ms)**. 입력 중간 글자마다 URL 갱신 X.
- 검색어 변경은 `setSearchParams(..., { replace: true })` — 한 글자씩 history entry 쌓이지 않게 **현재 entry 교체**. 뒤로가기로 입력 직전 상태로 한 번에 돌아감.
- 카테고리/스택 chip 클릭, 페이지 변경은 `replace: false` (push) — 의도된 액션이라 history entry 1칸 사용. 뒤로가기로 직전 필터로 복원.
- 필터(검색 외) 변경 시 `page`는 항상 0으로 리셋.

### 5) 사용 훅

- `react-router-dom@6`의 `useSearchParams` (이미 `pages-v2/Login/index.tsx`에서 사용 중). 라이브러리 추가 도입 없음 (SPEC § 9 "추가 라이브러리 미도입 확정"과 일치).
- 페이지 진입 시 초기 상태는 hook이 `searchParams`에서 동기적으로 읽어 그대로 첫 렌더에 반영. 별도 effect로 후행 동기화하지 않는다 (URL → state 일방향).

### 핵심 흐름 (코드 골격)

```ts
// src/pages-v2/EventList/hooks.ts
const DEFAULT: EventListFilters = { keyword: '', category: '전체', stack: '', page: 0 };

const readFilters = (sp: URLSearchParams): EventListFilters => ({
  keyword:  sp.get('q')     ?? DEFAULT.keyword,
  category: sp.get('cat')   ?? DEFAULT.category,
  stack:    sp.get('stack') ?? DEFAULT.stack,
  page:     Number(sp.get('page') ?? DEFAULT.page),
});

const writeFilters = (sp: URLSearchParams, patch: Partial<EventListFilters>) => {
  const next = new URLSearchParams(sp);
  const put = (k: string, v: string, isDefault: boolean) => isDefault ? next.delete(k) : next.set(k, v);
  if ('keyword'  in patch) put('q',     patch.keyword!,            !patch.keyword);
  if ('category' in patch) put('cat',   patch.category!,            patch.category === '전체');
  if ('stack'    in patch) put('stack', patch.stack!,              !patch.stack);
  if ('page'     in patch) put('page',  String(patch.page!),        patch.page === 0);
  // 필터(검색 외) 변경 시 page 리셋
  if ('keyword' in patch || 'category' in patch || 'stack' in patch) next.delete('page');
  return next;
};

export function useEventListFilters() {
  const [sp, setSp] = useSearchParams();
  const filters = readFilters(sp);
  const setFilters = (patch: Partial<EventListFilters>, opts?: { replace?: boolean }) =>
    setSp(prev => writeFilters(prev, patch), { replace: opts?.replace ?? false });
  return { filters, setFilters };
}
```

검색어 디바운스는 같은 파일의 `useEventList`가 위 `setFilters`를 `replace: true`로 감싸 호출:

```ts
const debouncedKeyword = useDebouncedValue(localKeyword, 300);
useEffect(() => {
  setFilters({ keyword: debouncedKeyword }, { replace: true });
}, [debouncedKeyword]);
```

> 인풋의 controlled value는 **로컬 state**(`localKeyword`)를 사용해 즉시 반응. URL/`filters.keyword`는 디바운스 후에만 따라 움직인다. 둘이 일시적으로 어긋나는 것은 정상.

## 5. 데이터 페칭 전략

### 전제 (확정 사항)

- **캐시 라이브러리 없음**. SPEC § 9 + INVENTORY § 5: `axios` + `useEffect/useState` 패턴 유지. React Query / SWR / `useInfiniteQuery` 사용 불가.
- 기존 자산: `src/hooks/useApi.ts` (단발성), `src/hooks/useDebounce.ts`(400ms 기본). `usePagedApi`는 INVENTORY 언급은 있으나 **실제 파일 없음** — v2에서 새로 만든다.
- API 응답이 `{ content, page, size, totalElements, totalPages }` 표준 page 모델이라 cursor 기반 무한스크롤로 가기 어색함.

### 1) 사용할 훅

- **자체 `useEvents`** (페이지 디렉토리의 `hooks.ts`). 기존 `useApi`를 그대로 쓰지 않고 페이지에 특화된 형태로 신규 작성.
  - 이유: ① 필터 키 직렬화 + 모듈 레벨 인메모리 캐시 결합, ② `AbortController`로 키 변경 시 in-flight race 방지(`useApi`엔 없음), ③ "이전 결과 유지하며 위에 로딩 표시"(아래 placeholderData 항목)를 위한 상태 셰이프가 다름.
- 검색어 디바운스는 `src/hooks/useDebounce.ts` 재사용 (단, delay는 300ms로 호출 — § 4와 일치).

### 2) 캐시 키 설계

- 키는 **정규화된 필터 직렬화** 한 줄.
  ```ts
  const serializeFilters = (f: EventListFilters) =>
    `q=${f.keyword}|cat=${f.category}|stack=${f.stack}|page=${f.page}`;
  ```
- 키 안에 `keyword`, `category`, `stack`, `page` **모두 포함**. 다른 차원(정렬/사이즈 등)이 도입되면 키 함수에 같이 추가.
- URL 정규화(§ 4)와 키 정규화가 1:1 — 같은 URL이면 같은 캐시 슬롯에 매핑.

### 3) 디바운스

- 검색어: **300ms** (§ 4와 동일). `useDebounce(localKeyword, 300)` → 디바운스된 값이 바뀔 때만 URL `setFilters({ keyword }, { replace: true })` 호출 → URL → `useEventListFilters().filters` → `useEvents(filters)` 재실행.
- 카테고리/스택/페이지는 디바운스 없음 (한 번의 클릭이 즉시 fetch).

### 4) prefetch / placeholderData

- **prefetch: 도입 안 함**. 캐시 라이브러리 없이 hover prefetch를 직접 구현하면 코드 비용 대비 이득 적음. (이후 도입 시 § 9 갱신.)
- **placeholderData 효과**: 새 키 fetch 중에도 **직전 키의 데이터를 그리드에 유지**하고 위에 dim 인디케이터를 띄운다. 키 변경마다 그리드가 깜빡(skeleton → 데이터)하는 UX 단절 방지. 상태 셰이프에 `previousData` 슬롯을 둔다 (코드 골격 참고).
- 모듈 레벨 인메모리 LRU 캐시(슬롯 8개): 같은 키 재방문 시 즉시 표시. 뒤로가기/앞으로가기 시 효과 큼.

### 5) stale time / cache time

| 항목 | 값 | 동작 |
|---|---|---|
| **인메모리 캐시 수명** | 페이지 라이프사이클(탭 유지 동안). 새로고침 시 소멸. | LRU 8개 슬롯. |
| **stale 윈도우** | **60초** | 캐시 hit이고 60초 이내면 fetch 스킵, 캐시 그대로. |
| **stale 후 동작** | 60초 경과 시 캐시 표시 + 백그라운드 재요청 1회. 응답 도착하면 갱신. | "Show stale, refetch in background" 패턴을 직접 구현 (`fetchedAt: number`로 비교). |
| **수동 invalidate** | `refetch()` (재시도 버튼) | 해당 키만 캐시 제거 후 재요청. |

### 페이지네이션 vs 무한스크롤

**결정: 숫자 페이지네이션** (`Pagination.tsx`, § 2).

| 기준 | 페이지네이션 | 무한스크롤 |
|---|---|---|
| API 호환 | ✅ `{page, totalPages}` 그대로 매핑 | ⚠️ offset 기반이라 새 이벤트 등록 시 인덱스 밀림 → 중복/누락 가능 |
| URL 공유 (§ 4) | ✅ `page=N` 그대로 표현 | ⚠️ 스크롤 위치를 URL에 표현 어려움 |
| 키보드 내비(§ 7)와 결합 | ✅ 페이지 사이즈 고정이라 `j`/`k` 인덱스 단순 | ⚠️ 카드 수가 가변이라 인덱스 다루기 복잡 |
| 라이브러리 지원 | ✅ 단일 fetch + 컨트롤로 충분 | ❌ `useInfiniteQuery` 없음 — 직접 구현 비용 큼 |

→ **페이지네이션 채택**. 인덱스/사이즈 컨트롤은 `Pagination.tsx`의 props(`page`, `totalPages`, `hasNext`, `onPageChange`)로만 노출 — 추후 무한스크롤로 갈아끼울 때 컨테이너 변경 최소화.

### 핵심 흐름 (코드 골격)

```ts
// src/pages-v2/EventList/hooks.ts
type EventsQuery =
  | { status: 'loading'; previous?: EventListPage }
  | { status: 'success'; data: EventListPage; fetchedAt: number }
  | { status: 'error';   error: unknown; previous?: EventListPage };

const cache = new Map<string, { data: EventListPage; fetchedAt: number }>();
const STALE_MS = 60_000;

export function useEvents(filters: EventListFilters, stackNameToId: Map<string, number>) {
  const key = serializeFilters(filters);
  const [state, setState] = useState<EventsQuery>(() => {
    const hit = cache.get(key);
    return hit ? { status: 'success', data: hit.data, fetchedAt: hit.fetchedAt } : { status: 'loading' };
  });

  useEffect(() => {
    const hit = cache.get(key);
    const fresh = hit && Date.now() - hit.fetchedAt < STALE_MS;
    if (fresh) { setState({ status: 'success', data: hit!.data, fetchedAt: hit!.fetchedAt }); return; }
    setState(prev => ({ status: 'loading', previous: 'data' in prev ? prev.data : prev.previous }));

    const ctrl = new AbortController();
    callByKind(toFilterRequest(filters, stackNameToId), ctrl.signal)
      .then(toEventListPage)
      .then(data => { const now = Date.now(); cache.set(key, { data, fetchedAt: now }); setState({ status: 'success', data, fetchedAt: now }); })
      .catch(error => { if (!ctrl.signal.aborted) setState(prev => ({ status: 'error', error, previous: 'data' in prev ? prev.data : prev.previous })); });
    return () => ctrl.abort();
  }, [key]);

  const refetch = () => { cache.delete(key); setState({ status: 'loading' }); /* effect 재실행 위해 key 의존 별도 트리거 ref 사용 */ };
  return { ...state, refetch };
}
```

- 컴포넌트는 `state.status`로 분기(§ 6)하고, `previous`가 있으면 dim 처리해서 그대로 노출.
- LRU 축출은 `cache.size > 8`일 때 가장 오래된 슬롯 삭제 — 위 골격에서 생략, 실제 구현 시 보강.

## 6. 신규 상태 처리 (로딩/에러/empty/페이징)

§ 2 컴포넌트와 § 5 상태 머신(`{loading | success | error} × previous?`) 위에서 분기. 모든 상태에서 `Hero` + `SearchAndFilters`는 항상 보이게 둔다(=사용자가 어디서든 필터를 바꿔 다음 시도를 할 수 있어야 함). 변하는 건 **`ResultHeader` 아래 영역**(그리드 자리).

### 1) 로딩

| 케이스 | 트리거 (§ 5 상태) | 표시 | 사용자 액션 |
|---|---|---|---|
| **초기 로딩** | `status: 'loading'` & `previous == null` | `EventCardSkeleton × 8` (§ 2). `ResultHeader`는 자리만 잡고 카운트 텍스트는 비우거나 `이벤트 …개` placeholder. `Pagination` 미렌더. | (없음) |
| **재페칭 (필터/페이지 변경 등)** | `status: 'loading'` & `previous != null` | 직전 그리드 그대로 노출 + 그리드 상단에 얇은 progress bar(2px, brand color, indeterminate) + `aria-busy="true"`. dim 등 카드 자체 transparency는 적용하지 않는다(클릭 차단도 아님). | 그리드 클릭 가능 유지. 새 fetch 중에도 다른 필터 토글하면 즉시 키 변경. |
| **재시도 (에러 후)** | `refetch()` 호출 → `status: 'loading'` & `previous != null/null` | 직전 데이터 있으면 위 "재페칭"과 동일. 없으면 다시 skeleton 8. | (없음) |

**스켈레톤 카드 개수 = 8** (SPEC § 5 명시 + 280×4 = 1120 → 1100px 컨테이너에서 한 행 3~4개, 2행으로 적당). 그리드 css는 데이터 그리드와 동일한 `auto-fill, minmax(280px, 1fr)`을 그대로 사용해 행이 자연스럽게 늘어남.

**스켈레톤 컴포넌트 위치**: 페이지 전용 (`components/EventCardSkeleton.tsx`, § 1/§ 2). MyPage·EventDetail 등 다른 페이지의 카드 골격이 EventList와 다르므로 공용 추상화는 이르다. 단, 박스/라인 placeholder의 **시각 원자**(`Skeleton`, `SkeletonText`)는 SPEC § 0 공용 컴포넌트로 만든다고 가정하고 `EventCardSkeleton`은 그것을 조립.

**애니메이션**: pulse (`opacity: 0.5 ↔ 1`, 1.2s). shimmer 그라디언트는 dark theme 토큰 충돌 위험 + 구현 비용 → 1차에선 pulse만.

### 2) 에러

- **표시 위치**: 그리드 자리에 인라인 박스 (`ErrorState`, § 2). 토스트 X — 모달/팝업도 X. `Hero`/`SearchAndFilters`는 유지(=다른 필터로 바로 재시도 가능). `ResultHeader`는 숨김(결과를 못 받은 상태에서 카운트가 의미 없음).

| 분기 | 트리거 | 표시 | 사용자 액션 |
|---|---|---|---|
| **네트워크 끊김 / 타임아웃** | axios `error.code === 'ERR_NETWORK'` 등 | `ErrorState` "네트워크 연결을 확인해주세요." + 재시도 버튼 | 재시도 → `refetch()`. URL 그대로라 새로고침으로도 재시도 가능. |
| **5xx / 4xx (401·404 외)** | `error.response.status >= 500` 또는 400/422/403 | `ErrorState` (서버 `message` 우선, 없으면 § 3 표 3의 디폴트 카피) + 재시도 | 재시도. |
| **404 (엔드포인트 부재)** | `status === 404` | `ErrorState` "이벤트 목록을 불러올 수 없습니다." + 재시도 | 재시도. (정상 사용에선 안 나옴 — 배포 사고 가시화용) |
| **401** | `status === 401` | EventList는 공개 엔드포인트라 정상에선 발생 X. 발생 시 인터셉터(`src/api/client.ts`)가 토큰 정리 → 페이지는 비로그인으로 정상 표시 시도 (재요청 1회). 그래도 401이면 **로그인 리다이렉트** — `<Navigate to={`/login?returnTo=${encodeURIComponent(pathname + search)}`} replace />`. 추후 보호 모드로 바뀔 때 대비한 분기. | 자동 리다이렉트. |

> 인증 인터셉터 동작(보유 토큰 갱신·로그아웃 처리)은 `src/api/client.ts` 표준 흐름을 그대로 따른다. `useEvents` 훅은 401을 받으면 더 이상 자체 처리 없이 `Navigate`로 위임.

### 3) 빈 결과

| 케이스 | 트리거 | 메시지 | 사용자 액션 |
|---|---|---|---|
| **필터 적용 + 0건** | `data.totalElements === 0` & `hasActiveFilters === true` | `EmptyStackTrace` (stack-trace 톤). "🔍 검색 결과가 없습니다" + "적용된 필터에 해당하는 이벤트를 찾지 못했어요." + "필터 초기화" 버튼 | 버튼 → `setFilters({ keyword: '', category: '전체', stack: '', page: 0 })` (push). 또는 chip 직접 토글로 좁힌 필터 해제. |
| **필터 없음 + 0건** | `data.totalElements === 0` & `hasActiveFilters === false` | "🌱 아직 등록된 이벤트가 없습니다" + 보조 카피 "곧 새 이벤트가 등록될 예정입니다." (리셋 버튼 X — 리셋할 필터가 없음) | (없음) — 추후 랜딩 또는 알림 신청 CTA 추가 시 § 9에서 갱신. |

**hasActiveFilters 판정**:
```ts
const hasActiveFilters = filters.keyword !== '' || filters.category !== '전체' || filters.stack !== '';
// page는 카운트가 0인 시점에서 의미 없으므로 판정에서 제외
```

`EmptyStackTrace` 단일 컴포넌트가 `hasActiveFilters` props로 두 케이스를 분기 (별 컴포넌트 분리 X — § 2와 일관).

### 4) 페이지네이션 (§ 5 결정)

| 항목 | 처리 |
|---|---|
| 컨트롤 | `Pagination` (§ 2). 그리드 하단, 가운데 정렬, 상단 24px 마진. |
| 형태 | `‹ 1 … 4 5 [6] 7 8 … 20 ›` 윈도우 5칸. 현재 페이지 강조 (brand bg + 흰 텍스트). 화살표는 첫/마지막에서 disabled. |
| 페이지 변경 동작 | ① `setFilters({ page: next })` (push, replace 아님 — § 4) → ② URL 변경 → ③ `useEvents` key 변경 → ④ "재페칭" 상태(=직전 데이터 그대로 + 상단 progress bar) → ⑤ 응답 도착 시 그리드 교체. 동시에 `window.scrollTo({ top: 0, behavior: 'smooth' })`로 그리드 상단 복귀. |
| 다음 페이지 로딩 인디케이터 | 위 ④의 progress bar로 충분. `Pagination` 자체엔 spinner 안 붙임. |
| 마지막 페이지 도달 | `hasNext === false`면 `›` 버튼 disabled. 별도 "끝입니다" 텍스트는 표시 안 함 (페이지 번호로 자명). |
| `totalPages <= 1` | `Pagination` 자체 미렌더. |
| 무한스크롤 가능성 | § 5에서 페이지네이션 채택 — IntersectionObserver / scroll handler 미구현. `Pagination` props 인터페이스만 알면 됨. 후속 도입 시 컨테이너만 교체 (§ 9). |

### 5) 검색어 입력 중 (디바운스 진행)

- **트리거**: `localKeyword !== debouncedKeyword` (§ 4의 `useDebounce(localKeyword, 300)` 결과 비교).
- **표시**: 검색 인풋 우측 `/` kbd **앞**에 11px spinner (`◐` 회전 또는 brand-color 원형 spinner). 디바운스 진행 중에만 노출. 디바운스 종료 후엔 fetch가 시작되지만 그 단계의 인디케이터는 위 1)의 progress bar가 담당.
- **사용자 액션**: 무시하고 계속 타이핑 가능. ESC 누르면 `localKeyword`를 `''`로 즉시 리셋(키보드 인터랙션 § 7에서 정의).
- **단순화 옵션**: 너무 noise스러우면 1차에선 생략하고 § 9 의사결정으로 넘김. **기본은 표시(스피너 1개)** — 입력이 반영 중인지 사용자가 알 수 있어야 함.

## 7. 키보드 인터랙션

프로토타입은 `window.__focusSearch` / `window.__cardNav` / `__openPalette` 같은 전역을 썼지만 SPEC § 0에서 `window.*` 글로벌 금지. 페이지 단일 hook(`useEventListKeyboard`, § 1/§ 2)에서 `keydown` 1개 리스너로 통합 처리.

### 단축키 표

| 키 | 동작 | 스코프 | 인풋 포커스 시 |
|---|---|---|---|
| **`⌘K` / `Ctrl+K`** | 빠른 검색 팔레트 열기 | 글로벌 | (열림) |
| **`/`** | 검색 인풋 포커스 + 기존 텍스트 select | 글로벌 (인풋 포커스 시 제외) | 패스스루 (`/`가 그대로 입력됨) |
| **`Esc`** | 검색 인풋 비우기 + blur | 검색 인풋 포커스 시 | 동작 |
| **`j`** | 다음 카드 포커스 + 뷰포트로 스크롤 | 글로벌 (인풋 포커스 시 제외) | 패스스루 |
| **`k`** | 이전 카드 포커스 + 스크롤 | 글로벌 (인풋 포커스 시 제외) | 패스스루 |
| **`Enter`** | 포커스된 카드 열기 (상세로 이동) | 카드 포커스 시 | (카드는 인풋이 아님) |
| **`Tab` / `Shift+Tab`** | 자연 포커스 사이클 (검색 → chip → 카드 → 페이지네이션) | 항상 (개입하지 않음) | 동작 |

### 1) 글로벌 vs 로컬 스코프

- **글로벌(window keydown 1개)**: `⌘K`, `/`, `j`, `k`. 페이지 어디서나 잡힘.
- **로컬(요소 자체 핸들러)**: `Esc`(검색 인풋), `Enter`(카드). 둘 다 해당 요소가 native focusable이라 별도 글로벌 처리 없이 `onKeyDown`으로 처리.
- `Tab`은 절대 가로채지 않는다 (브라우저 기본 동작 유지).

### 2) `⌘K` 처리 (이번 PR 범위 밖)

- 빠른 검색 팔레트(프로토타입 Landing의 `__openPalette`)는 **EventList PR 범위 밖**. 별 PR 또는 Layout PR(§ 7 SPEC)에서 다룰 가능성.
- EventList의 hook은 `onOpenPalette?: () => void` props만 노출. 부모(`index.tsx`)가 `undefined`면 `⌘K` 핸들러는 **`preventDefault` 없이 무시** — 브라우저 기본(주소창 포커스 등)이 그대로 동작 → 사용자가 기능 미구현임을 자연히 인지.
- 팔레트 PR이 들어오면 `index.tsx`에서 `onOpenPalette` 주입 한 줄만 추가하면 됨.

### 3) 인풋에 포커스 있을 때 (입력 우선)

`document.activeElement`(또는 `e.target`)가 다음 중 하나면 `j` / `k` / `/`는 **그대로 패스스루**(preventDefault X):
- `INPUT`, `TEXTAREA`, `SELECT`
- `contenteditable` 속성이 켜진 모든 요소
- `aria-haspopup` 또는 `role="combobox"`로 모달 위에 떠 있는 위젯 (방어적 처리)

→ 검색창에서 "javascript"를 칠 때 `j`/`k`/`/`가 카드 내비/포커스 이동을 트리거하지 않음.

`⌘K` / `Ctrl+K`는 **인풋 포커스 시에도 우선 처리**(modifier 키 조합이라 입력 충돌 없음).

### 4) 단축키 처리 위치

- `src/pages-v2/EventList/hooks.ts`의 `useEventListKeyboard`. 단일 `useEffect`로 `window.addEventListener('keydown', ...)` 등록 + cleanup.
- 라이브러리 미사용(SPEC § 9 / INVENTORY § 5와 일관 — `react-hotkeys`, `tinykeys` 등 도입 X).
- 카드/검색 인풋의 ref는 컨테이너(`EventList.tsx`)가 만들어 hook과 컴포넌트 양쪽에 동일 객체를 넘긴다.

### 5) 카드 포커스 표시 + 접근성

- **카드는 native focusable**: `<article tabIndex={0} role="link" aria-label={...}>`. Tab 키 자연 사이클에 들어감.
- 포커스 표시는 **`:focus-visible` CSS** — accent border + 2px ring(§ 2 EventCard의 focused 스타일과 동일 톤).
  - 마우스 클릭으로 들어온 포커스에는 ring을 안 띄우고(`:focus-visible` 표준 동작), `j`/`k`/`Tab`으로 들어온 포커스에만 띄움.
  - § 2의 `EventCard` props `focused` 는 본 섹션 결정에 따라 **DOM 포커스로 대체** → `focused` prop 제거. `innerRef`만 유지 (`useEventListKeyboard`가 `cardRefs` 통해 프로그래밍 포커스 호출). § 2 표는 다음 PR/리비전에서 정리.
- `Enter` / `Space`로 카드 활성화 시 native click 발생(role=link + tabIndex=0 + onKeyDown 처리). `onClick={onOpen}` 한 줄로 둘 다 커버 가능하나, 보수적으로 `onKeyDown` 분기에서 `Enter`/`Space` 명시 처리.
- `aria-keyshortcuts="/ j k Meta+K"` 를 `Hero`(또는 페이지 루트)에 표기 — 스크린 리더에 단축키 노출.
- `prefers-reduced-motion: reduce`면 `scrollIntoView`의 smooth 옵션 생략 (`block: 'nearest'`만 유지).

### 핵심 흐름 (코드 골격)

```ts
// src/pages-v2/EventList/hooks.ts
const isTypingTarget = (el: EventTarget | null) => {
  if (!(el instanceof HTMLElement)) return false;
  return ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName) || el.isContentEditable;
};

export function useEventListKeyboard(opts: {
  itemCount: number;
  cardRefs: React.MutableRefObject<(HTMLElement | null)[]>;
  searchInputRef: React.RefObject<HTMLInputElement>;
  onOpenPalette?: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        if (opts.onOpenPalette) { e.preventDefault(); opts.onOpenPalette(); }
        return;
      }
      if (isTypingTarget(e.target)) return;
      if (e.key === '/') { e.preventDefault(); opts.searchInputRef.current?.focus(); opts.searchInputRef.current?.select(); return; }
      if (e.key !== 'j' && e.key !== 'k') return;
      if (opts.itemCount === 0) return;
      e.preventDefault();
      const cards = opts.cardRefs.current;
      const cur = cards.findIndex(el => el === document.activeElement);
      const next = Math.max(0, Math.min(opts.itemCount - 1, cur < 0 ? 0 : cur + (e.key === 'j' ? 1 : -1)));
      cards[next]?.focus();
      cards[next]?.scrollIntoView({ block: 'nearest', behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [opts.itemCount, opts.onOpenPalette]);
}
```

`Esc`(검색 인풋 비우기 + blur)와 `Enter`(카드 → 라우터 push)는 위 글로벌 hook이 아니라 **각 컴포넌트의 `onKeyDown`** 으로 처리:

```tsx
// SearchAndFilters.tsx 의 검색 인풋
<input onKeyDown={e => { if (e.key === 'Escape') { onKeywordChange(''); e.currentTarget.blur(); } }} ... />

// EventCard.tsx
<article tabIndex={0} role="link" aria-label={`${event.title} — ${event.dateLabel}`}
  onClick={onOpen} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(); } }} ... />
```

## 8. 라우터 등록 방법

Phase 0의 `router-toggle.plan.md`에서 만들어 둔 `<VersionedRoute>` 헬퍼를 그대로 사용. 별 path 신설 없이 **기존 라우트 element만 교체**.

### 1) 대상 라우트

`src/App.tsx:89`에 이미 존재.

```tsx
// before
<Route path="/" element={<EventList />} />
```

- 경로: **`/`** (`/events` 아님). INVENTORY § 1·SPEC § 9 모두 "현재 `/`는 EventList"라고 명시. 별 path 신설 시 북마크/외부 링크/이미 받은 공유 URL이 깨지므로 그대로 유지.
- 위치: `<Route element={<Layout />}>` 내부 (`src/App.tsx:88`). Layout chrome(사이드바/탭/상태바)이 그대로 EventList v2 위에 입혀짐.
- 가드 없음 (공개 페이지). `RequireAuth` 등은 합성하지 않는다.

### 2) 변경 코드 (정확한 줄 단위)

`src/App.tsx`에 두 줄 추가 + 한 줄 교체.

```tsx
// (a) lazy import — LoginV2 인접 위치 (현재 src/App.tsx:22)
const LoginV2     = lazy(() => import('./pages-v2/Login'))
const EventListV2 = lazy(() => import('./pages-v2/EventList'))   // ← 추가

// (b) 라우트 element 교체 (현재 src/App.tsx:89)
- <Route path="/" element={<EventList />} />
+ <Route path="/" element={<VersionedRoute v1={<EventList />} v2={<EventListV2 />} />} />
```

- 기존 `import EventList from './pages/EventList'`(`src/App.tsx:11`)은 **유지** — eager import. v1 fallback 경로에서 즉시 렌더 가능해야 하므로 유지(첫 화면이라 chunk split 이득보다 LCP 손해가 큼).
- v2는 LoginV2와 동일 패턴으로 lazy import. 외곽 `<Suspense fallback={<Loading fullscreen />}>`(`src/App.tsx:76`)이 v2 chunk 로딩을 그대로 받아 처리.

### 3) `VersionedRoute` 동작 재확인

`docs/redesign/router-toggle.plan.md` § 3 시그니처 그대로:

| 토글 신호 | 동작 |
|---|---|
| `?v=2` | v2 렌더 + `localStorage['ui.version'] = '2'` 동기화 |
| `?v=1` | v1 렌더 + `localStorage['ui.version']` 키 제거 |
| 쿼리 없음 + localStorage `'2'` | v2 렌더 (sticky) |
| 쿼리 없음 + localStorage 없음 + `VITE_UI_DEFAULT_VERSION='2'` | v2 렌더 |
| 모두 없음 | v1 (`<EventList />`) |
| 토글 켜짐 + `v2` prop 없음 | 자동 v1 fallback (본 페이지엔 해당 없음) |

### 4) 검증 시나리오

PR 시점에 수동 QA로 모두 확인:

| # | 액션 | 기대 |
|---|---|---|
| 1 | `/?v=2` 직접 입력 | EventList v2 렌더 (Hero·Filter·Grid 새 톤) + localStorage `'2'` 기록 |
| 2 | (1) 후 `/cart`로 `<Link>` 이동 후 다시 `/`로 복귀 | 쿼리 없어도 EventList v2 유지 (localStorage sticky) |
| 3 | `/?v=1` 직접 입력 | EventList v1(현행) 렌더 + localStorage 키 제거 |
| 4 | (3) 후 새 탭에서 `/` 진입 | localStorage 비었으니 env 기본값 적용 (v1) |
| 5 | `VITE_UI_DEFAULT_VERSION=2` 빌드에서 `/` 진입 | 쿼리/스토리지 없어도 v2 |
| 6 | URL `/?v=2&q=react&cat=컨퍼런스&page=2` 공유 링크 | v2 렌더 + § 4 URL 복원 동시 동작 (검색어/카테고리/페이지 모두 반영) |
| 7 | v2 chunk 로딩 중 (느린 네트워크 시뮬) | `<Suspense fallback={<Loading fullscreen />}>` 표시되다가 v2로 교체 |
| 8 | 다크 테마 토글 + v2 | 토큰(SPEC § 8) 반영, v1과 톤 차이 명확 |

### 5) 영향 받지 않는 항목

- 다른 라우트(`/events/:id`, `/cart`, `/mypage`, seller·admin)는 손대지 않음. EventList v2가 EventDetail로 이동하는 링크는 기존 `/events/:id`(v1) 그대로 가리킴 — EventDetail PR이 들어오면 그때 같은 패턴으로 토글.
- `BrowserRouter` 마운트(`src/main.tsx:16`), 인증 가드 3종(`RequireAuth`/`RequireSeller`/`RequireAdmin`), `Layout` 트리, catch-all `*` 모두 변경 없음.

## 9. 의사결정 필요 지점

이 단계에서 **확정된 결정**과, 여전히 **열려 있는 결정**을 분리해서 기록한다. 확정된 항목은 § 1~§ 8의 본문이 따른다. 열린 항목은 PR 분할(§ 10) 시점에 다시 점검.

### 확정된 결정

| 항목 | 결정 | 출처 / 영향 섹션 |
|---|---|---|
| 페이지네이션 vs 무한스크롤 | **숫자 페이지네이션** 채택 | § 5 비교표, § 6 Pagination 분기 |
| 카테고리 선택 모드 | **단일 선택** (`'전체'` 포함). 현재 API도 `category?: string` 단일 | § 3 표 1, § 4 키 `cat` |
| 기술 스택 선택 모드 | **단일 토글** 유지. API는 `number[]` 다중 지원하지만 UI는 단일. 다중 도입 시 § 4의 콤마 join 규약 준비됨 | § 3 표 1, § 4 다중값 처리 |
| 정렬 옵션 추가 | **추가** — 최신순(기본) / 임박순(이벤트 일시 가까운 순) / 가격순(낮은→높은) | 본 § 9 (아래 "정렬 도입 후속 작업" 참고) |
| 빈 상태 추천 이벤트 노출 | **노출** — 필터 적용 + 0건 / 필터 없음 + 0건 두 케이스 모두 하단에 추천 섹션 추가 | § 6 빈 결과(아래 "추천 이벤트 후속 작업" 참고) |
| URL 동기화 시 디바운스 | **적용** — 검색어 300ms, URL은 `replace: true` push | § 4·§ 5 |
| `⌘K` 빠른 검색 팔레트 | **이번 PR 범위 안** (§ 7의 잠정 "범위 밖" 결정을 본 § 9에서 뒤집음) | 아래 "팔레트 PR 통합" 참고. § 7 코드 골격의 `onOpenPalette` 분기를 실제 핸들러로 연결 |
| API/DTO 변경 | **최소화** — 백엔드 변경 없이 어댑터로 흡수. 단 `location/host` 누락은 별도 옵션 필요 (아래 열린 항목) | SPEC § 9, § 3 표 2 |

### 후속 작업 — 확정 사항으로 인해 추가되는 일

#### 1) 정렬 도입 후속 작업

- URL 키 추가: `sort` (`'recent' | 'soon' | 'cheap'`, 기본 `'recent'` → URL에서 생략).
- 컴포넌트 추가: `components/SortSelect.tsx` (드롭다운 또는 segmented). § 1 디렉토리 / § 2 분해 표에 한 줄 추가 필요.
- API 파라미터: 현 `events.api.ts`의 `EventListRequest`/`EventSearchRequest`/`EventFilterRequest`에 `sort?: string` 없음 → **백엔드 변경 필요** (또는 클라이언트 정렬은 페이지 단위라 의미 약함). 백엔드 합의가 안 되면 1차 릴리스에선 정렬 UI 비활성 처리 + § 9 미해결로 강등.
- types.ts에 `EventListFilters.sort` 추가, adapters의 `toFilterRequest`에 매핑 추가.

#### 2) 추천 이벤트 후속 작업

- API: `recommendEvents`(`src/api/events.api.ts:103`, `GET /events/user/recommendations`) 사용. 비로그인은 빈 배열 또는 인기 이벤트 폴백 — 백엔드 동작 확인 필요.
- 컴포넌트 추가: `components/RecommendedEvents.tsx` — 가로 스크롤 또는 4개 카드 그리드. § 1/§ 2에 한 줄 추가.
- 위치: `EmptyStackTrace` 박스 아래 24px 간격으로 노출. 두 빈 케이스(필터 적용 / 필터 없음) 모두 동일 노출.
- 카드 표현: 본 페이지의 `EventCard` 재사용 (props 동일). 어댑터도 같은 `toEventVM`으로.
- fetch는 `useEvents`와 별 hook(`useRecommendedEvents`) — 빈 상태 진입 시점에 한 번 fetch + § 5 캐시 정책(LRU/stale) 준용.

#### 3) 팔레트 PR 통합

- § 7의 `onOpenPalette?: () => void`를 **선택적 → 필수**로 승격. `index.tsx`에서 항상 주입.
- 팔레트 컴포넌트는 EventList 디렉토리 외부(공통 chrome 또는 별 v2 디렉토리)에서 가져와 mount. 위치 합의는 Layout PR과 협의 필요.
- 본 PR에서 함께 들어가면 PR 분할(§ 10)에서 팔레트 단계가 EventList 본체보다 먼저 또는 동시 처리되어야 함. PR 순서 재정렬 필요.

### 열린 결정 (해결 필요)

| 항목 | 옵션 | 의견 / 권장 |
|---|---|---|
| **`location` / `host` 누락** (§ 3 표 2) | A: 백엔드가 `EventListResponse.content[*]`에 두 필드 추가 / B: 카드에서 라인 제거 / C: hover 시 lazy detail | 권장 **A** (UX 손실 0). 백엔드 합의 미달 시 1차 **B**로 출시 후 후속 PR에서 A로 전환. C는 N+1 위험으로 비추천. |
| **페이지 인덱싱 0/1-base** (§ 3 표 1, § 4) | API 응답 `page` / `totalPages`의 의미 확인 | 백엔드 코드 또는 실 응답 1건 확인 후 어댑터에서 정규화. 그 전까지 `Pagination`은 `page` 표시를 `+1`/그대로 양쪽 어느 쪽이든 한 줄 변경. |
| **기본 페이지 사이즈** (§ 3 표 1) | 12 / 24 / 36 | 권장 **24** (3행 × 8칸 안팎, 그리드 minmax 280px와 어울림). 합의 후 `EventListFilters` 기본값 고정. |
| **카테고리 카운트 산출** (§ 3 표 1) | A: 별 집계 API / B: 클라이언트(현재 페이지 기준) / C: 표시 안 함 | 현재 카운트 응답 없음. 권장 **C로 1차 출시** → 백엔드 집계 API가 생기면 A로 전환. B는 페이지 단위 분포라 오해 소지. |
| **0건 + 비로그인** | 추천을 어떻게 채울지 | `recommendEvents`가 비로그인에 어떤 응답을 주는지 백엔드 확인 후 결정. 인기 이벤트 폴백을 권장. |
| **디바운스 진행 인디케이터** (§ 6.5) | 표시 / 생략 | § 6 기본 "표시". 사용자 테스트에서 noise라는 피드백 나오면 생략으로 변경. |
| **다크모드 톤** | EventList 카드의 accent 채도 | SPEC § 8 토큰 통과 후 dark에서 accent가 너무 튀면 채도 한 단계 낮춘 alias 추가. 디자인 리뷰 후 확정. |
| **카드 썸네일 (`thumbnailUrl`)** (§ 3 표 2) | A: 항상 그라디언트 / B: thumbnailUrl 있으면 좌측 슬롯에 표시 | 권장 **A로 1차 출시** (디자인 톤 일관성). B는 디자인 시안 확정 후 후속. |
| **신규 이벤트 등록 → 캐시 stale 60s 동안 안 보임** (§ 5) | 60s 정책 유지 / 줄임 / refetch 트리거 추가 | 1차 60s 유지. 정확성 이슈 보고되면 30s로 단축 또는 라우트 진입 시 강제 refetch.|

### 의사결정 → 코드 영향 매핑 (요약)

| 결정 | 영향 파일 / 섹션 |
|---|---|
| 정렬 도입 | `types.ts`, `adapters.ts`, `hooks.ts`, `components/SortSelect.tsx` 신규, § 1·§ 2·§ 3·§ 4 갱신 |
| 추천 이벤트 노출 | `hooks.ts` (`useRecommendedEvents`), `components/RecommendedEvents.tsx` 신규, § 6 빈 결과 갱신 |
| 팔레트 범위 안 포함 | `index.tsx` (palette mount + onOpenPalette 주입), § 7·§ 10 갱신 |
| location/host A안 채택 시 | `adapters.ts` 매핑 복원, `EventCard` 메타 라인 3개 유지 |
| location/host B안 채택 시 | `adapters.ts` 메타 1줄(일시)만, § 2 `MetaLine` 사용 횟수 1회로 축소 |

## 10. PR 분할 + 파일 생성 순서

### 분할 원칙

- **각 PR 200~400 LOC 목표**. 시각이 큰 PR(특히 PR 3)은 ~500까지 허용.
- **PR 1에 라우터 등록 포함** (사용자 최초 제안과 차이 — 사유는 아래). PR 2~5는 사용자가 화면으로 진척을 검증할 수 있어야 하므로 PR 1 시점부터 `?v=2` 토글이 동작해야 함.
- **정렬(§ 9 정렬 도입 후속 작업) 은 후속 별 PR**로 분리. 백엔드의 `sort` 파라미터 합의가 선결조건이라 본 5개 PR 시퀀스에 포함시키면 차단 위험.
- **팔레트(§ 9 ⌘K)는 별 PR로 선행 또는 병행**. EventList 디렉토리 외부에 mount되는 chrome-level 기능이라 EventList PR 시퀀스에 묶이면 PR 5가 비대해짐. 본 §10에선 EventList 측 hook(`onOpenPalette` 결선)만 PR 5에 둔다.

### PR 0 (선결조건 — 본 페이지와 별)

| 항목 | 상태 |
|---|---|
| Phase 1 공용 컴포넌트 (Eyebrow, Chip, Kbd, StatusChip, Button, Skeleton, …) | SPEC § 0에서 선행 필수. 본 시퀀스 시작 전 머지되어 있어야 함. |
| `<VersionedRoute>` / `useUiVersion` | `src/router-v2/`에 이미 존재 (router-toggle.plan, LoginV2 사용 중). |
| Layout chrome v2 | EventList가 `<Route element={<Layout />}>` 안에 있으므로 v2 Layout 작업과 충돌 없는지 확인. 현 단계 v1 Layout 위에서도 동작해야 함. |

---

### PR 1 — 골격 + 데이터 레이어 + 라우터 등록

**목표**: `/?v=2`로 진입 가능한 빈 placeholder 페이지를 만들고, 데이터 레이어(types/adapters/hooks)를 완성. 화면은 비어 있지만 콘솔에 API 호출 1회가 찍히면 성공.

**파일 (생성 순서)**

| 순서 | 파일 | 신/수 | LOC | 내용 |
|---|---|---|---|---|
| 1 | `src/pages-v2/EventList/types.ts` | 신 | ~30 | `EventVM`, `EventListFilters`, `EventListPage`, `EventsQuery` (§ 5 상태 셰이프) |
| 2 | `src/pages-v2/EventList/adapters.ts` | 신 | ~90 | `toEventVM`, `toEventListPage`, `toFilterRequest`, `serializeFilters` (§ 3·§ 5) |
| 3 | `src/pages-v2/EventList/hooks.ts` | 신 | ~130 | `useEventListFilters` (§ 4), `useEvents` 기본 구조 + LRU 캐시 + `AbortController` (§ 5). 키보드/추천 hook은 후속 PR에서 추가. |
| 4 | `src/pages-v2/EventList/EventList.tsx` | 신 | ~30 | placeholder 컨테이너 — gutter/editor-body 스캐폴드 + `<div>EventList v2 — WIP</div>` |
| 5 | `src/pages-v2/EventList/index.tsx` | 신 | ~30 | URL → 필터 초기화, `useEvents` 결합, `EventList.tsx`에 props 주입 |
| 6 | `src/App.tsx` | 수 | +2 | `EventListV2 = lazy(() => import('./pages-v2/EventList'))` + `<Route path="/" element={<VersionedRoute v1={<EventList />} v2={<EventListV2 />} />} />` (§ 8) |

**의존**: PR 0 (공용 컴포넌트는 거의 미사용 — placeholder라 직접 의존 적음).
**LOC 합계**: ~310.
**검증**: `/?v=2` 진입 → 빈 placeholder 표시 + Network 탭에 `GET /events` 1회 + 응답 정상이면 콘솔에 변환된 `EventVM[]` 길이 로그(개발 빌드 한정).
**커밋 메시지**: `feat(events-v2): scaffold EventList route + data layer`

---

### PR 2 — Hero + SearchAndFilters (URL 동기화 시각화)

**목표**: 헤더와 필터 영역이 노출되고, chip / 검색어 토글이 URL을 바꾸는 것을 화면으로 확인.

**파일 (생성 순서)**

| 순서 | 파일 | 신/수 | LOC | 내용 |
|---|---|---|---|---|
| 1 | `src/pages-v2/EventList/components/Hero.tsx` | 신 | ~60 | eyebrow + h1 + 서브카피 + kbd 힌트 (§ 2) |
| 2 | `src/pages-v2/EventList/components/SearchAndFilters.tsx` | 신 | ~140 | 검색 인풋(controlled, ref) + 카테고리/스택 chip row. 카테고리·스택 리스트는 정적 상수. |
| 3 | `src/pages-v2/EventList/EventList.tsx` | 수 | +30 | placeholder 제거, Hero/SearchAndFilters mount, props wiring |
| 4 | `src/pages-v2/EventList/hooks.ts` | 수 | +30 | 검색어 디바운스 effect (§ 4·§ 5의 300ms) 추가 |

**의존**: PR 1.
**LOC 합계**: ~260.
**검증**:
- `/?v=2` 진입 → Hero 노출.
- 카테고리 chip 클릭 → URL `?cat=컨퍼런스` 추가 + Network에 새 요청.
- 검색어 입력 → 300ms 후 URL `?q=react` 추가, 한 글자씩 history 안 쌓임.
- 뒤로가기 → 직전 URL 상태 + 카드 자리는 비어 있어도 hook 호출은 정상.
- 다크 토글 시 토큰 적용 확인.

**커밋 메시지**: `feat(events-v2): add Hero and SearchAndFilters with URL sync`

---

### PR 3 — EventCard 그리드 + 상태 (loading/empty/error)

**목표**: 실제 카드 데이터가 그리드에 깔리고, loading/empty/error UI 분기가 작동.

**파일 (생성 순서)**

| 순서 | 파일 | 신/수 | LOC | 내용 |
|---|---|---|---|---|
| 1 | `src/pages-v2/EventList/components/MetaLine.tsx` | 신 | ~20 | (§ 2) — EventCard에서 import할 작은 row |
| 2 | `src/pages-v2/EventList/components/EventCard.tsx` | 신 | ~170 | accent bar + chrome 헤더 + 본문 + 푸터, hover/focus, native focusable. § 9 결정 따라 location/host 라인은 일단 빼고 일시만(B안). |
| 3 | `src/pages-v2/EventList/components/ResultHeader.tsx` | 신 | ~25 | "이벤트 N개 / 전체 M개 중" |
| 4 | `src/pages-v2/EventList/components/EventCardSkeleton.tsx` | 신 | ~55 | pulse 애니메이션 placeholder (§ 6.1) |
| 5 | `src/pages-v2/EventList/components/EmptyStackTrace.tsx` | 신 | ~50 | `hasActiveFilters` 분기 (§ 6.3) |
| 6 | `src/pages-v2/EventList/components/ErrorState.tsx` | 신 | ~45 | 재시도 버튼 (§ 6.2) |
| 7 | `src/pages-v2/EventList/EventList.tsx` | 수 | +60 | 그리드 mount + 상태 분기 (§ 6 매트릭스) |

**의존**: PR 2.
**LOC 합계**: ~425. (5개 PR 중 가장 큼 — 상태 분기 시각이 한 PR에 모이는 게 리뷰 효율적.)
**검증**:
- 정상 응답: 카드 N개 그리드. 데스크탑/모바일 폭에서 1100px 컨테이너 안 minmax(280px, 1fr) 정상 작동.
- 빈 결과: 검색어 `xxxxxxx` → `EmptyStackTrace` "검색 결과 없음" + 필터 초기화 버튼 → 클릭 시 모든 필터 리셋.
- 네트워크 에러: 개발자 도구 offline → `ErrorState` + 재시도 → 복구.
- 로딩: 새 필터 토글 시 직전 데이터 유지 + 상단 progress bar.
- 초기 로딩(첫 진입 캐시 X): skeleton 8개 표시.
- 다크 모드, 호버, 키보드 Tab 진입 시 `:focus-visible` outline 표시.

**커밋 메시지**: `feat(events-v2): add EventCard grid and loading/empty/error states`

---

### PR 4 — 페이지네이션 + 빈 상태 추천

**목표**: 페이지 이동이 가능해지고(§ 5/§ 6.4), 빈 결과 화면 아래 추천 이벤트가 노출(§ 9).

**파일 (생성 순서)**

| 순서 | 파일 | 신/수 | LOC | 내용 |
|---|---|---|---|---|
| 1 | `src/pages-v2/EventList/components/Pagination.tsx` | 신 | ~85 | 윈도우 5칸 + 화살표, `totalPages <= 1` 시 미렌더 (§ 6.4) |
| 2 | `src/pages-v2/EventList/hooks.ts` | 수 | +50 | `useRecommendedEvents` 추가 — `recommendEvents`(`src/api/events.api.ts:103`) 호출, 빈 상태 진입 시점에 lazy fetch + 캐시 |
| 3 | `src/pages-v2/EventList/components/RecommendedEvents.tsx` | 신 | ~50 | EventCard 재사용, 4개 가로 그리드. 비로그인 폴백은 § 9 열린 결정 따라 빈 배열 허용. |
| 4 | `src/pages-v2/EventList/EventList.tsx` | 수 | +25 | Pagination mount, EmptyStackTrace 아래 RecommendedEvents 노출, 페이지 변경 시 상단 스크롤 |

**의존**: PR 3.
**LOC 합계**: ~210.
**검증**:
- 마지막 카드 아래 페이지네이션 노출. 클릭 → URL `?page=2` push, 그리드 상단 스크롤, 직전 데이터 dim 후 새 데이터.
- 첫 페이지 `‹` disabled, 마지막 페이지 `›` disabled.
- `totalPages <= 1`인 검색 결과에선 페이지네이션 자체 미노출.
- 의도적 빈 결과 → `EmptyStackTrace` 아래 추천 4장 노출. 추천 카드 클릭 → 상세로 이동.
- 비로그인 상태에서 빈 결과 → 추천 fetch 동작 확인 (백엔드 응답 형태 따라 § 9에 결과 기록).

**커밋 메시지**: `feat(events-v2): wire pagination and empty-state recommendations`

---

### PR 5 — 키보드 인터랙션 + a11y 마무리

**목표**: `/`, `j`, `k`, `Enter`, `Esc`가 동작하고, 카드 Tab 사이클 + ARIA 속성이 정리. 팔레트(`⌘K`)는 별 PR이 머지되어 있다는 전제하에 결선만.

**파일 (생성 순서)**

| 순서 | 파일 | 신/수 | LOC | 내용 |
|---|---|---|---|---|
| 1 | `src/pages-v2/EventList/hooks.ts` | 수 | +70 | `useEventListKeyboard` (§ 7 핵심 흐름) — `onOpenPalette?` 옵션 |
| 2 | `src/pages-v2/EventList/components/EventCard.tsx` | 수 | +15 | `tabIndex={0}` + `role="link"` + `aria-label` + `Enter`/`Space` 핸들러 |
| 3 | `src/pages-v2/EventList/components/SearchAndFilters.tsx` | 수 | +10 | 인풋에 `Esc` → 비우기/blur 핸들러 |
| 4 | `src/pages-v2/EventList/EventList.tsx` | 수 | +15 | hook mount + `searchInputRef`/`cardRefs` 결선, `aria-keyshortcuts` |
| 5 | `src/pages-v2/EventList/index.tsx` | 수 | +5 | 팔레트 PR이 머지된 경우 `onOpenPalette={openPalette}` 주입, 아니면 미주입(§ 9) |
| 6 | a11y 점검 패스 | — | — | axe-core devtools 또는 수동 검토. role/aria 누락만 수정. |

**의존**: PR 4. 팔레트 PR(별 시퀀스)이 머지되어 있으면 onOpenPalette 결선까지, 아니면 hook만 도입.
**LOC 합계**: ~115.
**검증**:
- `/` 누름 → 검색 인풋 포커스 + 텍스트 select.
- 검색 인풋 안에서 `j`/`k` → 그대로 입력됨(패스스루).
- `Tab` → 검색 → category chip → stack chip → 첫 카드 → 페이지네이션 순.
- `j`/`k` → 카드 포커스 이동, 마지막 카드에서 `j` 추가는 그대로 유지.
- `Enter`(카드 포커스) → 상세 페이지로 이동.
- `Esc`(검색 인풋 포커스) → 인풋 비움 + blur.
- `prefers-reduced-motion` 시 `scrollIntoView` smooth 제거.
- 스크린 리더(VoiceOver/NVDA): 카드 aria-label 읽힘, `aria-keyshortcuts` 안내됨.

**커밋 메시지**: `feat(events-v2): add keyboard navigation and a11y polish`

---

### 후속 PR (본 5개 시퀀스 밖)

| PR | 트리거 | 내용 |
|---|---|---|
| **EventList +sort** | 백엔드 `sort` 파라미터 합의 완료 | `components/SortSelect.tsx` 신규, `types.ts`/`adapters.ts`/URL 키 추가, hook에 sort 반영 |
| **EventList location/host A안** | 백엔드 `EventListResponse.content[*]`에 두 필드 추가 | `adapters.ts` 매핑 복원, `EventCard` 메타 라인 3개로 복원 |
| **EventList 카테고리 카운트 A안** | 카운트 집계 API 추가 | `useCategoryCounts` hook + `SearchAndFilters` chip 라벨에 숫자 |
| **EventList 무한스크롤 전환** | 사용자 피드백 / 디자인 변경 | `Pagination.tsx` → `InfiniteScrollSentinel.tsx` 교체, 컨테이너만 변경 |
| **빠른 검색 팔레트** | EventList와 별 시퀀스 (Layout PR과 협의) | 팔레트 컴포넌트 + 글로벌 mount. EventList PR 5의 `onOpenPalette` 슬롯이 채워짐. |

### 머지 순서 그래프

```
[PR 0: 공용 컴포넌트, VersionedRoute] ───┐
                                         ▼
                        [PR 1: 골격 + 데이터 레이어 + 라우터 등록]
                                         │
                                         ▼
                        [PR 2: Hero + SearchAndFilters]
                                         │
                                         ▼
                        [PR 3: EventCard + 그리드 + 상태]
                                         │
                                         ▼
                        [PR 4: 페이지네이션 + 빈 상태 추천]
                                         │
                                         ▼
                        [PR 5: 키보드 + a11y 마무리]
                                         │
              ┌──────────────────────────┼──────────────────────────┐
              ▼                          ▼                          ▼
   [후속: 정렬]              [후속: location/host A]      [후속: 카테고리 카운트]
   (백엔드 합의 후)          (백엔드 응답 확장 후)        (집계 API 추가 후)

          [별 시퀀스: 빠른 검색 팔레트] ─→ (EventList PR 5와 병행 또는 직전, 결선만 PR 5에서)
```

- PR 1~5는 **순차 의존** (각 PR이 직전 PR의 골격/wiring을 전제).
- 후속 PR들은 PR 5 머지 후 순서 무관하게 **독립적**으로 들어갈 수 있음.
- 팔레트는 EventList 외부 작업이라 시퀀스 밖에서 관리. 결선(`onOpenPalette`)만 PR 5에 한 줄.
