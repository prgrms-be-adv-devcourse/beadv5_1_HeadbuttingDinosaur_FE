# Landing 페이지 v2 계획

Landing 은 5개 섹션 (Hero / Stats / Categories / Featured / CTA) +
TypedTerminal 별도 컴포넌트로 구성. 가장 큰 페이지.

## 1. 페이지 디렉토리 구조

SPEC.md § 0의 표준 디렉토리 구조를 따르되, Landing은 5개 섹션으로 분해되는
가장 큰 페이지이므로 `sections/`와 `components/`를 분리한다.

```
src/pages-v2/Landing/
├── index.tsx              ← 라우트 진입점. 데이터 훅 호출 + Landing.tsx에 주입
├── Landing.tsx            ← 페이지 컨테이너. 5개 섹션을 세로로 조합 (프레젠테이션)
├── sections/
│   ├── HeroSection.tsx        ← 좌측 카피 + 우측 TypedTerminal 슬롯
│   ├── StatsSection.tsx       ← 4-column 통계 카드
│   ├── CategoriesSection.tsx  ← 6-column 카테고리 타일 그리드
│   ├── FeaturedSection.tsx    ← Featured 5 rows
│   └── CtaSection.tsx         ← dashed border CTA 카드
├── components/
│   ├── TypedTerminal.tsx      ← Hero 우측 타이핑 애니메이션 (별도 PR로 선행)
│   ├── Stat.tsx               ← Stats 카드 1개 (mono hint + 30px 숫자)
│   ├── CategoryTile.tsx       ← 카테고리 타일 1개 (34×34 아이콘 + 이름 + 카운트)
│   ├── FeaturedRow.tsx        ← Featured 행 1개 (순번/그라디언트/정보/가격)
│   └── SectionHead.tsx        ← "// hint" + h2 + caption + action 슬롯 (page-local)
│                                — 다른 페이지에서도 쓸 가능성이 보이면 PR 4 정리
│                                  단계에서 components-v2/로 승격 검토
├── adapters.ts            ← API 응답 → Landing VM 변환 (Stats / Categories / Featured)
├── hooks.ts               ← useLandingStats / useLandingCategories / useFeaturedEvents
└── types.ts               ← Landing 전용 VM (StatVM, CategoryTileVM, FeaturedItemVM 등)
```

### EventList 자산 공유 검토

Featured 섹션은 `EventList`의 카드와 같은 도메인(이벤트) 데이터 형태를 갖는다.
중복 정의를 막고 일관성을 유지하기 위해 다음 자산을 재사용한다.

| 자산 | 위치 | Landing에서의 용도 |
|---|---|---|
| `EventVM` 타입 | `src/pages-v2/EventList/types.ts` | Featured 행의 base VM. Landing은 `FeaturedItemVM = Pick<EventVM, ...> & { rank: number }` 식으로 확장 |
| `toEventVM` 어댑터 | `src/pages-v2/EventList/adapters.ts` | `getEvents` 응답 → Featured 변환에 그대로 호출 |
| `toStatus` / `toDateTimeLabels` / `isFree` / `isLowStock` | `src/pages-v2/_shared/eventFormat.ts` | Featured 행 메타(일시·매진 등)와 Stats 합산 시 재사용 |

### 공유 시 의사결정

1. **`EventVM`을 그대로 import vs Landing 자체 VM으로 좁히기**
   기본은 그대로 import. Featured 행은 thumbnailUrl/techStacks 같은 일부 필드만
   쓰므로, 컴포넌트 props 단계에서 `Pick`으로 필요한 필드만 노출.
2. **`EventVM` / `toEventVM` 위치 승격 시점**
   Landing 외 다른 페이지(EventDetail의 추천 리스트 등)에서도 쓰게 되면
   `src/pages-v2/_shared/event.ts`로 옮기는 것을 cutover 직전에 검토.
   현 단계에서는 EventList 모듈에서 직접 import (cross-page import 1건 허용).
3. **Landing 고유 VM은 Landing/types.ts에만**
   `StatVM`, `CategoryTileVM`, `FeaturedItemVM`, `LandingData` 합성 타입 등은
   다른 페이지에서 쓸 일이 없으므로 Landing 디렉토리 안에서만 정의.


## 2. 섹션 컴포넌트 분해 (5개 섹션)

`prototype/Landing.jsx` 마크업을 기준으로 분해. 프로토타입의 인라인
`style={{}}` 객체는 채택하지 않으며 (SPEC § 0), 마크업/UX만 가져온다.
각 컴포넌트의 props는 VM 형태로 받고 API 응답은 모른다.

### Hero
| 이름 | 역할 | 위치 | props |
|---|---|---|---|
| `HeroSection` | 좌·우 2-column 컨테이너. grid `minmax(0,1fr) minmax(0,1fr)`, gap 36 | `sections/HeroSection.tsx` | `{ onBrowseEvents: () => void; onOpenPalette: () => void }` |
| `HeroLeft` | eyebrow pill + h1 44px + 서브카피 + CTA 2개 + mono 메타 코멘트 | `sections/HeroSection.tsx` 내부 (필요 시 분리) | `{ onBrowseEvents: () => void; onOpenPalette: () => void }` |
| `HeroRight` | `TypedTerminal` 슬롯만 가진 우측 컬럼 | `sections/HeroSection.tsx` 내부 | `{}` — TypedTerminal은 자체 상태 관리 (§ 3) |

CTA 두 개:
- "이벤트 둘러보기" → `onBrowseEvents` (`/events` 라우팅, § 7)
- "빠른 검색 ⌘K" → `onOpenPalette` (Layout chrome의 팔레트 호출, § 7)

### Stats
| 이름 | 역할 | 위치 | props |
|---|---|---|---|
| `StatsSection` | 4-column 그리드 컨테이너. `repeat(4, 1fr)`, gap 12 | `sections/StatsSection.tsx` | `{ stats: StatVM[] }` |
| `Stat` | 카드 1개. mono hint + 숫자 + 단위 + 라벨 | `components/Stat.tsx` | `{ hint: string; num: string \| number; unit: string; label: string }` |

`StatVM`은 `types.ts`에 정의. 4개 항목 고정(events.length / openEvents /
totalTickets / hosts). hosts는 프로토타입에서 하드코딩 `24+` — § 4에서
실제 데이터 소스 결정.

### Categories
| 이름 | 역할 | 위치 | props |
|---|---|---|---|
| `CategoriesSection` | SectionHead + 6-column 타일 그리드 | `sections/CategoriesSection.tsx` | `{ categories: CategoryTileVM[]; onSelect: (cat: string) => void }` |
| `CategoryTile` | 버튼 타일. 34×34 약자 아이콘 + 카테고리명 + `N개 이벤트` | `components/CategoryTile.tsx` | `{ cat: string; count: number; icon: string; color: string; onClick: () => void }` |

`color`는 SPEC § 0의 accent 팔레트에서 카테고리별 고정 매핑
(컨퍼런스=indigo / 밋업=sky / 해커톤=emerald / 스터디=amber / 세미나=violet / 워크샵=pink).
hover 시 borderColor를 `color`로, translateY -2 — CSS module 또는 globals
에서 처리하고 동적 색상만 인라인 변수로 전달.

### Featured
| 이름 | 역할 | 위치 | props |
|---|---|---|---|
| `FeaturedSection` | SectionHead("이번 주 주목할 이벤트", action="전체 보기") + 행 그룹 stack | `sections/FeaturedSection.tsx` | `{ items: FeaturedItemVM[]; onSelect: (eventId: string) => void; onSeeAll: () => void }` |
| `FeaturedRow` | 행 1개. grid `36px 56px 1fr auto` (순번/그라디언트 박스/정보/가격) | `components/FeaturedRow.tsx` | `{ ev: FeaturedItemVM; idx: number; onClick: () => void }` |

`FeaturedItemVM`은 EventList의 `EventVM`을 `Pick`한 좁은 형태(§ 1):
`Pick<EventVM, 'eventId' \| 'title' \| 'category' \| 'price' \| 'remainingQuantity' \| 'status' \| 'eventDateTime' \| 'techStacks' \| 'isFree' \| 'dateLabel'>`.
순번은 props `idx`로 받아 `String(idx+1).padStart(2,'0')` 표기.
accent 색상은 `eventId` 기반 회전(prototype `accent()` 매핑) — 공용 유틸로 옮길지 § 11에서 결정.

### CTA
| 이름 | 역할 | 위치 | props |
|---|---|---|---|
| `CtaSection` | dashed border + brand-light 그라디언트 카드. 좌측 헤드라인/서브카피, 우측 primary lg 버튼 | `sections/CtaSection.tsx` | `{ onStart: () => void }` |

내부 텍스트("// get started", "지금 바로 다음 컨퍼런스를 예약하세요" 등)는
일단 컴포넌트에 하드코딩. 다국어/원격 카피 도입 시 props로 승격.

### 공통: SectionHead

**이미 존재**: `src/components-v2/SectionHead/SectionHead.tsx`.
시그니처: `{ title: string; hint?: string; caption?: string; action?: ReactNode; className?: string }` (forwardRef).
Phase 0 공용 컴포넌트로 확정 — Landing은 이를 그대로 import해서 쓰고,
§ 1의 `components/SectionHead.tsx` 항목은 작성하지 않는다(중복 회피).
스타일은 `globals.css`의 `.section-head*` 클래스를 사용.


## 3. TypedTerminal 별도 분석

Hero 우측에 들어가는 터미널 타이핑 애니메이션. Landing 의존성 중 가장
큰 한 덩어리이므로 PR 1으로 분리(§ 12.1). EventList plan 의 ⌘K 팔레트
별도 처리 패턴과 동일.

### 프로토타입 핵심 로직 (`prototype/Landing.jsx` L6–L75)

1. **라인 큐**: `cmd / out` 페어 배열. 프로토타입은 2줄 하드코딩.
2. **타이핑**: 현재 라인의 `cmd` 를 `38ms` 간격으로 한 글자씩 `typed`에 누적.
3. **출력 노출**: `cmd` 완료 후 `320ms` 지연 → `showOut = true` 로 출력 표시.
4. **다음 라인**: 출력 표시 후 `1600ms` → `shown++`, `typed=''`, `showOut=false`.
5. **루프**: `shown >= lines.length` 가 되면 `2200ms` 후 `shown=0` 으로 리셋.
6. **커서**: 인라인 `<span>` + `@keyframes blink { 50% { opacity: 0 } }`,
   `1s steps(2, end) infinite` 적용.
7. **상태 관리**: `useState` 3개 (`shown`, `typed`, `showOut`) + `useEffect` 2개
   (전이 트리거 / 루프 리셋). `setTimeout` 의 cleanup 으로 unmount/이전 효과 정리.

### 재구현 방식 비교

| 방식 | 장점 | 단점 |
|---|---|---|
| `useState + useEffect` (프로토타입과 동일) | 프로토타입 1:1, 의존성 0, 검토 쉬움 | 상태 3개가 흩어져 race 발생 시 디버깅 까다로움 |
| `useReducer` 로 상태 일원화 | 전이가 단일 reducer 안에 보여 검증 쉬움. 테스트도 reducer 단위로 가능 | 약간의 보일러플레이트 |
| `typed.js` / `react-typed` 라이브러리 | 코드 짧음, 옵션 풍부 | 의존성 추가 (SPEC § 9 "추가 라이브러리 미도입 확정"에 위배) — **채택 불가** |

**결정 (§ 11에서 최종 확정)**: `useReducer` 권장. 액션은
`tick`(글자 1개 전진) / `revealOutput` / `nextLine` / `restart` 정도.
프로토타입과 동작은 동일하되 race / 정리 안정성을 높이고 테스트 가능성
확보. 부담스러우면 fallback 으로 `useState + useEffect` 채택.

### 라인 데이터 (프로토타입)

```ts
const DEFAULT_LINES: TerminalLine[] = [
  { prompt: '~', cmd: 'devticket search --stack=react --near=seoul', out: '→ 12개의 이벤트를 찾았어요' },
  { prompt: '~', cmd: 'devticket book "React Korea 18차 밋업"',       out: '✓ 티켓 1매가 발급되었습니다' },
];
```

### 데이터 소스 (하드코딩 vs 동적)

| 옵션 | 내용 | 비고 |
|---|---|---|
| A. 하드코딩 (default) | 프로토타입 그대로 2줄 고정 | PR 1 범위, 가장 빠름 |
| B. 동적 — 검색 결과 수 | `getEvents({ category: 'react', ... })` 의 `total`을 `out` 에 주입 | API 호출 1번 추가, Landing 트래픽에 캐시 필수 |
| C. 동적 — 실제 티켓 발급 카운트 | 운영 통계 엔드포인트 필요 — 현재 부재 | 백엔드 추가 필요, 범위 밖 |

**결정 (§ 11)**: PR 1은 **A 하드코딩**으로 시작. props 로 `lines`를 받게
설계해두면 추후 동적 주입(B)으로 갈아끼우기 쉬움.

### 성능 / 접근성

- **`prefers-reduced-motion: reduce`**: 즉시 모든 라인의 `cmd` + `out` 을
  완성 상태로 표시하고 애니메이션 / 커서 깜빡임 정지. `matchMedia` 로 감지.
- **Page Visibility**: `document.visibilityState === 'hidden'` 일 때 타이머
  pause, `visible` 복귀 시 resume. 백그라운드 탭에서 setTimeout 누적 방지.
- **`aria-live`**: 터미널 출력은 장식적이므로 `aria-hidden="true"` 권장.
  스크린리더 사용자에게는 정적 요약 텍스트(`<p className="sr-only">...</p>`)로
  대체 — Hero 카피와 중복 안 되게 짧게.
- **CLS / 레이아웃 점프**: `min-height` 고정(프로토타입 `minHeight: 150`).
  글자 수 변동에도 컨테이너 높이 안정.
- **메모리**: cleanup 누수 방지. `useEffect` 안의 모든 `setTimeout` 은
  반환 함수에서 `clearTimeout`. unmount 시 reducer 상태 reset 불필요(언마운트).

### Props 설계

```ts
export interface TerminalLine {
  prompt: string;          // 보통 '~'
  cmd: string;             // 타이핑 대상
  out: string;             // 완료 후 표시되는 출력
}

export interface TypedTerminalProps {
  lines?: TerminalLine[];          // 기본값 = DEFAULT_LINES
  typingSpeedMs?: number;          // default 38
  outputDelayMs?: number;          // default 320
  nextLineDelayMs?: number;        // default 1600
  restartDelayMs?: number;         // default 2200
  loop?: boolean;                  // default true
  className?: string;
  ariaLabel?: string;              // sr-only 요약 텍스트
}
```

### 파일 위치

`src/pages-v2/Landing/components/TypedTerminal.tsx` (Landing 전용).
다른 페이지에서 쓸 일이 없을 가능성이 높아 `components-v2/` 승격은
보류. 만약 EventList Hero 등에서 재사용 요청이 들어오면 그때 이동.

### 분리 근거

- 가장 큰 단일 컴포넌트(애니메이션 + 타이머 + a11y + 옵션).
- 시각적 회귀 / a11y 검증을 별도 PR로 격리해야 리뷰 효율 좋음.
- Hero 의 다른 부분(카피·CTA)과 의존이 없어 병합 순서 자유로움.
- PR 1 머지 후 PR 2(Hero + Stats)에서 슬롯에 끼워넣기만 하면 됨.


## 4. API 매핑 + 데이터 소스

INVENTORY § 2 기준. 현행 `events.api.ts` 기준으로 사용 가능한 함수 시그니처:

- `getEvents(params?: { page?: number; size?: number })` — **필터 파라미터 없음**.
- `searchEvents({ keyword, page, size })` — 키워드 검색.
- `filterEvents({ category, techStacks, page, size })` — 카테고리/스택 필터.
- `recommendEvents()` — 추천 (현재 Cart에서 사용 중).
- `getEventRecommendations` (`ai.api.ts`) — 페이지에서 미사용 모듈.
- 카테고리/호스트/통계 전용 API는 **현재 부재** (INVENTORY §2 비고).

### 표 1 — Stats 데이터 (4 카드)

| 표시 항목 | 출처 (현실적 옵션) | 비고 |
|---|---|---|
| 진행 중인 이벤트 (`events.length`) | `getEvents({ page: 0, size: 1 })` 의 `totalElements` | 페이지당 size 최소화로 본문은 버리고 카운트만 사용 |
| 판매중인 티켓 (`status=ON_SALE`) | ⚠️ 백엔드 미지원 → A) `getEvents` 결과를 클라에서 `status==='ON_SALE'`로 필터한 길이, B) 백엔드에 `status` 쿼리 추가 요청, C) 영업적 정확성보다 시각적 의미가 크므로 A로 시작 | `EventItem.status: string` (`src/api/types.ts:140`). 클라 집계 시 페이지 1장만 받는 한계로 정확한 총 ON_SALE 수가 아님 — § 11 결정 |
| 전체 잔여 좌석 (`sum(remainingQuantity)`) | ⚠️ 백엔드 미지원 → A) `getEvents` 모든 페이지 합산 (요청 폭증), B) **백엔드에 `/events/stats` 추가 요청 권장**, C) 시각적 카드이므로 첫 페이지만 합산 + "+" 표기 | 정확성과 비용의 트레이드오프 — § 11 결정 |
| 참여 커뮤니티 (`24+ 팀`) | ⚠️ 백엔드 미지원 → A) **하드코딩 유지** (프로토타입과 동일), B) 백엔드에 `/api/hosts/count` 추가 요청 | 프로토타입 기본값. v1 출시 동안 A 권장 |

**권장 v1 라인업**: 1번 카드만 실제 API의 `totalElements`, 2·3번 카드는
첫 페이지 `getEvents` 응답을 클라 집계, 4번은 하드코딩. 백엔드 통계
엔드포인트가 추가되면 § 5 의 `useLandingStats` 만 갈아끼움.

### 표 2 — Categories 카운트 (6 타일)

| 카테고리 | 출처 (현실적 옵션) | 비고 |
|---|---|---|
| 컨퍼런스 / 밋업 / 해커톤 / 스터디 / 세미나 / 워크샵 | ⚠️ 백엔드 미지원 (`/api/categories?withCounts=true` **미존재**) → A) 클라에서 카테고리별 `filterEvents({ category, page:0, size:1 })` 6번 호출 후 `totalElements` 사용, B) `getEvents` 한 번 받아 클라 집계(첫 페이지 한정 정확성), C) 백엔드에 `categories?withCounts=true` 추가 요청 | A는 6 RTT, B는 정확성 손실, C가 정답이지만 v1 범위 밖 가능. § 11 에서 최종 결정. v1은 A 권장 (병렬 `Promise.all`) |

카테고리 6종은 프로토타입과 SPEC § 6 에서 고정 — 마스터 목록은 Landing
의 `types.ts` 에서 상수로 보유.

### 표 3 — Featured 5 rows

| 출처 | 비고 |
|---|---|
| `GET /api/events?featured=true&limit=5` (SPEC § 6 가정) | ⚠️ 백엔드 미지원 — `EventListRequest` 에 `featured` 필드 **부재** (`src/api/types.ts:128`) |
| `GET /api/events?status=ON_SALE&sort=closingSoon&limit=5` | ⚠️ 백엔드 미지원 — `getEvents` 가 `sort`/`status` 받지 않음. 정렬은 백엔드 기본 정렬에 의존 |
| **EventList 와 같은 API** (`getEvents({ page:0, size:5 })`) + 클라에서 `status==='ON_SALE'` 필터 | ✅ **v1 채택**. 첫 페이지가 모두 `SOLD_OUT` 인 극단 케이스만 빈 섹션 |
| 대안: `recommendEvents()` (events.api) | 로그인/추천 컨텍스트가 필요해 비로그인 첫 화면(Landing)에는 부적합. § 11 에서 보류 |

**v1 결정**: `getEvents({ page:0, size:10 })` 호출 → 클라에서
`status==='ON_SALE'` 필터 → 앞 5개. 백엔드에 `featured` 또는 정렬
파라미터가 추가되면 어댑터 한 곳만 수정.

### 표 4 — 어댑터 매트릭스

| 어댑터 | 입력 | 출력 | 위치 | 공유 여부 |
|---|---|---|---|---|
| `toEventVM` | `EventItem` (`src/api/types.ts:132`) | `EventVM` | `src/pages-v2/EventList/adapters.ts` (기존) | **EventList 와 공유** (§ 1). Landing은 import |
| `toFeaturedItemVM` | `EventVM` | `FeaturedItemVM` (= `Pick<EventVM, …> & { rank }`) | `src/pages-v2/Landing/adapters.ts` | Landing 전용 |
| `toStatsVM` | `{ events: EventListResponse; openOnly?: EventItem[] }` | `StatVM[]` (4개 고정) | `src/pages-v2/Landing/adapters.ts` | Landing 전용 |
| `toCategoryCountVM` | `Array<{ category: string; totalElements: number }>` | `CategoryTileVM[]` | `src/pages-v2/Landing/adapters.ts` | Landing 전용 |
| `_shared/eventFormat.ts` (`toStatus` / `toDateTimeLabels` / `isFree` / `isLowStock`) | — | — | `src/pages-v2/_shared/eventFormat.ts` (기존) | 재사용 |

`toEventVM` 위치는 § 1 결정대로 EventList 모듈에서 직접 import (cross-page
import 1건 허용). 다른 페이지에서도 호출하기 시작하면 `_shared/event.ts`
승격 검토 — cutover 직전.

### 표 5 — 에러 처리

| HTTP / 상황 | 처리 |
|---|---|
| 401 | apiClient 인터셉터가 자동 재발급(SPEC § 0 부수). Landing 코드에 분기 작성 금지 |
| 4xx (그 외) | 섹션별 에러 박스 표시. 다른 섹션은 정상 렌더 (Promise.allSettled 기반 — § 5) |
| 5xx | 섹션별 에러 박스 + "다시 시도" 버튼. Landing 전체를 죽이지 않음 |
| 네트워크 끊김 | 섹션별 재시도 버튼. 4번 카드(하드코딩)는 영향 없음 |
| 빈 결과 (Featured 0건) | "곧 새로운 이벤트가 등록될 예정입니다" 안내 + EventList 링크 |
| 빈 결과 (Categories all 0) | 타일은 그대로 노출하되 카운트 자리에 `—` 표시 |

각 섹션은 데이터 로드를 **독립적으로** 다룬다. Hero / CTA 는 정적이고
TypedTerminal 은 자체 동작이라 API 의존 없음. Stats / Categories /
Featured 만 로딩·에러·빈 상태 분기.

### ⚠️ 백엔드 지원 여부 확인 필요 항목 (§ 11 입력)

다음 항목은 **백엔드와 합의 필요**. 합의 결과에 따라 § 5 데이터 페칭
전략이 바뀜:

1. **`getEvents` 에 `status` 쿼리 추가 가능 여부** — Stats 2번 카드 정확도 결정.
2. **이벤트 통계 엔드포인트 (`/events/stats` 가칭) 신설 가능 여부** — Stats 3번 카드(잔여 좌석 합) 정확도/비용 결정.
3. **카테고리 마스터 + 카운트 엔드포인트 (`/categories?withCounts=true` 가칭) 신설 가능 여부** — Categories 6 RTT vs 1 RTT 결정.
4. **Featured 플래그 또는 정렬 파라미터 추가 가능 여부** — Featured 5 rows 의 "추천" 의미 보장.
5. **호스트/커뮤니티 카운트** — Stats 4번 카드. 미지원이면 v1 하드코딩 유지.

**v1 출시 가정**: 위 5건 모두 미지원. § 5 의 페칭 전략은 미지원
가정으로 작성하고, 지원되면 어댑터/훅 1곳씩 교체.


## 5. 데이터 페칭 전략 (캐싱 / 합성)
(작성 예정)

## 6. 신규 상태 처리
(작성 예정)

## 7. Hero 인터랙션 (CTA 버튼, ⌘K 팔레트 호출)
(작성 예정)

## 8. Categories 클릭 → EventList 연동
(작성 예정)

## 9. SEO / 메타 태그 / 성능
(작성 예정)

## 10. 라우터 등록
(작성 예정)

## 11. 의사결정 필요 지점
(작성 예정)

## 12. PR 분할 (골격만)
### 12.1 PR 1: TypedTerminal
### 12.2 PR 2: Hero + Stats
### 12.3 PR 3: Categories + Featured
### 12.4 PR 4: CTA + 통합 + 라우터
### 12.5 PR 간 의존성
