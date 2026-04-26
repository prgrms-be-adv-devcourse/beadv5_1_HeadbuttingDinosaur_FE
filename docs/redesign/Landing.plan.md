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
(작성 예정)

## 4. API 매핑 + 데이터 소스
(작성 예정)

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
