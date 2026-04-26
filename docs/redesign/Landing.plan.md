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
(작성 예정)

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
