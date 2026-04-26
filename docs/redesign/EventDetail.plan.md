# EventDetail 페이지 v2 계획

## 1. 페이지 디렉토리 구조

SPEC § 0 의 표준 구조를 따른다. EventDetail 은 단일 라우트(상세 + 우측 구매 패널)
로 EventList 보다 작지만, 컴포넌트 분해가 4개 이상 나오므로 표준 구조를
그대로 채택한다.

### 신규 파일 (EventDetail 전용)

```
src/pages-v2/EventDetail/
├── index.tsx                ← 라우트 진입점. /events-v2/:eventId 매칭, params 파싱,
│                              EventDetail 컨테이너에 eventId 주입.
├── EventDetail.tsx          ← 페이지 컨테이너. useEventDetail() 호출 → loading/error/
│                              not-found/success 분기. 성공 시 본문 + PurchasePanel
│                              레이아웃 조립.
├── components/
│   ├── EventHero.tsx        ← 240px hero banner (accent gradient + ❯_ 글리프)
│   ├── EventInfoCard.tsx    ← 일시/장소/주최/잔여 좌석 정보 카드
│   ├── EventDescription.tsx ← 소개 본문 (h2 + 본문 + 불릿)
│   ├── PurchasePanel.tsx    ← 우측 sticky 패널 (가격 / 수량 / CTA 2종)
│   ├── QuantityStepper.tsx  ← 수량 컨트롤 (− / 숫자 / +). Cart 와 모양은 같지만
│   │                          공용 컴포넌트화는 Cart 작업 시 같이 판단.
│   └── EventDetailSkeleton.tsx ← 로딩 스켈레톤 (hero + 텍스트 + 패널)
├── hooks.ts                 ← useEventDetail(eventId), useAddToCart(),
│                              useBuyNow() (인증 체크 + 장바구니 추가 + 라우팅)
├── adapters.ts              ← EventDetailResponse → EventDetailVM 변환
└── types.ts                 ← EventDetailVM, PurchaseAction 등 페이지 전용 VM
```

### EventList 와 공유 가능성 검토

| 후보 | 결론 | 근거 |
|---|---|---|
| `EventStatus` 타입 (`ON_SALE` / `SOLD_OUT` / …) | **공유 — 도메인 타입으로 승격** | EventList VM 과 EventDetail VM 양쪽이 동일한 enum 을 그대로 사용. EventDetail 만을 위해 따로 정의하면 두 파일에 똑같은 5-값 유니온이 박힘. |
| `EventVM` (전체 VM) | **별도** | `EventDetailResponse` 는 `description`, `totalQuantity`, `location`, `sellerNickname`, `createdAt` 등 리스트에 없는 필드가 추가되고 `techStacks` 가 `TechStackItem[]` (객체) 로 형태가 다름. 강제 공유하면 옵셔널이 난립한다. |
| 어댑터 함수 본체 (`toEventVM`, `toEventListPage`) | **별도** | 입력 DTO 가 `EventItem` vs `EventDetailResponse` 로 다름. EventDetail 은 `toEventDetailVM` 을 새로 작성. |
| 어댑터 내부 헬퍼 (`toStatus`, `toDateTimeLabels`, `isFree`/`isLowStock` 파생) | **공유** | 동일한 정규화/표시 규칙. 두 어댑터에서 재사용. |

### 공유 시 이동 위치 (제안)

도메인 타입과 포맷팅 헬퍼는 v2 공용 영역으로 분리한다. 두 후보:

- **A안 (선호)**: `src/types-v2/event.ts` 에 도메인 타입,
  `src/pages-v2/_shared/eventFormat.ts` 에 헬퍼.
  - 장점: SPEC § 0 의 작업 위치 규칙 (`src/pages-v2/`, `src/components-v2/`,
    `src/styles-v2/`) 과 일관. `_shared` 폴더는 페이지 간 공용임이 명확.
  - 단점: 디렉토리 1~2개 신설.
- **B안**: 기존 `src/types/` (보존 영역) 에 추가하고 헬퍼는
  `src/lib/utils` 에 추가.
  - 장점: 신규 디렉토리 없음.
  - 단점: SPEC § 0 의 "기존 코드 건드리지 않음" 원칙과 충돌. cutover 전엔
    v2 만의 변경으로 가두는 편이 안전.

→ **A안 채택**을 가정하고 본 plan 의 후속 섹션을 작성한다. 이견 있으면 § 8
의사결정 항목에 다시 올림.

### EventList 측 후속 작업 (별도 PR 후보)

타입/헬퍼 추출은 EventDetail 작업과 동시에 EventList 의 `types.ts`/`adapters.ts`
도 수정해야 한다. 절차:

1. 추출 PR (EventList 수정 + 새 공용 모듈 생성, 동작 무변화) — EventDetail
   PR 시리즈의 첫 단계.
2. 그 다음 EventDetail 신규 파일 PR 들이 공용 모듈을 import.

순서는 § 9 PR 분할에서 확정.

## 2. 컴포넌트 분해

`prototype/EventDetail.jsx` 를 다음 단위로 분해한다. 좌측 콘텐츠 영역과 우측
sticky 구매 패널이 서로 독립적이라 컴포넌트가 두 그룹으로 깔끔히 나뉜다.

### 분해 표

| 이름 | 역할 | 위치 (파일) | 의존 컴포넌트 |
|---|---|---|---|
| `EventDetail` | 페이지 컨테이너. `useEventDetail(eventId)` 호출, loading/error/not-found/success 분기. 성공 시 좌측 콘텐츠 + 우측 `PurchasePanel` 의 2-column grid 조립. | `src/pages-v2/EventDetail/EventDetail.tsx` | `EventDetailSkeleton`, `Breadcrumb`, `HeroBanner`, `EventHeader`, `InfoCard`, `EventDescription`, `PurchasePanel` |
| `Breadcrumb` | "이벤트 › 제목" 표시. 좌측 항목 클릭 시 `/events-v2` 로 이동. 제목은 `truncate`. | `src/pages-v2/EventDetail/components/Breadcrumb.tsx` | (RouterLink) |
| `HeroBanner` | 240px 배너. accent color 기반 `linear-gradient(135deg, ${c}15, ${c}35)` 배경 + 가운데 거대한 `❯_` 글리프 (mono 72px). accent 색은 prop 으로 받음. | `src/pages-v2/EventDetail/components/HeroBanner.tsx` | — |
| `EventHeader` | 카테고리 라벨 (mono uppercase) + `StatusChip` + 타이틀 28px + 기술 스택 `Chip` 그룹. | `src/pages-v2/EventDetail/components/EventHeader.tsx` | `StatusChip`, `Chip` |
| `InfoCard` | `flat-card` 컨테이너에 `InfoRow` 4개 (일시/장소/주최/잔여 좌석) 배치. 마지막 행만 border-bottom 제거. | `src/pages-v2/EventDetail/components/InfoCard.tsx` | `Card`, `InfoRow` |
| `InfoRow` | 1행 단위. `icon` (이모지 또는 `Icon`) + 라벨 + 값. 값은 ReactNode (잔여 좌석 0일 때 danger 색 노드 주입). | `src/pages-v2/EventDetail/components/InfoRow.tsx` | — |
| `EventDescription` | 소개 섹션. h2 17px + 본문 + 불릿 리스트. 내용은 VM 의 `description` 사용. | `src/pages-v2/EventDetail/components/EventDescription.tsx` | (`SectionHead` 사용 검토 — § 8 참조) |
| `PurchasePanel` | 우측 sticky (top 12) 컨테이너. 가격 / `QuantityControl` (조건부) / `PriceSummary` (조건부) / CTA 2종 / 안내 박스. 내부에서 수량 상태(`useState<number>`) 보유. 인증 체크/구매 액션은 `useAddToCart`/`useBuyNow` 훅 호출. | `src/pages-v2/EventDetail/components/PurchasePanel.tsx` | `Card`, `QuantityControl`, `PriceSummary`, `Button`, `Icon` |
| `QuantityControl` | `−` / 숫자 / `+` 3-요소 가로 컨트롤. `value`, `min`, `max`, `onChange` props. 좌우 버튼 34×34 / radius 6 / border-2. | **공용으로 승격**: `src/components-v2/QuantityControl.tsx` | `Icon` |
| `PriceSummary` | 합계 한 줄 (라벨 "합계" + 우측 값). border-top dashed/solid. price = 0 또는 매진 시 미렌더. | `src/pages-v2/EventDetail/components/PriceSummary.tsx` | — |
| `EventDetailSkeleton` | 로딩 placeholder (hero 박스 + 헤더 라인 + info card placeholder + 우측 패널 placeholder). | `src/pages-v2/EventDetail/components/EventDetailSkeleton.tsx` | — |

### Phase 0 공용 컴포넌트 사용처

SPEC § 0 의 공용 컴포넌트 매핑:

| 공용 컴포넌트 | 사용처 |
|---|---|
| `StatusChip` (`ok` / `sold`) | `EventHeader` — 카테고리 라벨 우측 |
| `Chip` | `EventHeader` — 기술 스택 그룹 |
| `Button` (`primary`/`ghost`, `lg`/`full`) | `PurchasePanel` — "바로 구매하기" (primary lg full), "장바구니에 담기" (ghost full), "매진된 이벤트입니다" (ghost lg full disabled) |
| `Icon` | `PurchasePanel` — `cart` (장바구니 버튼). `QuantityControl` — `minus`/`plus`. `InfoRow` 는 일단 이모지 유지. |
| `Card` (`flat-card`) | `InfoCard`, `PurchasePanel` 외곽 |
| `SectionHead` | `EventDescription` 의 "이벤트 소개" 헤더에 적용 가능. 다만 프로토타입은 mono "// hint" 없이 단순 h2 만 → § 8 의사결정 |
| `Eyebrow pill`, `Kbd` | EventDetail 에서 사용 안 함 |

### 공용 컴포넌트 승격 후보

| 컴포넌트 | 판단 | 근거 |
|---|---|---|
| `QuantityControl` | **승격 (Phase 0/1 시점)** | `prototype/Cart.jsx` 의 수량 컨트롤과 시각/동작이 동일 (28×28 vs 34×34 차이만 size prop 으로 흡수). 두 페이지에서 동일 동작이 명백하므로 `src/components-v2/QuantityControl.tsx` 로 작성. |
| `Breadcrumb` | **페이지 전용 유지 (현재 단계)** | 다른 v2 페이지에서 동일 패턴이 등장하면 그때 추출. 현재 EventDetail 외 후보 없음. |
| `InfoRow` / `InfoCard` | **페이지 전용 유지** | MyPage/Cart 에 비슷한 행 패턴이 있으나 스타일/간격 디테일이 다름. 섣불리 공유하면 옵션 폭발. |
| `PriceSummary` | **페이지 전용 유지** | Cart 의 주문 요약은 다중 row + 구분선 구조라 형태가 다름. 공유 비용 > 이득. |
| `HeroBanner` | **페이지 전용 유지** | EventList 카드의 mini gradient 와는 크기/형태가 달라 별도 유지. |

### 메모

- `gutter` (좌측 라인 번호) 와 `editor-scroll` 컨테이너는 Phase 0 Layout chrome
  의 일부로 처리. 이 페이지에서는 본문 영역만 채우고 라인 번호 카운터는
  Layout 측에서 노출.
- `qtyBtn` 같은 인라인 스타일 객체는 `QuantityControl` 컴포넌트 내부 className 으로 흡수. SPEC § 0 의 "인라인 `style={{}}` 객체 가져오지 않음" 원칙 준수.

## 3. API 매핑 테이블
(작성 예정)

## 4. 데이터 페칭 전략
(작성 예정)

## 5. 신규 상태 처리 (로딩/에러/404/권한)
(작성 예정)

## 6. 구매 플로우 (장바구니 / 바로 구매)
(작성 예정)

## 7. 라우터 등록 방법
(작성 예정)

## 8. 의사결정 필요 지점
(작성 예정)

## 9. PR 분할 + 파일 생성 순서
(작성 예정)
