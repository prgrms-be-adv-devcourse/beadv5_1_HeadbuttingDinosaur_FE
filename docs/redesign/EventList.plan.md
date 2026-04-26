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
(작성 예정)

## 7. 키보드 인터랙션
(작성 예정)

## 8. 라우터 등록 방법
(작성 예정)

## 9. 의사결정 필요 지점
(작성 예정)

## 10. PR 분할 + 파일 생성 순서
(작성 예정)
