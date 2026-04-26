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

EventDetail 본문 렌더링은 단일 호출 `getEventDetail(eventId)` 만 필요하다.
구매 액션 (장바구니 추가 / 바로 구매) 의 `addCartItem` 은 본 페이지의 데이터
의존이 아니라 인터랙션 트리거이므로 § 6 에서 따로 다룬다. 여기서는 호출 1건과
응답 매핑만 정리한다.

### 사용하는 API (실제 시그니처)

```ts
// src/api/events.api.ts
getEventDetail(eventId: string)
  => Promise<AxiosResponse<ApiResponse<EventDetailResponse>>>
// → GET /api/events/:eventId
```

INVENTORY § 2 의 페이지→호출 함수 매핑 (`EventDetail.tsx → getEventDetail, addCartItem`)
과 일치. v2 도 동일한 두 함수만 사용.

### 표 1 — 요청

| API 함수 | 메서드 / 경로 | 파라미터 | 비고 |
|---|---|---|---|
| `getEventDetail` | `GET /api/events/:eventId` | `eventId: string` (path) | path param. 라우트 `/events-v2/:eventId` 에서 추출. UUID 포맷 검증은 백엔드 책임 — 클라는 그대로 전달하고 400 응답은 표 3 에서 처리. |
| `addCartItem` (참고만 — § 6) | `POST /api/cart/items` | `{ eventId: string, quantity: number }` | "바로 구매" / "장바구니 담기" 양쪽에서 사용. 인증 필요 → 비로그인 시 로그인 리다이렉트 (§ 6). |

### 표 2 — 응답 필드 매핑

소스: `src/api/types.ts#EventDetailResponse`. 프로토타입은 `MOCK_EVENTS` 의
한 항목 (`window.MOCK_EVENTS.find(e => e.eventId === id)`) 에 본문 텍스트만
하드코딩하여 사용한다.

| 프로토타입 mock 필드 | 실제 API 필드 | 변환 로직 | EventList 공유? |
|---|---|---|---|
| `event.eventId` | `eventId: string` | 그대로. | 공유 (`EventVM.eventId` 와 동일) |
| `event.title` | `title: string` | 그대로. | 공유 |
| `event.category` | `category: string` | 그대로. (카테고리 enum/한글 라벨 정규화는 EventList plan § 9 와 동일하게 보류 — § 8.) | 공유 |
| `event.price` | `price: number` | 그대로. `price === 0` → 파생 `isFree`. PurchasePanel 의 "무료" 표시 분기에 사용. | 공유 (헬퍼 재사용) |
| `event.remainingQuantity` | `remainingQuantity: number` | 그대로. 파생 플래그: `isLowStock = 0 < n < 10`, `isSoldOut = n === 0`, `canBuy = status === 'ON_SALE' && n > 0`. | `isFree`/`isLowStock` 헬퍼는 EventList 와 공유, `canBuy` 는 Detail 전용. |
| `event.status` (`'ON_SALE' \| 'SOLD_OUT'`) | `status: string` | `toStatus()` 헬퍼로 union 으로 좁힘 (`'ON_SALE' \| 'SOLD_OUT' \| 'SALE_ENDED' \| 'CANCELLED' \| 'ENDED'`). EventList plan § 3 과 동일 규칙. | **공유** — `src/pages-v2/_shared/eventFormat.ts#toStatus` (§ 1 에서 추출 결정) |
| `event.eventDateTime` | `eventDateTime: string` (ISO) | `toDateTimeLabels()` 로 `dateLabel` (`YYYY.MM.DD`) + `timeLabel` (`HH:mm`) 파생. InfoCard 일시 행에서 `${dateLabel} ${timeLabel}` 결합 표시 (프로토타입의 `window.fmtDate` 대체). | **공유** — 동일 헬퍼 |
| `event.techStacks` (`string[]`) | `techStacks: TechStackItem[]` (`{ techStackId: number, name: string }[]`) | **변환 필요**: `api.techStacks.map(t => t.name)` → `string[]`. `EventHeader` 의 `Chip` 그룹 입력. (목록 응답은 `string[]` 이므로 형태 차이 발생. EventList plan § 3 의 표 2 메모와 동일 사실.) | 변환 결과는 `string[]` 으로 EventList 와 동일 형태. 변환 함수는 Detail 어댑터 내부. |
| `event.location` | `location: string` | 그대로. InfoCard 의 "📍 장소" 행. (EventList 응답엔 없는 Detail 전용 필드 — EventList plan § 3 표 2 의 location 항목 참조.) | **Detail 전용** |
| `event.host` | `sellerNickname: string` | **필드명 변경**. InfoCard 의 "👤 주최" 행에 `sellerNickname` 표시. | **Detail 전용** |
| (프로토타입은 JSX 에 하드코딩) | `description: string` | 그대로. `EventDescription` 본문에 렌더. 줄바꿈/마크다운 처리 정책은 § 8. 프로토타입의 불릿 리스트는 mock 이라 v2 에선 description 안에 들어있는 텍스트를 그대로 표시 (불릿 가공 없음). | **Detail 전용** |
| (없음) | `totalQuantity: number` | UI 미노출 (현재). 표시 여부는 § 8 의사결정 (예: "잔여 N / 총 M석"). | **Detail 전용** |
| (없음) | `thumbnailUrl?: string` | `HeroBanner` 가 기본은 accent gradient + `❯_` 글리프. `thumbnailUrl` 이 있으면 hero 배경으로 사용할지 § 8 결정. 기본 가정: 무시 (프로토타입 충실). | **Detail 전용** |
| (없음) | `createdAt: string` | 사용 안 함 (UI 노출 없음). | — |

> **VM 결과**: `EventDetailVM` 은 위 매핑 후 다음 형태가 된다 (확정 형은 § 1
> 의 결정에 따라 `src/types-v2/event.ts` 의 공유 타입을 import).
>
> ```ts
> EventDetailVM = {
>   eventId; title; category;
>   techStacks: string[];        // 객체 → 이름 배열 변환 후
>   description; location;
>   price; remainingQuantity; totalQuantity;
>   status: EventStatus;         // 공유 enum
>   sellerNickname;
>   eventDateTime;               // 원본 ISO 보존
>   dateLabel; timeLabel;        // 파생
>   isFree; isLowStock;          // 파생 (공유 헬퍼)
>   isSoldOut; canBuy;           // 파생 (Detail 전용 — status + remainingQuantity)
>   thumbnailUrl?;               // 미사용 옵션
> }
> ```

### 어댑터 위치 / 공유 정책

§ 1 의 결정을 따른다:

- **`src/pages-v2/EventDetail/adapters.ts`** (신규)
  - `toEventDetailVM(api: EventDetailResponse): EventDetailVM` — 위 매핑 본체.
  - `toTechStackNames(items: TechStackItem[]): string[]` — 모듈 내부 헬퍼.
  - `deriveCanBuy(status: EventStatus, remaining: number): boolean` — 모듈 내부.
- **`src/pages-v2/_shared/eventFormat.ts`** (§ 1 에서 EventList 추출 시 신설)
  - `toStatus`, `toDateTimeLabels`, `isFree`, `isLowStock` — EventDetail 어댑터에서
    import 해서 사용.
- **공유 도메인 타입** `src/types-v2/event.ts`
  - `EventStatus` — Detail/List VM 양쪽이 import.

EventList 의 `toEventVM` / `toEventListPage` / `toFilterRequest` 는 입력 DTO
가 다르므로 **재사용하지 않는다** (§ 1 결론). 공유는 헬퍼 단위까지만.

### 표 3 — 에러 응답

`apiClient` (`src/api/client.ts`) 의 axios 응답을 hook 의 try/catch 에서 잡고
아래 매핑으로 UI 분기. 401 토큰 재발급 인터셉터는 client 가 이미 처리하므로
hook 은 그 후의 최종 상태만 본다.

| HTTP / 상황 | 의미 | UI 처리 |
|---|---|---|
| **200, 정상 응답** | 성공 | `success` 분기. `EventDetail.tsx` 가 본문 + `PurchasePanel` 렌더 (§ 5). |
| **400** | `eventId` 형식 오류 (UUID 아님 등) — URL 직접 입력 시 발생 가능 | `ErrorState` "잘못된 이벤트 주소입니다." + "이벤트 목록으로" 버튼 (`/events-v2`). 재시도 버튼은 의미 없으므로 미노출. |
| **401** | 인증 만료/누락. 상세는 **공개 가정** (EventList 와 동일) — 정상 흐름에선 발생 안 함 | client 인터셉터가 토큰 재발급 시도. 최종 401 이면 비로그인 상태로 페이지 그대로 노출 (구매 액션만 § 6 에서 차단). UI 자체는 일반 ErrorState 로 폴백. |
| **403** | 접근 권한 없음 (예: 비공개 이벤트 / 차단 사용자) | `ErrorState` "이 이벤트에 접근할 수 없습니다." + "목록으로" 버튼. 재시도 미노출. (PROFILE_NOT_COMPLETED 403 은 client 가 가로채 프로필 페이지로 리다이렉트하므로 hook 도달 전에 처리됨.) |
| **404** | 이벤트 없음 (삭제됨 / 존재하지 않는 ID) | **전용 not-found 분기** — 페이지 본문을 통째로 "이벤트를 찾을 수 없습니다" 카드로 대체 + "목록으로" 버튼. 라우트 자체가 매칭됐으므로 전역 NotFound 로 보내지 않고 인라인 처리 (§ 5 에서 컴포넌트 확정). |
| **422** | 비즈니스 검증 실패 — 상세 조회에서는 비정상 | `ErrorState` 폴백. 메시지는 서버 `message` 우선 표시. |
| **5xx** | 서버 오류 | `ErrorState` "일시적인 오류입니다. 잠시 후 다시 시도해주세요." + 재시도 버튼 (hook 의 `refetch` 호출). |
| **네트워크 / 타임아웃** (`ERR_NETWORK`, `ECONNABORTED`) | 연결 실패 | `ErrorState` "네트워크 연결을 확인해주세요." + 재시도. |

> 401/403/404 의 인라인 vs 전역 처리, 재시도 노출 여부는 § 5 (상태 처리) 에서
> 컴포넌트 단위로 다시 확정한다. 본 표는 HTTP 분류 기준만.

## 4. 데이터 페칭 전략

EventList 가 채택한 패턴과 **동일하게** 작성한다 (일관성). SPEC § 9 의 확정
사항 ("추가 라이브러리 미도입 — axios + `useEffect/useState` 기반 현행 패턴
유지, React Query/SWR 미사용") 를 그대로 따른다.

### 1) 사용 훅 — EventList 와 동일

`src/pages-v2/EventList/hooks.ts#useEvents` 와 같은 방식:

- 커스텀 훅 `useEventDetail(eventId)` — `useState<EventDetailQuery>` + `useEffect`
- 모듈 레벨 `Map<string, { data: EventDetailVM; fetchedAt: number }>` 캐시 (LRU)
- `AbortController` 로 효과 정리 시 in-flight 요청 취소
- 상태 union (EventList 의 `EventsQuery` 와 같은 형태):
  ```ts
  EventDetailQuery =
    | { status: 'loading'; previous?: EventDetailVM }
    | { status: 'success'; data: EventDetailVM; fetchedAt: number }
    | { status: 'not-found' }                        // 404 전용 (§ 5)
    | { status: 'forbidden' }                        // 403 전용 (§ 5)
    | { status: 'error'; error: unknown; previous?: EventDetailVM };
  ```
- 노출: `EventDetailQuery & { refetch: () => void }` — 404/403 은 `refetch` 호출
  해도 효과 없으므로 컨테이너가 호출하지 않는다.

React Query / SWR 채택 시의 `useQuery({ queryKey, queryFn, select })` 형태는
사용하지 **않는다**. 사용자가 예시로 제시한 코드는 의도 전달용 모양이므로, 본
프로젝트 패턴으로 옮긴 코드 예시는 아래 (5)에 둠.

### 2) 캐시 키 설계

EventList 는 `serializeFilters(filters)` 로 직렬화한 문자열을 키로 쓴다.
EventDetail 은 입력이 `eventId` 단일 path param 이므로 키도 단순:

```
key = eventId            // UUID 문자열 그대로
```

EventList 와 **다른 모듈 레벨 Map** 을 사용한다 (`detailCache`). 같은 Map 을
공유하면 Value 타입이 `EventListPage` vs `EventDetailVM` 으로 달라 키 충돌 위험
이 발생한다. 두 캐시는 독립적으로 관리하고, "list 캐시에서 detail 의 일부를
빌려쓰기" 는 (3) 의 placeholder 경로로 처리한다.

### 3) EventList 캐시 공유 / prefetch

두 가지 옵션 검토:

- **A) 카드 hover/focus/click 시 detail prefetch** — 카드가 이벤트 핸들러에서
  `useEventDetail` 을 호출할 수는 없으므로, hooks 모듈에 `prefetchEventDetail(eventId)`
  명령형 함수를 추가하고 EventList 카드의 `onMouseEnter` / `onFocus` /
  `onClick` 에서 호출. 캐시 워밍 효과만 노림.
  - 장점: 라우팅 후 즉시 success.
  - 단점: 마우스만 스쳐도 호출 → 백엔드 부하 ↑. 디바운스/포커스 추적 로직
    필요. EventList 컴포넌트에 책임 추가 (현재 EventList 는 detail 모름).
- **B) EventList 캐시에서 placeholder 합성** — `useEventDetail` 의 초기 state
  계산 시, detail 캐시에 hit 가 없으면 EventList 의 캐시들을 훑어서 같은
  `eventId` 를 가진 `EventVM` 을 찾아 부분 placeholder VM 을 만든다.
  - 공유 가능한 필드: `eventId`, `title`, `category`, `price`,
    `remainingQuantity`, `status`, `eventDateTime`, `dateLabel`, `timeLabel`,
    `techStacks`, `isFree`, `isLowStock`, `thumbnailUrl`.
  - 누락 필드: `description`, `location`, `sellerNickname`, `totalQuantity`
    → 컴포넌트에서 `undefined` 가능 처리 필요.
  - 상태는 `loading` 으로 유지하고 `previous` 슬롯에 placeholder VM 을 담아서
    스켈레톤 대신 즉시 표시. 백그라운드 요청 성공 시 `success` 로 교체.
  - 장점: 추가 호출 없음. 라우팅 직후 사용자 체감 즉시 표시. EventList 책임
    무변화.
  - 단점: EventList 의 캐시를 detail hook 이 들여다봐야 하므로 두 모듈 사이에
    의존이 생김 (또는 두 캐시를 모두 다루는 작은 공유 모듈 신설).

→ **기본 채택 안: B (placeholder)**. 단, EventList 측 캐시 export 가 필요
하므로 § 9 / § 8 의사결정에 "EventList hooks 의 캐시를 외부 노출할지" 항목
추가. 노출 비용이 크다고 판단되면 B 보류 → 본 페이지는 그냥 스켈레톤만 쓰고
A/B 모두 도입하지 않음 (가장 단순). 그래도 현 plan 의 후속 섹션은 placeholder
가 없는 시나리오를 기준으로 작성.

### 4) stale time / cache time

EventList 와 동일 값으로 시작:

| 항목 | 값 | 근거 |
|---|---|---|
| `STALE_MS` | `60_000` (60s) | EventList 와 일치. 상세는 변경 빈도가 더 낮지만 `remainingQuantity` 가 빠르게 변하므로 너무 길게 잡지 않음. |
| `LRU_LIMIT` | `12` | 사용자가 list ↔ detail 을 왕복하는 패턴이 더 흔하므로 list (8) 보다 약간 크게. 실제 메모리는 항목당 작음. |
| 백그라운드 refetch | 없음 | window focus / interval refetch 도입하지 않음. 사용자가 명시적으로 재시도 / 새로고침할 때만. |

`refetch()` 는 EventList 와 같이 캐시 엔트리를 먼저 삭제 → tick 증가로 효과
재실행. 5xx / 네트워크 에러 케이스에서 사용 (§ 5).

### 5) router param 에서 eventId 추출

라우트는 § 7 에서 `/events-v2/:eventId` 로 등록 예정. `index.tsx` 에서 추출:

```tsx
// src/pages-v2/EventDetail/index.tsx
import { useParams, Navigate } from 'react-router-dom';
import { EventDetail } from './EventDetail';

export default function EventDetailPage() {
  const { eventId } = useParams<{ eventId: string }>();
  if (!eventId) return <Navigate to="/events-v2" replace />;  // 라우터가 보장하지만 타입 안전
  return <EventDetail eventId={eventId} />;
}
```

훅 사용처 (컨테이너):

```ts
// src/pages-v2/EventDetail/hooks.ts (개념 골격 — EventList useEvents 와 동형)
const detailCache = new Map<string, { data: EventDetailVM; fetchedAt: number }>();

export function useEventDetail(eventId: string): EventDetailQuery & { refetch: () => void } {
  // 1) 초기 state: cache hit 면 success, 아니면 loading (placeholder 옵션은 (3)-B 채택 시 추가)
  // 2) useEffect([eventId, tick]):
  //    - fresh hit → success 세팅 후 return
  //    - else AbortController 로 getEventDetail 호출 → 200 success / 404 not-found / 403 forbidden / 그 외 error
  // 3) refetch: detailCache.delete(eventId) + setTick(n => n + 1)
}
```

전체 구현은 EventList `hooks.ts` 의 `useEvents` 를 그대로 본떠 작성하므로 본
plan 에서는 형태만 명시.

## 5. 신규 상태 처리 (로딩/에러/404/권한)

§ 4 에서 정의한 `EventDetailQuery` union 의 각 상태 + 도메인 파생 상태 (매진 /
비로그인 / 잔여 0) 를 컨테이너 (`EventDetail.tsx`) 에서 어떻게 렌더하고 어떤
사용자 액션을 노출하는지 정리. 트리거 → 표시 → 액션 3-컬럼 구조.

### 1) 로딩

| 항목 | 내용 |
|---|---|
| 트리거 | `EventDetailQuery.status === 'loading'`. (a) 첫 진입 + 캐시 miss, (b) `refetch()` 호출 직후. |
| 표시 (기본) | `<EventDetailSkeleton />` — Hero(240px 회색 박스) / 카테고리·title 라인 / 기술 스택 chip placeholder / InfoCard 4행 placeholder / Description 3-line placeholder / 우측 PurchasePanel placeholder (가격 라인 + 버튼 2개 placeholder) 의 **부분별 스켈레톤**. 페이지 전체 스피너는 사용 안 함 (정보 밀도 낮아짐). |
| 표시 (placeholder 채택 시) | § 4 (3)-B 채택 시 — `query.previous` 가 있으면 그 값으로 Hero / Header / InfoCard 의 일시·좌석 / Panel 의 가격 즉시 렌더하고, `description` / `location` / `sellerNickname` 등 누락 필드만 inline placeholder (3-line shimmer). 우측 CTA 버튼은 `disabled` + 텍스트 "불러오는 중..." 로 표기 (구매 액션을 placeholder 데이터로 트리거하면 안 됨). |
| 사용자 액션 | 없음. 취소 (뒤로가기) 시 `useEffect` cleanup 의 `AbortController.abort()` 가 in-flight 요청 정리. |

스켈레톤 컴포넌트는 § 2 의 `EventDetailSkeleton` 한 곳에서 위 부분별 placeholder
를 모두 정의. 페이지 컨테이너는 분기만:

```tsx
if (query.status === 'loading') {
  return query.previous
    ? <EventDetail.Stale data={query.previous} />   // placeholder 채택 시
    : <EventDetailSkeleton />;
}
```

### 2) 에러

§ 3 표 3 의 HTTP 분류를 컨테이너 분기 단위로 좁힌 결과. hook 에서 이미
`'not-found'` / `'forbidden'` / `'error'` 로 분류해서 내려주므로 컨테이너는
HTTP 코드를 직접 보지 않는다.

| 트리거 | 표시 | 사용자 액션 |
|---|---|---|
| `status === 'not-found'` (HTTP 404) | 페이지 본문을 통째로 인라인 NotFound 카드로 대체. 카드: 이모지 `🔍` + 헤드라인 "이벤트를 찾을 수 없습니다" + 서브카피 "이미 종료되었거나 존재하지 않는 이벤트입니다." | "이벤트 목록으로" (primary, `/events-v2`) + "메인으로" (ghost, `/`). **재시도 버튼 없음** (id 가 잘못된 케이스라 재시도 의미 없음). |
| `status === 'forbidden'` (HTTP 403, `PROFILE_NOT_COMPLETED` 외) | 인라인 카드. 헤드라인 "이 이벤트에 접근할 수 없습니다" + 서브카피 (서버 메시지 있으면 그대로, 없으면 "비공개 이벤트이거나 접근 권한이 없습니다."). | "이벤트 목록으로" (primary). 재시도 없음. (`PROFILE_NOT_COMPLETED` 403 은 client 인터셉터가 가로채 프로필 페이지로 이동시키므로 hook 까지 도달하지 않음.) |
| `status === 'error'` (5xx / 422 / 400) | 인라인 ErrorState 카드. 헤드라인 "이벤트 정보를 불러올 수 없습니다" + 서브카피 ("일시적인 오류입니다. 잠시 후 다시 시도해주세요." 기본 / 서버 `message` 가 있고 5xx 가 아니면 그 메시지 우선). | "다시 시도" (primary, `refetch()` 호출) + "이벤트 목록으로" (ghost). |
| 네트워크 끊김 / 타임아웃 (axios `ERR_NETWORK` / `ECONNABORTED`) | 위와 같은 ErrorState. 헤드라인 "네트워크 연결을 확인해주세요". | "다시 시도" (primary) + "이벤트 목록으로" (ghost). |

> 모든 에러 분기에서 좌측 `Breadcrumb` 는 **그대로 노출** (사용자가 잘못 들어간
> 경우 빠져나갈 수 있어야 함). breadcrumb 의 제목 슬롯은 placeholder text
> ("이벤트") 로.

### 3) 매진 (status === 'SOLD_OUT' 또는 잔여 0)

`success` 분기 내부의 도메인 상태. § 3 표 2 에서 정의한 파생 플래그
`isSoldOut` / `canBuy` 로 판단.

| 항목 | 내용 |
|---|---|
| 트리거 | `vm.isSoldOut === true` 또는 `vm.canBuy === false`. 정의: `isSoldOut = remainingQuantity === 0 \|\| status !== 'ON_SALE'`. (5)의 엣지를 같이 흡수.) |
| 표시 (좌측 본문) | 프로토타입 그대로. `EventHeader` 의 `StatusChip` 이 `sold` variant ("매진") 또는 status 별 라벨 ("판매 종료" / "취소됨" / "종료") 표시. `InfoCard` 의 "잔여 좌석" 행은 0이면 danger 색 텍스트 "매진되었습니다", `SOLD_OUT` 상태인데 잔여 > 0 (예: 판매 중지) 이면 그대로 "N석" + 상단 chip 으로 의미 전달. |
| 표시 (우측 PurchasePanel) | 가격 라인은 그대로. 수량 컨트롤 / 합계 행 **숨김**. CTA 영역은 `Button` 1개 (ghost lg full disabled) — 라벨은 status 별: `SOLD_OUT` → "매진된 이벤트입니다" / `SALE_ENDED` → "판매 종료된 이벤트입니다" / `ENDED` → "종료된 이벤트입니다" / `CANCELLED` → "취소된 이벤트입니다". |
| 사용자 액션 | 본 페이지에서는 없음. 안내 박스 (brand 좌측 bar) 는 그대로 노출 (환불/즉시 발급 안내) — 매진이라도 정보 가치는 유지. |

### 4) 비로그인 — 구매 액션 차단

데이터 페칭은 공개라 비로그인 상태에서도 페이지는 정상 렌더된다. 차단은 CTA
클릭 시점에서만 발생.

| 항목 | 내용 |
|---|---|
| 트리거 | `useAuth().isLoggedIn === false` 상태에서 "바로 구매하기" 또는 "장바구니에 담기" 클릭. (인증 컨텍스트는 기존 `src/lib/auth` 재사용.) |
| 표시 | 즉시 로그인 페이지로 이동. 토스트는 띄우지 않음 (액션 결과로 페이지가 바뀌므로 redundant). |
| 사용자 액션 | 로그인 후 자동으로 본 detail 로 복귀. 리다이렉트 URL: `/login-v2?returnTo=${encodeURIComponent(현재 path + search)}`. 현재 path 는 `/events-v2/:eventId` 이며 search 는 비어있는 게 보통. 로그인 페이지에서 `returnTo` 를 검증 후 적용. |

> CTA 가 클릭 직전에 호출하므로 비로그인 상태에서도 버튼은 **활성화**된 채로
> 노출 (회색 처리 안 함). 로그인 유도는 클릭 후 알게 됨 — 프로토타입과 동일.
> 만약 비로그인 시 버튼에 자물쇠 아이콘 / "로그인 후 구매" 라벨로 사전 노출
> 하고 싶으면 § 8 의사결정.

### 5) 잔여 좌석 0 엣지 (status === 'ON_SALE' 인데 stock === 0)

서버가 매진 갱신을 즉시 못 해서 발생할 수 있는 엣지. (3) 에 흡수되도록
`isSoldOut` / `canBuy` 정의를 둠:

```ts
isSoldOut = remainingQuantity === 0 || status !== 'ON_SALE';
canBuy    = status === 'ON_SALE' && remainingQuantity > 0;
```

따라서 `ON_SALE && remaining === 0` 케이스는 자동으로 (3) 의 매진 분기로
들어간다. 다만 `StatusChip` 은 백엔드가 보낸 `status` 를 표시하므로 chip 은
"판매중" 으로 보이고 잔여 좌석 행은 "매진되었습니다" 로 보이는 모순이 생길 수
있음. 컴포넌트 처리:

- `EventHeader` 의 chip 은 **파생 상태 우선** — `isSoldOut` 이면 chip 도 강제로
  `sold` variant ("매진") 로 표시. (백엔드 status 는 다음 응답에서 따라잡을
  것으로 가정.)
- 위 동작이 너무 적극적인지 (UI 가 서버 진실을 가린다) 는 § 8 결정 항목에
  추가. 기본은 위 정책.

### 상태 우선순위 (요약)

컨테이너 분기 순서는 단순 분기 체인:

1. `loading` (placeholder 유무에 따라 두 형태)
2. `not-found`
3. `forbidden`
4. `error`
5. `success` → 내부에서 `isSoldOut` / `canBuy` / 비로그인 액션 분기
   (모두 `success` 의 sub-state)

## 6. 구매 플로우 (장바구니 / 바로 구매)
(작성 예정)

## 7. 라우터 등록 방법
(작성 예정)

## 8. 의사결정 필요 지점

사용자가 제시한 6개 핵심 결정 + 이전 섹션에서 "§ 8 결정" 으로 미뤄둔 항목들의
요약. 6개 핵심은 사용자 결정 반영, 나머지는 추천안 그대로 진행 가정 (필요 시
재논의).

### 6개 핵심 결정

| # | 항목 | 옵션 요약 | 결정 | 메모 |
|---|---|---|---|---|
| 1 | "바로 구매" 후 이동 경로 | (a) `addCartItem` → `/cart` (장바구니 경유) / (b) 결제 페이지 직접 (`/payment`) | **(a) 장바구니 경유** | 기존 `src/pages/EventDetail.tsx#handleBuyNow` 와 동일 패턴, SPEC § 9 의 "장바구니 서버 저장" 결정과도 정합. § 6 (구매 플로우) 가 이 결정을 따라 작성됨. |
| 2 | 동일 이벤트 재담기 동작 | (a) 백엔드 합산 / (b) 백엔드 거부 (409) / (c) 덮어쓰기 | **(a) 합산** | 클라는 합산을 전제로 단순 호출 후 토스트만 띄움. PR 1 시작 전 백엔드 동작 1회 실측 필요 — 다르면 hook 에서 409/200 분기 추가. |
| 3 | 매진 임박 (잔여 < N) UI 강조 | (a) 강조 없음 / (b) `isLowStock` 으로 amber 색 / (c) "마감 임박" chip 추가 | **강조 적용 (잔여 < 5, amber 색)** | EventList 의 `isLowStock` 임계값은 `< 10`. 두 페이지 일관성 위해 공유 헬퍼 `isLowStock` 의 임계값을 **`< 5` 로 통일 + EventList 동시 수정** 권고 (§ 9 의 추출 PR 시점). 통일하지 않으면 페이지 간 동작 불일치. |
| 4 | 관련/추천 이벤트 섹션 | (a) 본 PR 시리즈 범위 밖 / (b) 이번에 같이 | **본 시리즈 범위 밖, 백로그로** | 사용자 응답 "장바구니에 추가" 의 의도가 모호함 — "백로그에 추가" 로 해석. 다른 의도였다면 (예: Cart v2 PR 에 합치기 / 이번 PR 에 포함) 정정 요망. |
| 5 | 공유 버튼 / 즐겨찾기 | (a) 도입 안 함 / (b) 도입 | **도입 안 함** | 프로토타입에 없음 + 즐겨찾기는 백엔드 API 부재. |
| 6 | `QuantityControl` 공용 승격 (Cart 와 공유) | (a) `src/components-v2/` 신설 / (b) Detail 페이지 전용 유지 | **(a) 승격** | `src/components-v2/QuantityControl.tsx` 로 신설. § 9 의 PR 0 / PR 1 에 포함. props 시그니처는 보수적으로 (`value`, `min`, `max`, `onChange`, `size?`). |

### 기타 미정 (이전 섹션에서 미뤄진 항목 — 추천안 그대로 진행 가정)

| # | 출처 | 항목 | 추천 (= 별도 결정 없으면 적용) |
|---|---|---|---|
| O1 | § 1 | 도메인 타입 / 헬퍼 공유 위치 | **A안** — `src/types-v2/event.ts` + `src/pages-v2/_shared/eventFormat.ts` |
| O2 | § 3 | `description` 줄바꿈/마크다운 처리 | **plain text + `white-space: pre-wrap`** (라이브러리 미도입) |
| O3 | § 3 | `totalQuantity` UI 노출 | **노출 안 함** (프로토타입에 없음) |
| O4 | § 3 | `thumbnailUrl` 활용 | **미사용** (항상 accent gradient + `❯_`) |
| O5 | § 3 | 카테고리 enum / 한글 라벨 정규화 | **EventList plan § 9 결정에 종속** |
| O6 | § 4 | EventList → EventDetail placeholder (캐시 공유) | **placeholder (B안) 채택** — EventList 캐시 export 비용이 크면 후퇴 (스켈레톤만) |
| O7 | § 5-(4) | 비로그인 시 CTA 사전 차단 노출 | **사전 차단 안 함** — 버튼 활성 유지, 클릭 시 로그인 페이지 (프로토타입 충실) |
| O8 | § 5-(5) | `ON_SALE` + `remaining=0` 엣지의 chip 표시 | **파생 상태 우선** — chip 강제 "매진" 표시 |
| O9 | § 2 | `EventDescription` 의 `SectionHead` 사용 | **단순 `h2`** (프로토타입 그대로) |

### PR 1 시작 전 확정 필요

플로우 막힘 방지를 위해 다음 항목은 PR 1 착수 전에 확정:

- ✅ 6개 핵심 (1~6) — 사용자 결정으로 모두 확정
- ⏳ **항목 2 의 백엔드 합산 동작 실측** — 1회 호출로 검증 필요
- ⏳ **항목 3 의 임계값 통일 여부** — `< 5` vs `< 10` 두 페이지 동기화
- ⏳ **항목 4 의 의도 재확인** — "장바구니에 추가" 의 의미

나머지 (O1~O9) 는 미정이어도 추천안으로 진행 가능.

## 9. PR 분할 + 파일 생성 순서

EventDetail 은 중간 크기라 PR 2~3 개로 분할.

### 9.1 PR 1: 골격 + 시각 컴포넌트
(작성 예정)

### 9.2 PR 2: API 통합 + 상태 처리 + 라우터 등록
(작성 예정)

### 9.3 PR 3: 구매 플로우 (장바구니 연동) — 선택
(작성 예정)

### 9.4 PR 간 의존성 / 머지 순서
(작성 예정)
