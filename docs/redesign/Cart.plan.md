# Cart 페이지 v2 계획

## 1. 페이지 디렉토리 구조

SPEC § 0 표준을 따른다.

```
src/pages-v2/Cart/
├── index.tsx           ← 라우트 진입점 (컨테이너, 인증/리다이렉트 처리)
├── Cart.tsx            ← 페이지 프레젠테이션 (좌측 아이템 리스트 + 우측 주문 요약 2-column)
├── components/         ← 페이지 전용 서브 컴포넌트
│   ├── CartItemCard.tsx        ← 아이템 카드 (썸네일 + 제목/날짜 + 수량 컨트롤 + 삭제)
│   ├── QuantityStepper.tsx     ← `−` `숫자` `+` 컨트롤
│   ├── OrderSummaryCard.tsx    ← 우측 sticky 주문 요약 + 결제 버튼
│   ├── EmptyCart.tsx           ← 빈 상태 (이모지 + CTA)
│   └── CartSkeleton.tsx        ← 로딩 스켈레톤
├── adapters.ts         ← API ↔ VM 변환 (`CartResponse` → `CartVM`)
├── hooks.ts            ← `useCart`, `useCartMutations`, `useCheckout`
└── types.ts            ← `CartItemVM`, `CartVM`, `CartQuery` 등
```

### EventList / EventDetail 와의 자산 공유

| 자산 | 소유 위치 | Cart에서의 사용 |
|---|---|---|
| `EventVM` (`EventList/types.ts`) | EventList | **재사용 안 함**. `CartItemDetail` API는 `eventId / eventTitle / price / quantity`만 내려주므로 `EventVM`(category, techStacks, status, remainingQuantity, dateLabel ...)을 채울 수 없음. Cart 전용 `CartItemVM`을 신규 정의 |
| `EventDetailVM` (`EventDetail/types.ts`) | EventDetail | 재사용 안 함 (Cart는 상세 페이지 모델이 아님) |
| `_shared/eventFormat.ts` (`toStatus / toDateTimeLabels / isFree / isLowStock`) | `_shared` | **재사용**. `CartItemCard` 날짜 라벨과 무료 표시에 `toDateTimeLabels`, `isFree` 그대로 사용 |
| `RecommendedCardVM / toRecommendedCards` (현재 `EventDetail/adapters.ts`) | EventDetail | Cart도 SPEC § 10에서 `recommendEvents` 사용 예정. 두 페이지 공유 시 `_shared/recommendation.ts`로 **승격(hoist)** 검토. 이 결정은 § 9에서 다룸 |

### 신규 정의가 필요한 이유 (`CartItemVM`)
- API `CartItemDetail`은 `eventDateTime`, `category`, `status`, `thumbnailUrl` 같은 이벤트 메타데이터를 내려주지 않음 → 프로토타입의 📅 날짜·accent 그라디언트 썸네일을 채우려면 **별도 보강 전략 필요** (§ 9 의사결정).
- 따라서 `CartItemVM`은 API로부터 직접 만들 수 있는 최소 필드(`cartItemId / eventId / eventTitle / unitPrice / quantity / lineTotal`)만 우선 정의하고, 보강 필드(`accentIndex`, `dateLabel`)는 § 3·§ 9에서 결정 후 추가.

## 2. 컴포넌트 분해

`prototype/Cart.jsx` 분석 기반. 프로토타입의 인라인 스타일·`window.*`·`useStateC` 별칭은 가져오지 않음 (SPEC § 0).

### 페이지 전용 컴포넌트

| 이름 | 역할 | 위치 | props 시그니처 | 의존 |
|---|---|---|---|---|
| `Cart` | 페이지 프레젠테이션. 2-column 레이아웃(좌측 리스트 / 우측 sticky 요약). 빈 상태 분기. 결제 트리거. | `src/pages-v2/Cart/Cart.tsx` | `{ query: CartQuery; onQuantityChange(itemId, next): void; onRemove(itemId): void; onCheckout(): void; checkoutState: 'idle' \| 'submitting' \| 'error' }` | `CartHeader`, `EmptyCart`, `CartItemList`, `OrderSummary`, `CartSkeleton` |
| `CartHeader` | h1 "장바구니" + 14px 부제 ("담긴 티켓 N개 · ...") | `src/pages-v2/Cart/components/CartHeader.tsx` | `{ itemCount: number }` | — (마크업만) |
| `EmptyCart` | 빈 상태 카드. 이모지 🛒 + 안내문 + "이벤트 둘러보기" CTA | `src/pages-v2/Cart/components/EmptyCart.tsx` | `{ onBrowse(): void }` | 공용 `EmptyState`, 공용 `Button` |
| `CartItemList` | 아이템 카드 세로 스택. 각 아이템에 `key=cartItemId`. | `src/pages-v2/Cart/components/CartItemList.tsx` | `{ items: CartItemVM[]; onQuantityChange(itemId, next): void; onRemove(itemId): void; pendingItemIds?: Set<string> }` | `CartItem` |
| `CartItem` | 아이템 카드 1개 (썸네일 + 제목/날짜 + 수량 컨트롤 + 삭제 + 우측 합계) | `src/pages-v2/Cart/components/CartItem.tsx` | `{ item: CartItemVM; onQuantityChange(next: number): void; onRemove(): void; pending?: boolean }` | 공용 `Card`, 공용 `AccentMediaBox`, 공용 `QuantityStepper`, 공용 `Button`, 공용 `Icon` |
| `OrderSummary` | 우측 sticky 카드. 합계/수수료/할인 + 구분선 + 총 결제금액 + 결제 버튼 + 약관 caption | `src/pages-v2/Cart/components/OrderSummary.tsx` | `{ subtotal: number; fee: number; discount: number; total: number; onCheckout(): void; submitting?: boolean; disabled?: boolean }` | 공용 `Card`, 공용 `Button`, `SummaryRow` |
| `SummaryRow` | 라벨 / 값 한 줄. `bold` 변형 지원 | `src/pages-v2/Cart/components/SummaryRow.tsx` | `{ label: string; value: string; bold?: boolean }` | — |
| `CartSkeleton` | 로딩 스켈레톤 (헤더 + 아이템 3개 + 요약 카드 placeholder) | `src/pages-v2/Cart/components/CartSkeleton.tsx` | `{}` | 공용 `Card` |

### Phase 0 공용 컴포넌트 사용처 (재활용)

| 공용 컴포넌트 | 위치 | Cart에서의 용도 | 비고 |
|---|---|---|---|
| `QuantityStepper` | `src/components-v2/QuantityStepper/` | `CartItem`의 `−` `숫자` `+` 컨트롤 | 이미 승격 완료. props: `value, onChange, min=1, max?, size='sm'` |
| `Button` | `src/components-v2/Button/` | "이벤트 둘러보기" (primary), "결제하기" (primary lg full), "삭제" (ghost sm with `iconStart`) | `variant`, `size`, `full`, `loading`, `iconStart` |
| `Card` | `src/components-v2/Card/` | `CartItem`(flat), `OrderSummary`(flat sticky), `EmptyCart`(flat 40 padding), `CartSkeleton` placeholder | `variant='solid'`, `padding` 활용 |
| `AccentMediaBox` | `src/components-v2/AccentMediaBox/` | `CartItem` 좌측 72×72 썸네일. `glyph="</>"`, `size='sm'` 또는 신규 사이즈 토큰 | accent 색상은 `eventId`로부터 `accent()` 매핑 (Phase 0 유틸 활용) |
| `EmptyState` | `src/components-v2/EmptyState/` | `EmptyCart`가 wrap | props: `emoji='🛒'`, `title`, `message`, `action=<Button>` |
| `Icon` | `src/components-v2/Icon/` | "삭제" 버튼 trash 아이콘 | `<Icon name="trash" size={12} />` |

### 분해 원칙
- `CartItem`은 표시·이벤트만 책임. 수량 변경/삭제는 콜백으로 위로 올리고, 실제 mutation은 `hooks.ts`의 `useCartMutations`(§ 3)가 수행.
- `OrderSummary`는 금액 계산 결과만 받음 (subtotal/fee/discount/total). 계산 로직은 `adapters.ts` 또는 `hooks.ts`로 분리.
- `pending` / `submitting` / `disabled` 같은 비동기 상태는 페이지 레벨에서 끌어와 prop drilling 1단계만 (전역 상태 도입 안 함).
- 신규 작성 시 SPEC § 0 "프로토타입 가져오지 않음" 규칙 준수: `style={{}}` 객체 인라인 금지(동적 값 제외), `window.*` 미사용, 별칭 hook(`useStateC`) 미사용.

## 3. 장바구니 상태 관리 전략

### 결론 — **Option B (서버 only)** 채택

선택지를 그대로 검토한 결과 **A·C는 적용 불가**, B만 가능. 사실상 결정은 SPEC/INVENTORY 시점에 이미 끝나 있고, 본 plan은 운영 전략(상태 위치/타이밍/낙관적 업데이트)만 결정.

### 검토 근거

#### 1) v1 코드 동작
- `src/pages/Cart.tsx`는 **서버 API에만 의존** (`getCart` / `addCartItem` / `clearCart`, 그리고 `updateCartItemQuantity` · `deleteCartItem`도 `cart.api.ts`에 존재).
- 페이지 진입 시 `useEffect → getCart()`로 서버 상태 페치, 변경마다 서버 호출 후 `fetchCart()` 재페치. **localStorage 미사용**.
- `recommendEvents`로 추천 카드 별도 페치, "빠르게 담기"는 `addCartItem` → `fetchCart()` 패턴.
- 결제는 `createOrder({ cartItemIds: items.map(i => i.cartItemId) })` → `PaymentModal`(Toss).

#### 2) 백엔드 cart API
풀 CRUD 존재 (`src/api/cart.api.ts`):

| 동작 | 메서드 | 경로 | 함수 |
|---|---|---|---|
| 조회 | GET | `/cart` | `getCart()` |
| 담기 | POST | `/cart/items` | `addCartItem({ eventId, quantity })` |
| 수량 증감 | PATCH | `/cart/items/:cartItemId` | `updateCartItemQuantity(id, { quantity })` (delta `+1`/`-1`) |
| 단건 삭제 | DELETE | `/cart/items/:cartItemId` | `deleteCartItem(id)` |
| 전체 비우기 | DELETE | `/cart` | `clearCart()` |

응답은 모두 `cartItemId`(UUID) 식별자 기반. 디바이스 간 동기화는 백엔드가 사용자별로 보장.

#### 3) 인증 게이팅 (INVENTORY § 4)
- `/cart` 라우트는 `RequireAuth` 가드 적용 → **비로그인 접근 시 `/login`으로 강제 이동**.
- 토큰은 `localStorage.accessToken` 인터셉터 주입(`src/api/client.ts`), 401 시 `/auth/reissue` 자동 재발급, 실패하면 `window.location.href = '/login'`.
- 즉, "비로그인 사용자가 cart에 머무는 시나리오"가 라우터 차원에서 차단되어 있어 **A·C의 핵심 장점(비로그인 담기)이 무효**.

#### 4) SPEC § 9 의사결정
- "**장바구니 서버 저장 여부 → 서버 저장 확정**: `src/pages/Cart.tsx`가 `getCart/addCartItem/clearCart` 사용".
- "**추가 라이브러리 미도입 확정**: axios + `useEffect/useState` 기반 현행 패턴 유지 (React Query/SWR 미사용)".
- INVENTORY § 5: 전역 상태 라이브러리(Redux/Zustand/Jotai) **하나도 없음**. Context 3종(Auth/Theme/Toast)만 존재.

#### 5) 프로토타입 동작
`prototype/Cart.jsx`는 부모(`Layout`)가 들고 있는 `cart` props/`setCart` setter를 받아 **인메모리만** 조작. 영속화·서버 동기화·인증 게이팅 코드 없음 → 프로토타입은 백엔드 부재 환경의 시각 데모일 뿐, **상태 전략의 근거로 삼지 않음**.

### 옵션별 적용 가능성

| 옵션 | 채택 여부 | 사유 |
|---|---|---|
| A. 로컬(localStorage) only | ❌ | (1) 백엔드 cart API와 `createOrder({ cartItemIds })`가 서버 cart 식별자에 의존, (2) `/cart`는 RequireAuth 가드라 비로그인 장점이 무의미, (3) v1·SPEC 결정과 정면 충돌 |
| B. 서버 only | ✅ | v1 패턴, SPEC § 9, RequireAuth 가드, 백엔드 풀 CRUD 모두와 일치 |
| C. 하이브리드 | ❌ | A의 장점(비로그인 담기)이 라우트 가드 때문에 발휘되지 않음. 동기화 로직을 떠안을 이유 없음. 단, EventDetail의 "장바구니 담기"에서 비로그인 시 처리는 § 7(결제 플로우) / § 6(에러 상태)에서 별개로 다룸 — `returnTo`로 로그인 후 복귀하는 식, **본 plan에서 로컬 큐는 두지 않음** |

### 운영 전략 (B 전제)

#### 상태 위치 — **페이지 로컬**
- 신규 전역 store/Context 도입하지 **않음** (라이브러리 미도입 원칙 + 사용처가 Cart 단일 페이지).
- 헤더 카트 뱃지 등 다른 곳에서 카운트가 필요해지면 그때 SPEC § 9에 별도 의사결정으로 올림. 본 plan 범위 밖.
- `src/pages-v2/Cart/hooks.ts`에 다음 훅 정의:
  - `useCart()` — `getCart()` 페치 + `CartQuery` 상태(`loading/success/error`) 반환. `useEffect` 마운트 1회.
  - `useCartMutations(refetch)` — `addItem`, `setQuantity`, `removeItem`, `clearAll` 래퍼. 각 함수는 호출 측에 `pending` boolean 노출.
  - `useCheckout(items)` — `createOrder` 호출 + `PaymentModal` open state.

#### 영속화 라이브러리 — **사용 안 함**
- 서버가 SoT(Source of Truth). localStorage·`zustand/persist` 등 일체 미사용.
- `react-router` 라우터 상태(예: returnTo)만 표준 사용.

#### 동기화 타이밍 — **변경 즉시 서버 호출 + 낙관적 업데이트**

| 인터랙션 | 호출 | UX 전략 |
|---|---|---|
| 페이지 진입 | `getCart()` 1회 | 로딩 스켈레톤 → 결과 / 빈 상태 / 에러 |
| 수량 `+` / `−` | `updateCartItemQuantity(id, { quantity: ±1 })` | **낙관적**: 클라이언트가 먼저 수량 갱신 → 실패 시 롤백 + 토스트. v1처럼 매번 `fetchCart()` 재호출은 **하지 않음** (응답에 `cartItemId/quantity` 들어 있어 부분 머지 가능) |
| "삭제" | `deleteCartItem(id)` | **낙관적**: 즉시 리스트에서 제거 → 실패 시 복구. 더블클릭 방지 위해 해당 row `pending` |
| EventDetail "장바구니 담기" 후 진입 | 진입 시 `getCart()` 한 번 | 추가 동기화 불필요 |
| 결제 클릭 | `createOrder({ cartItemIds })` → 성공 시 `PaymentModal` open. 결제 완료 콜백에서 cart는 백엔드가 정리(주문 생성 시 처리 가정) — 미정리면 `clearCart()` 보충 호출 | § 7에서 상세 |

- **디바운싱 안 함**: 수량 컨트롤은 클릭 단위(±1)이고 PATCH는 delta. 디바운스 시 인플라이트 race 위험 + 의미 없음.
- **레이스 가드**: 같은 `cartItemId`에 대해 인플라이트 mutation이 있으면 다음 클릭은 큐잉하지 않고 버튼 disable (`pendingItemIds: Set<string>`).
- **무효화**: 서버 응답이 인플라이트 낙관값과 어긋나면 서버값 채택 + 토스트.

#### 에러 / 복구
- 401: 인터셉터가 처리(`/auth/reissue` → 실패 시 `/login`). Cart 코드는 별도 처리 안 함.
- 4xx/5xx: 토스트 + 낙관적 업데이트 롤백. 페이지 진입 페치 실패는 § 6(빈/로딩/에러)에서 다룸.

#### v1 대비 변경점 요약
1. 매 mutation 후 `fetchCart()` 재페치 → 낙관적 업데이트 + 응답 머지
2. 인라인 `useState` 페이지 컴포넌트 → `useCart` / `useCartMutations` 훅으로 분리
3. `CartItemDetail` 직접 렌더 → `CartItemVM` (§ 1)로 어댑터 경유

## 4. API 매핑 테이블 (주문 / 결제)

기준: INVENTORY § 2 (`src/api/`). 모든 함수는 baseURL `/api` 위에서 동작 (`src/api/client.ts`). 본 plan은 **`src/api/*` 변경 금지**(SPEC § 0 보존 대상) — 시그니처는 *현재 소스* 기준으로 기록.

§ 3에서 **서버 cart(Option B) 채택** → 표 3 포함.

### 표 1. 장바구니 동기화 (서버 cart, § 3 결정)

| 함수 | HTTP | 경로 | 요청 | 응답 (`data`) | 비고 |
|---|---|---|---|---|---|
| `getCart()` | GET | `/cart` | — | `CartResponse` `{ cartId: string\|null, items: CartItemDetail[], totalAmount: number }` | 페이지 진입 1회. 응답을 `CartVM`으로 어댑트 |
| `addCartItem(body)` | POST | `/cart/items` | `CartItemRequest` `{ eventId: UUID, quantity: number }` | `AddCartItemResponse` `{ cartId, items, totalAmount }` | EventDetail "장바구니 담기"·추천 "빠르게 담기"에서 사용. Cart 페이지 자체에서는 호출 X |
| `updateCartItemQuantity(id, body)` | PATCH | `/cart/items/:cartItemId` | `CartItemQuantityRequest` `{ quantity: number }` (delta `+1` / `-1`) | `CartItemQuantityResponse` `{ cartItemId, quantity }` | 수량 컨트롤. **delta 의미** 주의 — 절대값 PUT 아님 |
| `deleteCartItem(id)` | DELETE | `/cart/items/:cartItemId` | — | `CartItemDeleteResponse` `{ success: boolean }` | 단건 삭제 |
| `clearCart()` | DELETE | `/cart` | — | `CartClearResponse` `{ success: boolean }` | 본 페이지에서 직접 호출은 안 함(전체 비우기 UI 미정 — § 9). 결제 후 백엔드 미정리 시 보충용 |

> **참고**: 사용자 프롬프트 예시 `PUT /api/cart` 같은 일괄 동기화 엔드포인트는 백엔드에 **존재하지 않음**. 변경은 항목 단위(POST/PATCH/DELETE)로만 이뤄짐. 어댑터는 PATCH 응답(`{ cartItemId, quantity }`)을 로컬 `CartVM.items`에 부분 머지하면 됨.

> **추천 카드 페치** (Cart 페이지에서 함께 사용): `recommendEvents()` (`src/api/events.api.ts`) — `RecommendationResponse` → `RecommendedCardVM[]` 어댑트(§ 1 참고). 본 표에는 cart 동기화가 아니므로 별도 표기.

### 표 2. 주문 생성

| 함수 | HTTP | 경로 | 요청 | 응답 (`data`) | 비고 |
|---|---|---|---|---|---|
| `createOrder(body)` | POST | `/orders` | `OrderRequest` `{ cartItemIds: string[] }` | `OrderResponse` `{ orderId, status, totalAmount, createdAt }` | **요청 형식 주의**: `{ items: [{ eventId, quantity }] }`가 아니라 **`cartItemIds: string[]`**. 서버 cart 식별자 기반이므로 표 1로 cart가 먼저 만들어져 있어야 함. 응답은 `ApiResponse<OrderResponse>` 래퍼로 옴 |

호출 시점: "결제하기" 버튼 클릭 → 성공 시 `OrderResponse.orderId`/`totalAmount`를 가지고 표 3의 `readyPayment`로 진행 (`PaymentModal` 오픈). § 7에서 시퀀스 상세.

### 표 3. 결제 (PG: Toss Payments)

결제는 **3단계**(ready → 사용자 PG 인증 → confirm/fail)로 분리되어 있어 단일 `POST /payments`가 아님.

| 함수 | HTTP | 경로 | 요청 | 응답 (`data`) | 비고 |
|---|---|---|---|---|---|
| `readyPayment(body)` | POST | `/payments/ready` | `PaymentRequest` `{ orderId, paymentMethod: 'PG' \| 'WALLET' \| 'WALLET_PG', walletAmount?: number }` | `PaymentResponse` `{ paymentId, orderId, paymentMethod, amount, status, walletAmount?, pgAmount?, tossPaymentUrl? }` | **래퍼 없는 raw 반환** (다른 엔드포인트와 다름 — `apiClient.post<PaymentResponse>` 직접 사용). PG 경로면 `tossPaymentUrl`로 redirect 또는 Toss SDK 호출 |
| `confirmPayment(body)` | POST | `/payments/confirm` | `PaymentConfirmRequest` `{ paymentId, paymentKey, orderId, amount }` | `PaymentConfirmResponse` `{ paymentId, orderId, paymentMethod, status, amount, approvedAt }` | Toss success 콜백(`/payment/success`)에서 호출 |
| `failPayment(body)` | POST | `/payments/fail` | `PaymentFailRequest` `{ paymentId, orderId, code?, message? }` | `void` | Toss fail 콜백(`/payment/fail`)에서 호출 |

> **idempotency**: 중복 결제 방지가 필요하면 `idempotencyConfig()` (`src/api/client.ts`) 헤더 옵션을 `readyPayment`/`createOrder` 호출에 부착. v1은 `PaymentModal` 안에서 처리 — § 7에서 v2 채택 여부 결정.

> **본 plan 범위**: Cart 페이지는 `createOrder` → `readyPayment` 트리거까지만 책임. `/payment/success`·`/payment/fail` 라우트는 SPEC § 9에서 "기존 결제 플로우 유지"로 결정됨 → 기존 페이지(`PaymentSuccess.tsx`/`PaymentFail.tsx`)가 `confirmPayment`/`failPayment`를 처리하므로 v2 Cart에서 직접 구현하지 않음.

### 표 4. 에러 응답 → UI 처리

axios 인터셉터(`client.ts`)가 401·403(`PROFILE_NOT_COMPLETED`)을 가로채므로 **페이지 코드는 그 외 케이스만** 처리.

| HTTP / 코드 | 의미 | 발생 가능 위치 | UI 처리 |
|---|---|---|---|
| 401 | 토큰 만료/무효 | 모든 호출 | 인터셉터가 `/auth/reissue` 자동 재시도 → 실패 시 `/login` 강제 이동. 페이지 코드 처리 **불필요** |
| 403 (`PROFILE_NOT_COMPLETED`) | 소셜 가입 미완 | 모든 호출 | 인터셉터가 `/social/profile-setup` 강제 이동. 페이지 코드 처리 **불필요** |
| 403 (그 외) | 권한 없음 | 드뭄 (RequireAuth 통과 가정) | 토스트 + 페이지는 현 상태 유지 |
| 404 | 자원 없음 | `getCart`(드뭄), `createOrder`(잘못된 cartItemId) | 토스트 "장바구니 정보를 찾을 수 없습니다" + `getCart()` 재페치 |
| 409 | **재고 부족 / 매진 / 상태 충돌** | `addCartItem`(EventDetail에서 호출), `updateCartItemQuantity`, `createOrder` | (a) Cart 페이지 안: 해당 row에 인라인 에러 chip "재고 부족" + 낙관적 업데이트 롤백. (b) `createOrder` 단계: `OrderSummary` 영역 인라인 배너 + `getCart()` 재페치로 서버 최신 상태 반영. 결제 진행 차단 |
| 422 | 검증 실패 | `addCartItem`(quantity 범위 등), `createOrder` | 필드 단위 매핑 (현 화면 인풋이 적어 토스트 한 줄로 충분한 경우 다수) |
| 429 | 레이트 리밋 | 빠른 연타 | 토스트 + 해당 버튼 잠시 disable. mutation은 `pendingItemIds` 가드로 1차 방지(§ 3) |
| 5xx | 서버 오류 | 모든 호출 | 페이지 진입 페치 실패: 페이지 레벨 에러 카드 + "다시 시도". mutation 실패: 토스트 + 낙관적 롤백 |
| 네트워크 끊김 | offline / DNS / timeout | 모든 호출 | 5xx와 동일 처리. 인플라이트 인디케이터 해제 |

### 어댑트 매핑 (요약)

| API | → VM | 어댑터 |
|---|---|---|
| `CartResponse` | `CartVM` (§ 1) | `Cart/adapters.ts :: toCartVM` |
| `CartItemDetail` | `CartItemVM` | `Cart/adapters.ts :: toCartItemVM` |
| `CartItemQuantityResponse` | `CartItemVM`(부분 갱신) | 동일 파일 :: `mergeQuantityUpdate(prev, response)` |
| `OrderResponse` | `OrderResultVM` (페이지 한정 — `{ orderId, totalAmount }`) | 동일 파일 :: `toOrderResultVM` |
| `PaymentResponse` | (어댑터 거치지 않음 — 곧장 PaymentModal/리다이렉트로 위임) | — |

## 5. 데이터 흐름 (담기 / 수정 / 삭제 / 결제)

§ 3(서버 only · 낙관적 업데이트 · `RequireAuth` 가드) + § 4(API 매핑) 기반. `pending`/`busy` 가드로 동시 실행 차단.

### (1) 담기 — EventDetail에서 호출

진입점은 v2 Cart 페이지가 **아니라** `src/pages-v2/EventDetail/hooks.ts :: usePurchaseActions` (이미 구현됨). Cart 페이지는 진입 시 `getCart()`로 결과만 흡수.

```text
[User clicks "장바구니 담기" / "바로 구매하기" on EventDetail]
   │
   ├─ if !isLoggedIn  → navigate(`/login?returnTo=${encodeURIComponent(pathname+search)}`)  # § 3 결정
   │                    └ 로그인 후 EventDetail로 복귀, 재클릭 필요 (자동 재실행 X — 본 plan 범위 밖)
   │
   ├─ if busy !== null → return  # 동시 클릭 가드
   ├─ setBusy('adding' | 'buying')
   ├─ await addCartItem({ eventId, quantity })           # POST /cart/items  (§4 표 1)
   │     └ 같은 eventId 재담기: 백엔드가 **합산**으로 동작한다고 가정
   │       (CartItemResponse가 단일 cartItemId로 누적 quantity 반환). § 9에 명시 필요
   ├─ on success
   │     ├ "담기"   → toast('장바구니에 담았습니다')                # 머무름
   │     └ "바로구매" → navigate('/cart')                          # Cart 페이지가 마운트되며 getCart() 페치
   └─ on error → toast (409 재고부족 / 5xx 등 § 4 표 4)
```

영속화 시점: **서버 응답 직후** (백엔드가 SoT). 클라이언트 캐시 없음.

### (2) 수량 변경 — Cart 내부

PATCH는 **delta** 의미(`+1`/`-1`)지 절대값 PUT 아님(§ 4 표 1).

```text
[User clicks `+` or `−` on a row]
   │
   ├─ if pendingItemIds.has(cartItemId) → return        # 인플라이트 가드 (§ 3)
   ├─ next = clamp(prev.quantity ± 1, 1, ?)             # 하한 1. 상한은 § 9 결정 (아래)
   ├─ Optimistic: setCartVM(merge(prev, { id, quantity: next }))
   │              setLineTotal(price * next)
   ├─ pendingItemIds.add(cartItemId)
   ├─ try
   │     ├ res = await updateCartItemQuantity(cartItemId, { quantity: ±1 })
   │     └ Reconcile: setCartVM(mergeQuantityUpdate(prev, res))   # 서버값으로 정정 (§4 어댑트 매핑)
   ├─ catch (409 재고부족 / 422 / 5xx)
   │     ├ Rollback to prev
   │     ├ row 인라인 chip "재고 부족" or 토스트
   │     └ (재고 충돌 의심 시) 단발 getCart() 재페치 — § 9 결정
   └─ finally → pendingItemIds.delete(cartItemId)
```

**디바운스 미사용** (§ 3): 클릭 1회 = PATCH 1회. 디바운스하면 delta가 합쳐지면서 race·중복 위험.

**상한(잔여 재고) 방어**: API `CartItemDetail`은 `remainingQuantity`/`stock`을 **내려주지 않음**. 두 가지 옵션:
- **A. 서버에 위임**: 클라이언트 상한 없음 → 409 받으면 롤백·안내. 구현 단순. **본 plan 권고**.
- **B. EventDetail에서 받은 stock을 캐싱해 클라 가드**: 페이지 간 상태 공유 필요(§ 3 "전역 store 미도입" 위배). 채택 X.

> § 9 결정 항목으로 올림: ① 클라 상한 가드 여부(A 권고), ② 409 발생 시 `getCart()` 재페치 여부.

### (3) 아이템 삭제 — Cart 내부

```text
[User clicks "삭제" on a row]
   │
   ├─ if pendingItemIds.has(cartItemId) → return
   ├─ (confirm 띄울지 여부 — § 9 결정. 본 plan 기본은 "즉시 삭제 + 토스트 Undo")
   ├─ snapshot = current CartVM
   ├─ Optimistic: setCartVM(removeItem(prev, cartItemId))
   ├─ pendingItemIds.add(cartItemId)
   ├─ try
   │     └ await deleteCartItem(cartItemId)             # DELETE /cart/items/:id (§4 표 1)
   ├─ catch
   │     ├ Rollback: setCartVM(snapshot)
   │     └ toast('삭제에 실패했습니다')
   └─ finally → pendingItemIds.delete(cartItemId)
```

> § 9 결정: **(a) confirm modal vs (b) 즉시 삭제 + Undo 토스트(5초) vs (c) 그냥 즉시 삭제**.
> v1은 **`전체 비우기`에만 `window.confirm`**, 단건 삭제는 v1에 UI 없음. 프로토타입은 즉시 삭제.
> 본 plan 기본 가정: **(c) 즉시 삭제** (인라인 휴지통 버튼이 작아 오클릭 위험 낮음). 변경 시 § 9 갱신.

### (4) 결제

§ 4 표 2(주문 생성) + 표 3(결제 ready/PG/confirm). PG 콜백 페이지 두 개(`/payment/success`, `/payment/fail`)는 **기존 페이지 유지** (SPEC § 9).

#### 사전 가드

```text
[User clicks "결제하기" in OrderSummary]
   │
   ├─ Empty guard:   if cartVM.items.length === 0 → 버튼 자체가 disabled (도달 X)
   ├─ Login guard:   라우트 가드(RequireAuth)가 이미 차단. 페이지 코드 추가 검사 불필요 (§ 3)
   ├─ Pending guard: if checkoutState !== 'idle' → return
   └─ Stock guard (선택): 클라이언트는 모름 → createOrder 단계 409 핸들링으로 위임
```

#### 시퀀스 — `createOrder` → `PaymentModal` → Toss → 콜백 페이지

```text
Cart.tsx                Cart/hooks.ts(useCheckout)        api                      Toss SDK / Pages
───────                 ────────────────────────────       ───                      ─────────────────
"결제하기" 클릭
   │  setCheckoutState('submitting')
   │
   │  await createOrder({ cartItemIds: items.map(i=>i.cartItemId) })  ─►  POST /orders            ◄── §4 표 2
   │     ├ 200 → { orderId, totalAmount }
   │     │       openPaymentModal({ orderId, totalAmount })
   │     │       setCheckoutState('idle')
   │     ├ 409 (재고/매진/상태 충돌)
   │     │       inline banner "재고가 변경되었습니다" + getCart() 재페치 → 결제 차단
   │     │       setCheckoutState('error')
   │     └ 5xx/network
   │           toast + setCheckoutState('error')   # 장바구니 그대로 유지 (재시도 가능)
   │
PaymentModal (v1 컴포넌트 재사용 — `src/components/PaymentModal.tsx`)
   │  method 선택 (PG / WALLET / WALLET_PG)
   │  await readyPayment({ orderId, paymentMethod, walletAmount? })   ─►  POST /payments/ready  ◄── §4 표 3
   │     ├ method === 'WALLET' → 즉시 onSuccess() (PG 우회)
   │     └ PG 포함 → sessionStorage('payment_context', { paymentId, orderId, ... })
   │                  └ window.TossPayments(clientKey).requestPayment('카드', {
   │                       amount: pgAmount, orderId: paymentId,
   │                       successUrl: '/payment/success',
   │                       failUrl:    '/payment/fail',
   │                    })  ──────────────────────────────────────────►  Toss redirect
   │
[redirect to /payment/success]   ─►  PaymentSuccess.tsx 가 confirmPayment 호출 (기존 페이지)
[redirect to /payment/fail]      ─►  PaymentFail.tsx 가 failPayment 호출 (기존 페이지)
[Toss 모달 cancel]                ─►  PaymentModal catch: 'USER_CANCEL' → toast('취소') / 머무름
```

#### 성공/실패 후처리

| 분기 | 후처리 | 위치 |
|---|---|---|
| WALLET 결제 즉시 성공 | `PaymentModal.onSuccess` → v1은 `navigate('/payment/complete', { state: { orderId, amount } })`. v2 Cart에서도 **동일 처리**(콜백 페이지 미신규) | Cart.tsx의 `onSuccess` 콜백 |
| PG 성공 (`/payment/success` 도달) | `PaymentSuccess.tsx`(기존)가 confirm 후 결제완료 페이지로 이동 | 기존 페이지 |
| PG 실패 (`/payment/fail`) | 기존 페이지가 사유 표시 + 재시도/돌아가기. **장바구니 유지** | 기존 페이지 |
| 사용자 취소 (Toss 모달 X) | 토스트 + Cart 머무름. createOrder는 이미 호출되어 orderId 존재 — 백엔드 정책에 따라 만료. **장바구니 유지** | Cart.tsx |

#### 장바구니 비우기 정책

- v1은 결제 성공 시 `clearCart()`를 **명시 호출하지 않음** → `createOrder`가 백엔드 측에서 cart를 비우는 것으로 추정.
- v2도 동일 가정. 만약 결제 완료 후 `/cart` 재진입 시 `getCart()`가 빈 응답이 아니면 → 백엔드 미정리. 그때 보충용 `clearCart()` 트리거를 추가할지는 § 9 결정.

#### "MyPage 티켓 탭으로" 이동

- 본 plan 기본: **결제완료 페이지(`/payment/complete`)에서 CTA로 이동**. v2 Cart는 결제완료 페이지를 신규 작성하지 않음(SPEC § 9 "결제 플로우 유지"). 따라서 Cart 페이지에서 `/mypage?tab=tickets` 직행 라우팅은 없음.
- 사용자 프롬프트의 "성공 시 마이페이지 티켓 탭으로"는 결제완료 페이지의 후속 동작(범위 밖)으로 해석. § 9에 메모.

### 흐름 간 공유 가드 요약

| 가드 | 어디서 | 목적 |
|---|---|---|
| `RequireAuth` 라우트 가드 | `App.tsx` (기존) | 비로그인 차단 (§ 3) |
| `pendingItemIds: Set<string>` | `useCartMutations` | 같은 row 동시 mutation 차단 |
| `checkoutState: 'idle'/'submitting'/'error'` | `useCheckout` | 결제 중복 클릭 차단 + UI 라벨 |
| `idempotencyConfig()` (옵션) | `client.ts` | `createOrder`/`readyPayment` 중복 방지 — 채택 여부 § 9 |

## 6. 신규 상태 처리 (빈 / 로딩 / 에러)

§ 3의 `CartQuery` 디스크리미네이티드 유니온(`loading | success | error`) + 페이지 로컬 보조 상태(`pendingItemIds`, `checkoutState`)로 표현. 모든 분기는 `Cart.tsx`에서 분기·렌더링하고, mutation 가드는 § 5의 가드 요약 표를 따름.

### 6.1 빈 상태

| 트리거 | 표시 | 사용자 액션 |
|---|---|---|
| 첫 페치 결과 `items.length === 0` | `<EmptyCart>` (§ 2). 🛒 이모지 + h2 17px "장바구니가 비어있습니다" + 14px text-3 안내문 + primary "이벤트 둘러보기". `flat-card` 40px padding, 가운데 정렬 (프로토타입 그대로) | "이벤트 둘러보기" → `navigate('/events')` |
| 결제 직후 비워진 경우 | 동일 `<EmptyCart>`이되 `variant='postCheckout'`로 메시지만 분기: "결제가 완료되어 장바구니를 비웠습니다" + 보조 CTA "주문 내역 보기" → `/mypage?tab=orders`. 이모지는 ✅ | 둘러보기 / 주문내역 두 CTA |
| 빠른 깜빡임 방지 | mutation 후 마지막 1개를 지웠을 때 `<EmptyCart>` 즉시 노출(낙관적). 서버 실패 시 롤백되며 다시 리스트 노출 | — |

**분기 판정**: 결제 직후 여부는 navigation `state.fromCheckout === true`로 판별 (Cart 페이지 진입 시 `location.state` 확인). 결제완료 페이지(`/payment/complete` 등 기존)에서 "장바구니로 돌아가기" CTA가 없으면 사실상 도달 X — 그래도 안전하게 분기는 둠. 도달 경로 부재 시 단일 메시지로 축소 가능 → § 9 결정.

### 6.2 로딩 상태

| 위치 | 트리거 | 표시 | 사용자 액션 |
|---|---|---|---|
| 페이지 초기 로드 | `CartQuery.status === 'loading'` (마운트 직후 `getCart()` 인플라이트) | `<CartSkeleton>` (§ 2): 헤더 라인 1개 + 아이템 placeholder 3개 + 우측 요약 카드 placeholder. 2-column 그리드 골격 유지해 레이아웃 시프트 방지 | 차단 |
| 수량 `+`/`−` 인플라이트 | `pendingItemIds.has(cartItemId)` | `QuantityStepper` 양 버튼 `disabled` + 숫자 옆 inline `◐` 스피너(11px). row 자체는 `opacity: .85` 유지(완전 어두워지지 않게) | 동일 row 추가 클릭 무시 |
| 단건 삭제 인플라이트 | 동일 `pendingItemIds` | row 전체 `opacity: .6` + 휴지통 버튼 disabled | row 머무름 |
| 추천 카드 페치 | `recommendQuery.status === 'loading'` | 별도 영역 placeholder 4~5개 (§ 2 범위 외 — 본 plan은 셀프 미디어 박스 4개 정도로 제안). 실패해도 메인 카트는 영향 없음 | 무시 가능 |
| 결제 시퀀스 | `checkoutState === 'submitting'` | OrderSummary "결제하기" 버튼: `loading` prop → `◐ 결제 진행 중...` + `disabled`. 다른 row의 mutation 버튼은 **계속 활성**(취소 가능해야 의미 있음 — 단, 결제는 cart snapshot 기준으로 진행 중이므로 § 9 토론 항목) | 차단 |

**스피너 자산**: 프로토타입의 `◐` 회전(SPEC § 1 Login 항목)을 그대로 사용. 별도 컴포넌트 만들지 않음.

### 6.3 에러 상태

axios 인터셉터가 처리하는 401/403(`PROFILE_NOT_COMPLETED`)은 페이지 코드에서 **재처리하지 않음** (§ 4 표 4).

#### 6.3.1 페이지 진입 페치 실패

| 트리거 | 표시 | 사용자 액션 |
|---|---|---|
| `getCart()` 5xx / 네트워크 | 본문 영역 단일 에러 카드: 🛑 + "장바구니를 불러오지 못했습니다" + 캡션 (오류 코드 mono) + ghost "다시 시도" 버튼 | "다시 시도" → `useCart`의 `refetch()` 호출. `CartQuery.previous`가 있으면 stale 상태로 표시 후 백그라운드 재시도(§ 3) |
| `getCart()` 404 (드뭄) | "장바구니가 비어있습니다"(빈 상태)로 흡수 | 둘러보기 CTA |

#### 6.3.2 mutation 실패 — 수량 / 삭제

| 트리거 | 표시 | 사용자 액션 |
|---|---|---|
| 409 재고 부족 / 매진 | 해당 row 하단에 인라인 chip(`StatusChip variant='sold'`) "재고 부족 — 보유 N개" + 토스트(error). 낙관 업데이트 **롤백**. **권고: 단발 `getCart()` 재페치**로 서버 quantity·price 동기화. 자동 수량 조정은 하지 않음(사용자 확인 우선) | 다시 `−` 누르거나 삭제 버튼으로 정리 |
| 422 검증 실패 | 토스트 한 줄 ("수량이 올바르지 않습니다"). 롤백 | 재시도 |
| 5xx / 네트워크 | 토스트 ("일시적인 오류입니다"). 롤백 | 재시도 |
| 동시 클릭 | mutation 시작 전 `pendingItemIds` 가드로 무시(§ 5) | — |

> § 9 결정: **(a) 409 시 자동 수량 보정** vs **(b) 사용자에게 알림만**. 본 plan 기본은 (b). (a)는 직관적이지만 사용자 동의 없이 quantity를 바꾸는 게 결제 직전엔 위험.

#### 6.3.3 결제 실패

| 단계 | 트리거 | 표시 | 사용자 액션 |
|---|---|---|---|
| `createOrder` 409 | 카트 내 항목 중 일부 매진/재고 부족 | OrderSummary 위쪽에 인라인 배너(red, dashed): "재고가 변경되었습니다. 다시 확인해주세요" + 자동으로 `getCart()` 재페치. 결제 버튼 `disabled`(서버 응답 후 해제) | 카트 정리 후 재시도 |
| `createOrder` 5xx / 네트워크 | — | 토스트("주문 생성에 실패했습니다") + `checkoutState='error'` | "결제하기" 다시 클릭 가능. 카트 그대로 유지 |
| `readyPayment` 실패 | PaymentModal 내부 catch (v1 그대로 재사용) | 모달 안 토스트("결제 처리 중 오류가 발생했습니다"). 모달은 **열린 상태 유지** | 다시 결제 / 모달 닫기 |
| Toss `USER_CANCEL` / `PAY_PROCESS_CANCELED` | PaymentModal | info 토스트("결제가 취소되었습니다") + 모달 닫힘 | 카트 머무름 |
| `/payment/fail` 도달 | 기존 페이지가 처리 (SPEC § 9). Cart 페이지 책임 아님 | (기존) | (기존) "장바구니로 돌아가기" 시 카트 유지 — 결제 시도 항목은 그대로 |

**카트 유지 원칙**: 결제 실패 / 취소 / 콜백 fail 시 **백엔드가 cart를 비우지 않는다고 가정**. 만약 비워서 돌아오면 사용자 혼란 → § 9에 백엔드 동작 확인 항목 추가.

#### 6.3.4 네트워크 끊김 / 오프라인

- 페치/뮤테이션 모두 5xx 처리와 동일 라우팅. 별도 오프라인 배너는 본 plan 범위 밖(`navigator.onLine` 도입은 SPEC § 9 라이브러리 미도입 원칙 위반 아님 → § 9 검토 항목으로만).

### 6.4 가격 변경 / 매진 감지 (재검증)

**결정: 본 plan 범위 밖 (§ 9에 의사결정 항목으로 등재)**.

이유:
- 백엔드 `createOrder`가 이미 서버 측에서 재고/가격을 검증해 409로 응답한다고 § 4 표 4에서 정의함.
- 클라이언트가 결제 직전에 추가로 `getCart()` 또는 `getEventDetail()`로 prefetch 비교하는 패턴은 **추가 라운드트립**이고, race를 100% 막지 못해 결국 서버 검증에 의존해야 함.
- 따라서 v2 1차 릴리스는 "서버 409 → 인라인 배너 + 재페치"(§ 6.3.3)로 통일.
- 향후 가격이 자주 바뀌는 도메인이라면 별도 의사결정.

> § 9 등재 항목: "결제 직전 재검증(prefetch) 도입 여부", "가격 변경 발견 시 모달 동의 패턴".

### 6.5 상태 매트릭스 (요약)

| `CartQuery.status` | `pendingItemIds` | `checkoutState` | 렌더 |
|---|---|---|---|
| `loading` | — | `idle` | `<CartSkeleton>` |
| `success` (items=[]) | — | `idle` | `<EmptyCart>` (variant 분기) |
| `success` (items>0) | empty | `idle` | 정상 리스트 + OrderSummary |
| `success` | non-empty | `idle` | 리스트(해당 row 인플라이트 표시) + OrderSummary |
| `success` | — | `submitting` | 리스트 + OrderSummary("결제 진행 중...") |
| `success` | — | `error` | 리스트 + OrderSummary 위 인라인 배너 |
| `error` (previous 있음) | — | `idle` | 리스트(stale) + 상단 stale 안내 + 재시도 버튼 |
| `error` (previous 없음) | — | `idle` | 페이지 레벨 에러 카드 + "다시 시도" |

## 7. 결제 플로우

§ 5 (4) 결제 시퀀스의 상세 + 도입/생략 항목 결정. SPEC § 9 "결제 플로우 유지" 결정에 묶임.

### 7.1 결제 수단 선택 UI — **본 PR 범위 ✅ (단, v1 컴포넌트 재사용)**

- 프로토타입(`Cart.jsx`)엔 결제 수단 선택 UI **없음** — `alert('결제가 완료되었습니다! (프로토타입)')` 한 줄로 끝.
- v1(`Payment` 페이지가 아니라 **`src/components/PaymentModal.tsx`**)이 PG / WALLET / WALLET_PG(예치금+PG) 3종을 모달로 처리.
- **결정**: v2 Cart는 신규 결제 모달을 만들지 않고 **기존 `PaymentModal`을 그대로 임포트**해 띄움 (SPEC § 9 "기존 결제 플로우 유지" + 본 plan SPEC § 0 "기존 코드 건드리지 않음" 양쪽 충족).
- 톤 차이는 v1 PaymentModal이 자체 인라인 스타일로 그려져 v2 디자인 시스템과 미세하게 어긋남 → § 9에 "PaymentModal v2 마이그레이션" 별 PR로 후속 등재.

### 7.2 PG 연동 방식 — **SDK 스크립트 + redirect**

INVENTORY § 5: `@tosspayments/tosspayments-sdk ^2.6.0` 의존성 존재. 다만 v1 PaymentModal은 `window.TossPayments(clientKey)` 글로벌 객체를 사용 — npm 패키지가 아니라 외부 스크립트 로드 방식(레거시 v1 JS SDK).

| 옵션 | 적용 여부 | 설명 |
|---|---|---|
| (a) `window.location` 변경 | ❌ | 사용 안 함. Toss는 자체 결제 페이지로 이동시킴 |
| (b) **SDK + redirect** | ✅ | `window.TossPayments(clientKey).requestPayment('카드', { ... successUrl, failUrl })` → Toss 호스트로 redirect (PaymentModal 내부 처리, v1 그대로) |
| (c) 새 창 / popup | ❌ | 사용 안 함 |
| (d) 자체 결제 페이지 (카드 직접 입력) | ❌ | PCI-DSS 회피 위해 PG에 위임 |

**호출 인자** (PaymentModal 코드 발췌):

```ts
const tossPayments = window.TossPayments('test_ck_GjLJoQ1aVZplbR1KB0MW8w6KYe2R')
await tossPayments.requestPayment('카드', {
  amount: pgAmount,
  orderId: payment.paymentId,        // 백엔드 paymentId 를 PG orderId 로 매핑
  orderName: '이벤트 티켓',
  successUrl: `${window.location.origin}/payment/success`,
  failUrl:    `${window.location.origin}/payment/fail`,
})
```

> v2가 npm `@tosspayments/tosspayments-sdk`를 직접 사용하도록 마이그레이션할지는 § 9에 후속 등재(SDK 초기화 방식이 다르고 타입이 잡혀 있어 권장되나, 본 PR 범위 밖).

### 7.3 결제 완료 페이지 라우팅 — **이번 PR 범위 ❌**

| 라우트 | 처리 | 비고 |
|---|---|---|
| `/payment/success` | 기존 `PaymentSuccess.tsx` 유지 (`confirmPayment` 호출 후 `/payment/complete` 이동) | SPEC § 9 |
| `/payment/fail` | 기존 `PaymentFail.tsx` 유지 (`failPayment` 호출 후 안내) | SPEC § 9 |
| `/payment/complete` | 기존 `PaymentComplete.tsx` 유지 ("주문 완료" + CTA) | SPEC § 9 |
| `/wallet/charge/success` `/wallet/charge/fail` | 기존 유지 | SPEC § 9 |

이 페이지들은 v2 토글 대상이 **아니다** (현재 `App.tsx`가 `<RequireAuth><PaymentSuccess /></RequireAuth>` 같은 평이한 마운트). v2 Cart 작업은 `/cart` 한 라우트만 다룸.

### 7.4 결제 취소 / 뒤로가기

| 시나리오 | 동작 | 처리 위치 |
|---|---|---|
| Toss 모달에서 X / "취소" | PaymentModal `catch`에서 `USER_CANCEL` / `PAY_PROCESS_CANCELED` 코드 → info 토스트("결제가 취소되었습니다") + 모달 닫힘 | PaymentModal (v1) |
| Toss 페이지에서 브라우저 뒤로가기 | Toss 자체적으로 `failUrl`로 redirect (혹은 사용자에 따라 history 복원) → `/payment/fail` 처리 | PaymentFail (기존) |
| `createOrder` 직후 사용자가 결제하지 않고 페이지 이탈 | order는 백엔드에 생성된 채 만료. cart는 v1 동작 그대로 백엔드 정책에 위임(§ 5) | — |
| Cart로 다시 돌아오면 | `getCart()` 재페치 — 결제 시도 항목이 그대로 남아 있음(백엔드가 cart를 비우지 않는 한). 사용자 재시도 가능 | useCart |

> v2 Cart 코드는 취소 자체를 별도 핸들링하지 **않음**. PaymentModal 내부 catch가 처리하고, Cart는 모달이 닫힌 뒤의 일반 상태로 복귀.

### 7.5 멱등성 (중복 결제 방지)

`src/api/client.ts`에 `idempotencyConfig()` 헬퍼가 존재 (UUID v4 + crypto fallback 3단). v1은 PaymentModal에서 `readyPayment` 호출 시 이를 부착하지 **않음** — 따라서 사용자가 빠르게 두 번 클릭하면 중복 `paymentId`가 생성될 수 있음.

| 보호 계층 | 적용 여부 | 어디서 |
|---|---|---|
| 클라이언트 disable 가드 | ✅ | OrderSummary 결제 버튼 `checkoutState='submitting'` (§ 5). PaymentModal "결제" 버튼 `loading` (v1 그대로) |
| `Idempotency-Key` 헤더 — `createOrder` | **§ 9 결정**(권고: 도입) | `Cart/hooks.ts :: useCheckout`에서 `createOrder` 호출 시 `idempotencyConfig()` 부착 |
| `Idempotency-Key` 헤더 — `readyPayment` | **§ 9 결정**(권고: 도입) | PaymentModal v2 마이그레이션 시점에 부착(본 PR 범위 밖) |
| 백엔드 단 중복 검사 | 가정 — 확인 필요 | 백엔드팀과 § 9 검증 항목 |

> 본 plan 채택안: **`createOrder`에만 idempotency 부착**(클라이언트 가드 + `Idempotency-Key` 이중). PaymentModal은 기존 코드 변경 금지라 손대지 않음. § 9에 "전 결제 플로우 idempotency 통일"을 후속 PR 항목으로 등재.

### 7.6 시퀀스 다이어그램 (full)

```
Cart.tsx        useCheckout         PaymentModal (v1)        Toss SDK              Backend                     Pages (existing)
────────        ───────────         ─────────────────        ────────              ───────                     ────────────────
"결제하기" 클릭
   │ check empty / pending guard (§5,§6.2)
   │
   ├─►submit(items)
   │            │ checkoutState='submitting'
   │            │ createOrder({ cartItemIds }) + idempotency  ──────────────────►  POST /orders
   │            │                                              ◄───────────────── { orderId, totalAmount }
   │            │ openPaymentModal({ orderId, totalAmount })
   │            │ checkoutState='idle'
   │
PaymentModal opens
                                    │ method 선택
                                    │ readyPayment({orderId,method,walletAmount?})───►  POST /payments/ready
                                    │                                              ◄── { paymentId, ..., tossPaymentUrl?, pgAmount }
                                    │
                                    ├ method='WALLET' ────────────────────────────────────────► onSuccess()
                                    │                                                          navigate('/payment/complete', state)
                                    │
                                    └ method∈{PG, WALLET_PG}
                                       │ sessionStorage.payment_context = {...}
                                       │ tossPayments.requestPayment('카드', {
                                       │   amount: pgAmount,
                                       │   orderId: payment.paymentId,
                                       │   successUrl, failUrl
                                       │ })  ─────────────────────────► (Toss host)
                                                                          │ 사용자 인증
                                                                          │
                                                          ┌───────────────┴───────────────┐
                                                          ▼                               ▼
                                                    successUrl                       failUrl
                                                    /payment/success                 /payment/fail
                                                    └─► PaymentSuccess.tsx           └─► PaymentFail.tsx
                                                          confirmPayment                   failPayment
                                                          → /payment/complete              → 안내 + 재시도
```

### 7.7 v2 Cart가 책임지는 범위 (요약)

✅ 결제 진입점 버튼·empty/pending/error 가드 (§ 5, § 6)
✅ `createOrder` 호출 + idempotency
✅ `<PaymentModal>`(v1) 마운트·언마운트
✅ WALLET 단일 결제 성공 시 `navigate('/payment/complete')`
❌ PG redirect 이후 `/payment/success`·`/payment/fail` 페이지 — 기존 유지
❌ `confirmPayment` / `failPayment` 호출 — 기존 페이지 책임
❌ PaymentModal 디자인/구조 변경 — 별도 후속 PR

---

## 8. 라우터 등록 방법

`router-toggle.plan.md` 메커니즘에 그대로 합류. 새 path 신설하지 않고 기존 `/cart` element만 `<VersionedRoute>`로 교체.

### 8.1 라우트 경로 — **`/cart` 그대로**

- 신규 `/v2/cart` 만들지 않음 (router-toggle § 2-3 결정: 기존 라우트 element wrapping). 이유: 북마크/링크 보존, 가드/Layout 트리 복제 회피.
- 가드/레이아웃 적용도 그대로: 상위 `<Route element={<Layout />}>` 트리 안의 `<Route path="/cart" ... />`.

### 8.2 변경할 한 곳 — `src/App.tsx`

**현재 (`src/App.tsx:93`)**:

```tsx
<Route path="/cart" element={<RequireAuth><Cart /></RequireAuth>} />
```

**변경 후**:

```tsx
// 상단 lazy import 추가 (현재 LoginV2/EventListV2/EventDetailV2 옆)
const CartV2 = lazy(() => import('./pages-v2/Cart'))

// 라우트 element 교체
<Route
  path="/cart"
  element={
    <RequireAuth>
      <VersionedRoute v1={<Cart />} v2={<CartV2 />} />
    </RequireAuth>
  }
/>
```

근거:
- `RequireAuth`는 **바깥**에 둠 — 토글 버전과 무관하게 비로그인 차단을 v1과 동일하게 보장 (`router-toggle.plan` § 1-4 패턴: `<RequireAuth><VersionedRoute .../></RequireAuth>`).
- `<Suspense fallback={<Loading fullscreen />}>`는 이미 `App.tsx:78`에서 트리 루트를 감싸고 있어 추가 코드 없음.
- v1 `Cart` lazy import는 그대로 유지(폴백 보장).

### 8.3 결제/완료/실패 라우트 — **본 PR 범위 ❌**

| 라우트 | v2 토글 추가? | 사유 |
|---|---|---|
| `/payment` | ❌ | SPEC § 9 "결제 플로우 유지". 본 PR은 cart만 |
| `/payment/complete` | ❌ | 동일 |
| `/payment/success` | ❌ | Toss successUrl. 변경 시 PG 호출 인자도 동기 변경 필요 — 별도 PR |
| `/payment/fail` | ❌ | Toss failUrl. 동일 |
| `/wallet/charge/success` `/wallet/charge/fail` | ❌ | 본 PR은 cart 무관 |

`App.tsx`에서 위 라우트들의 element는 **그대로** 둠 (`<RequireAuth><PaymentSuccess /></RequireAuth>` 같은 형태).

### 8.4 검증 — `?v=2` 토글 (router-toggle § 2-1)

| 채널 | 사용처 | 비고 |
|---|---|---|
| `?v=2` 쿼리 | QA / PR 미리보기. `https://…/cart?v=2` | URL 처리 시 `localStorage['ui.version']='2'` 동기화 |
| `localStorage['ui.version']` | 세션 sticky 선호 | 콘솔에서 `localStorage.setItem('ui.version','2')` 후 새로고침 |
| `VITE_UI_DEFAULT_VERSION=2` (env) | 스테이징 강제 | 빌드 시점 |

### 8.5 검증 체크리스트

본 PR 머지 후 수동/자동으로 확인:

- [ ] `/cart?v=1` → v1 Cart 그대로 (lazy fallback 정상)
- [ ] `/cart?v=2` → v2 Cart 마운트 + `?v=2` 제거 후 새로고침해도 localStorage로 sticky
- [ ] 비로그인 상태로 `/cart?v=2` → `/login`으로 redirect (RequireAuth가 VersionedRoute 바깥에서 동작)
- [ ] EventDetail v2 → "장바구니 담기" → 토스트 → `/cart?v=2`로 이동 시 마운트
- [ ] EventDetail v2 → "바로 구매하기" → `/cart`로 navigate 시 토글 상태 보존(localStorage가 떠받침)
- [ ] `?v=2` 환경에서 결제 시퀀스: createOrder → PaymentModal(v1 그대로) → Toss redirect → `/payment/success`(v1)
- [ ] `?v=2` 환경에서 401 발생 → 인터셉터 재발급 실패 시 `/login`으로 떨어지는지 (router 토글과 무관해야 정상)

> 자동화 테스트는 SPEC § 5 "테스트 러너 의존성 없음"이라 도입 전. 수동 QA 체크리스트로 운영.

### 8.6 영향 범위 (코드 diff 예측)

| 파일 | 변경 | 라인 수 |
|---|---|---|
| `src/App.tsx` | lazy import 1줄 추가 + `/cart` 라우트 element 교체 | +2 / -1 |
| `src/router-v2/*` | 변경 없음 (기존 `VersionedRoute` 재사용) | 0 |
| 신규 `src/pages-v2/Cart/**` | § 1 디렉토리 트리 신설 | (PR 단위로 § 10 분할) |
| 기존 `src/pages/Cart.tsx`, `src/components/PaymentModal.tsx` | **수정 금지** (SPEC § 0) | 0 |

## 8. 라우터 등록 방법
(작성 예정)

## 9. 의사결정 필요 지점

§ 3·§ 7 결정이 § 10(PR 분할)에 직접 영향. 본 섹션은 **결정 단일 진실 공급원**.

각 항목: 추천안(앞 섹션·SPEC·INVENTORY 근거) → **본인 결정** → 영향(앞 섹션 갱신 필요 시 § 10에서 흡수).

### 9.1 핵심 결정 (사용자 직접 입력)

| # | 항목 | 추천안 | **본인 결정** | 영향 |
|---|---|---|---|---|
| 1 | 장바구니 상태 관리 (A 로컬 / B 서버 / C 하이브리드) | **B**. v1 패턴 + RequireAuth 가드 + 백엔드 풀 CRUD + SPEC § 9 확정 (§ 3) | **B 서버 저장** | § 3 그대로. 추가 변동 없음 |
| 2 | 같은 이벤트 추가 시 합산 vs 덮어쓰기 | **합산**. `AddCartItemResponse`가 단일 cartItemId에 누적 quantity로 응답한다는 가정 (§ 5) | **합산** | § 5 (1) 그대로. 백엔드 동작 검증 필요(§ 9.3) |
| 3 | 수량 변경 디바운스 적용 여부 | **미적용**. PATCH가 delta 의미라 디바운스 시 race·중복 위험 (§ 3) | **기존 코드로 가능한 범위 내에서** = 디바운스 라이브러리 도입 X. 클릭 1회 = PATCH 1회 + `pendingItemIds` 가드 | § 3·§ 5 (2) 그대로 |
| 4 | 단건 아이템 삭제 confirm 모달 여부 | **즉시 삭제** (낙관적 + 토스트). v1에는 단건 삭제 UI 자체가 없어 precedent 없음. v1의 confirm은 "전체 비우기"에만 적용됨 | **기존 코드 확인 결과: 단건 삭제 UI 없음 → confirm 없이 즉시 삭제로 진행** | § 5 (3) 그대로. 토스트 Undo 패턴은 도입 X (단순 즉시 삭제) |
| 5 | 결제 직전 재고 / 가격 재검증 prefetch | **미도입**. `createOrder`가 서버에서 검증 후 409로 응답 → 인라인 배너 + `getCart()` 재페치로 통일 (§ 6.4) | **서버 단 검증에 위임. 409 응답 시 § 6.3.3 처리 패턴 적용** | § 6.4 그대로 |
| 6 | 쿠폰 / 할인 코드 입력 UI | 백엔드 API 부재(`OrderRequest = { cartItemIds }` 외 필드 없음, INVENTORY § 2 / § 3) → 도입 시 백엔드 변경 동반 | **이번 PR 범위 ❌ (없음)** | OrderSummary는 "할인 0원" 라인만 placeholder로 노출. 입력 UI 미구현 |
| 7 | 결제 수단 선택 UI (이번 PR 범위?) | § 7.1에서 **v1 PaymentModal 그대로 재사용**으로 적었음 (SPEC § 9 "결제 플로우 유지" + § 0 "기존 코드 보존") | **이번 PR 범위 ✅ (기능·흐름 그대로, UI/UX만 v2 톤앤매너로 리스킨)** | **§ 7.1·§ 7.7과 충돌** → § 10 PR 분할에서 별도 PR로 분리(`PaymentModal v2`). 본 plan의 § 7.7 "❌ PaymentModal 디자인 변경"은 § 9의 본 결정으로 **덮어쓰기** |
| 8 | 결제 완료 / 실패 페이지 (이번 PR 범위?) | § 7.3·§ 8.3에서 **본 PR 범위 ❌**로 적었음 (SPEC § 9 / Toss successUrl·failUrl 묶임) | **이번 PR 범위 ✅ (기능·흐름 그대로, UI/UX만 v2 톤앤매너로 리스킨)** = `/payment/success`, `/payment/fail`, `/payment/complete` 3개 페이지 v2 신설 | **§ 7.3·§ 8.3과 충돌** → § 10에서 별도 PR로 분리. SPEC § 9의 "결제 플로우 유지" 항목도 부분 갱신 필요(별도 작업) |
| 9 | 비로그인이 카트 담은 후 로그인 시 마이그레이션 (하이브리드 가정 시) | 9.1-1에서 B 채택했으므로 시나리오 자체가 발생 X | **불가능. 서버 관리 방식이라 비로그인은 RequireAuth 가드로 차단됨** (§ 3) | EventDetail "장바구니 담기"의 비로그인 처리는 `returnTo` redirect로 충분 (§ 5 (1)) |

### 9.2 부속 결정 (앞 섹션에서 § 9로 미룬 항목)

| # | 항목 | 출처 | 추천안 | **결정** |
|---|---|---|---|---|
| 10 | 빈 상태 variant 단일화 | § 6.1 | 결제 직후 진입 경로가 사실상 부재(완료 페이지 → "주문내역 보기" 경로 우선) → **단일 메시지로 축소**. `location.state.fromCheckout` 분기 제거 | **단일 빈 상태로 통합**. variant 분기 미구현 |
| 11 | 409 발생 시 자동 수량 보정 | § 6.3.2 | (b) 알림만. 사용자 동의 없이 quantity 변경 위험 | **(b) 알림 + 인라인 chip + `getCart()` 재페치**. 자동 보정 X |
| 12 | 단발 `getCart()` 재페치 트리거 (수량 mutation 409 후) | § 5 (2) | 409 시 1회 재페치. 서버 stock 변동을 즉시 반영 | **409 시 1회 재페치 채택** |
| 13 | "전체 비우기" UI 노출 여부 | (v1엔 있음, 프로토타입엔 없음) | 프로토타입에 없으므로 v2도 미노출. 결제 후 백엔드가 cart를 비운다고 § 5 (4)에서 가정 | **미노출**. UI에 전체 삭제 버튼 두지 않음 |
| 14 | 결제 실패 시 백엔드 cart 보존 동작 확인 | § 6.3.3 | 백엔드팀 확인 필요. v1은 명시 호출 X | **검증 항목 (§ 9.3)으로 등재**. 결과에 따라 보충 `clearCart()` 추가 검토 |
| 15 | `Idempotency-Key` 부착 범위 | § 7.5 | `createOrder`에 부착(클라 가드 + 헤더 이중). PaymentModal은 후속 | **`createOrder`에 `idempotencyConfig()` 부착**. PaymentModal v2(§ 9.1-7) PR에서 `readyPayment`도 동시 부착 |
| 16 | npm `@tosspayments/tosspayments-sdk` 마이그레이션 | § 7.2 | 권장(타입 안정성). 그러나 결제 수단 UI 리스킨(§ 9.1-7)과 함께 진행 | **§ 9.1-7 PR에서 함께 마이그레이션**. 별도 PR 분할 X |
| 17 | `RecommendedCardVM` 위치 (`EventDetail/adapters.ts` → `_shared/`) | § 1 | Cart도 `recommendEvents` 사용하므로 `_shared/recommendation.ts`로 승격 | **`_shared/recommendation.ts`로 승격**. § 10 PR 1에 포함 |
| 18 | 클라이언트 stock 상한 가드 (수량 컨트롤 max) | § 5 (2) | (A) 서버 위임. `CartItemDetail`이 stock을 안 내려줌 | **(A) 서버 위임**. 클라이언트 max 미설정 (단, min=1은 유지) |
| 19 | 오프라인 배너 (`navigator.onLine`) | § 6.3.4 | 도입 안 함. 5xx 처리로 흡수 | **미도입** |
| 20 | EventDetail 비로그인 → 로그인 후 액션 자동 재실행 | § 5 (1) | 미구현(returnTo 후 사용자 재클릭). 본 plan 범위 밖 | **미구현 유지**. 별도 의사결정 항목 아님 |

### 9.3 백엔드 검증 항목 (PR 1 시작 전 확인)

§ 9.1·§ 9.2의 가정 중 **백엔드 동작 가정**이 들어간 항목들. 시작 전 1회 검증.

| # | 가정 | 확인 방법 | 실패 시 영향 |
|---|---|---|---|
| V1 | `addCartItem` 같은 eventId 재호출 시 **합산** (§ 9.1-2) | 같은 eventId로 quantity 1 두 번 POST → 응답에 단일 cartItemId·quantity 2 확인 | 덮어쓰기 동작이면 클라 측 "이미 담긴 항목" 안내 추가 필요 |
| V2 | `createOrder` 성공 시 백엔드가 cart를 **비움** (§ 5 (4) / § 9.2-13) | 결제 성공 후 `getCart()` 호출 → `items: []` 확인 | 비우지 않으면 결제 성공 후 보충 `clearCart()` 호출 필요 |
| V3 | `createOrder` 409 응답 코드/메시지 포맷 (§ 6.3.3) | 의도적으로 매진 이벤트로 호출 → 응답 body 확인 | 인라인 배너 메시지 매핑 갱신 |
| V4 | `updateCartItemQuantity` quantity가 음수일 때(0 이하 도달) 백엔드 거동 (§ 5 (2)) | quantity=1인 row에 -1 PATCH 보내고 응답 확인 | 클라이언트가 min=1 가드를 강제(현 plan 그대로) |
| V5 | 결제 실패/취소 후 cart 보존 (§ 6.3.3) | `/payment/fail` 도달 후 `getCart()` 확인 | 비워지면 사용자 혼란 — `/payment/fail` 페이지에서 안내 추가 |
| V6 | `Idempotency-Key` 헤더 처리 여부 (§ 9.2-15) | 같은 키로 `createOrder` 2회 → 두 번째는 첫 결과 반환되는지 | 미처리면 클라 가드(`checkoutState`)만으로 충분히 방어. 헤더는 무해 |

### 9.4 § 10 (PR 분할) 영향 요약

§ 9의 결정으로 § 10에 다음 PR이 추가/조정됨:

- **신규 PR**: `PaymentModal v2 리스킨` (§ 9.1-7) — `src/components-v2/PaymentModal/` 신설 + Cart v2가 기존이 아닌 v2 Modal 임포트.
- **신규 PR**: `결제 콜백 페이지 v2 리스킨` (§ 9.1-8) — `/payment/success`, `/payment/fail`, `/payment/complete` 3개를 `<VersionedRoute>`로 토글 진입.
- **PR 1 추가 작업**: `RecommendedCardVM`을 `_shared/`로 승격 (§ 9.2-17).
- **PR 1 추가 작업**: `createOrder`에 `idempotencyConfig()` 부착 (§ 9.2-15).
- **시작 전 작업**: § 9.3의 6개 백엔드 검증 (별도 PR 아님, 검증 후 결과를 § 9.3에 갱신).

이 전체 구체적 PR 분할은 § 10에서 정리.

## 10. PR 분할 (골격만)
(작성 예정)

## 10.1 PR 1 — 골격 + 시각 컴포넌트 (mock 데이터)

### 목표
`/cart?v=2`로 진입했을 때 **v2 디자인 시스템 기반 정적 화면**(빈/리스트/요약 모두)이 mock 데이터로 그려지는 상태까지. 데이터 페칭·낙관적 업데이트·결제·추천은 **포함 안 함**(PR 2·3·4).

### 포함 / 제외

| 영역 | 포함 ✅ | 제외 ❌ (다음 PR) |
|---|---|---|
| 타입 (`types.ts`) | `CartItemVM`, `CartVM`, `CartQuery` 인터페이스만 (정적 — query는 PR 2에서 사용) | `OrderResultVM` (PR 3) |
| 어댑터 (`adapters.ts`) | — | 전부 PR 2 |
| 훅 (`hooks.ts`) | — | 전부 PR 2 |
| 페이지 (`index.tsx`, `Cart.tsx`) | mock fixture를 `Cart`에 직접 주입한 컨테이너. `RequireAuth`는 `App.tsx`에서 처리 | 실 API 연동 (PR 2) |
| 컴포넌트 (`components/`) | `CartHeader`, `EmptyCart`, `CartItemList`, `CartItem`, `OrderSummary`, `SummaryRow`, `CartSkeleton` (전부 정적 props만) | 동작 — 결제 버튼은 `onClick={() => alert('PR 3 예정')}` 또는 `disabled` |
| 공용 자산 승격 | `RecommendedCardVM`/`toRecommendedCards`를 `_shared/recommendation.ts`로 이동 (§ 9.2-17). 단, 이번 PR엔 **사용하지 않음**(추천 영역 미렌더) — 이동만 | 실 사용은 PR 4 |
| 라우터 (`App.tsx`) | `lazy CartV2` import + `<RequireAuth><VersionedRoute v1={<Cart/>} v2={<CartV2/>}/></RequireAuth>` 교체 (§ 8.2) | — |
| `idempotencyConfig` 부착 | — | PR 3 (결제) |
| PaymentModal v2 | — | PR 3 |
| 결제 콜백 페이지 v2 | — | PR 5 (별도) |

### 추정 LOC

| 파일 | LOC |
|---|---|
| `Cart/types.ts` | ~35 |
| `Cart/__mocks__/cartFixtures.ts` | ~40 |
| `Cart/components/SummaryRow.tsx` | ~15 |
| `Cart/components/CartHeader.tsx` | ~15 |
| `Cart/components/EmptyCart.tsx` | ~25 |
| `Cart/components/CartItem.tsx` | ~55 |
| `Cart/components/CartItemList.tsx` | ~20 |
| `Cart/components/OrderSummary.tsx` | ~45 |
| `Cart/components/CartSkeleton.tsx` | ~30 |
| `Cart/Cart.tsx` | ~70 |
| `Cart/index.tsx` | ~25 |
| `_shared/recommendation.ts` (이동) | ~50 (이동분, EventDetail/adapters.ts에서 빠짐) |
| `EventDetail/adapters.ts` (수정 — import 경로) | -50 / +1 |
| `App.tsx` (수정) | +2 / -1 |
| 합계 (신규+이동) | **~430 LOC** (목표 200~400 약간 상회) |

> 400 초과를 줄이고 싶으면 `RecommendedCardVM` 승격을 PR 4(추천 도입 PR)로 미룰 수 있음. 본 plan 권고는 **PR 1에서 함께 이동** — 어차피 정적 이동 + import 경로만 바뀌어 리뷰 부담 작음.

### 파일 생성 순서

의존성 기준으로 leaf → root.

1. **`src/pages-v2/Cart/types.ts`** — `CartItemVM`, `CartVM`, `CartQuery`. 외부 의존 없음(원자 타입만).
2. **`src/pages-v2/Cart/__mocks__/cartFixtures.ts`** — 3종 fixture: `mockEmptyCart`, `mockCartWithItems`(3개 항목, 다른 accent 분포), `mockLoadingCart`. types만 import.
3. **`src/pages-v2/_shared/recommendation.ts`** — `EventDetail/adapters.ts`에서 `RawRecommendedEvent`, `RecommendationResponse`, `RecommendedCardVM`, `toRecommendedCards` 일체 이동.
4. **`src/pages-v2/EventDetail/adapters.ts`** 수정 — 위 4개를 `_shared/recommendation`에서 re-import + 기존 정의 제거. `EventDetail.tsx`/`hooks.ts`의 import 경로도 동기 수정.
5. **`src/pages-v2/Cart/components/SummaryRow.tsx`** — props: `{ label, value, bold? }`. 의존 없음.
6. **`src/pages-v2/Cart/components/CartHeader.tsx`** — props: `{ itemCount }`. 의존 없음.
7. **`src/pages-v2/Cart/components/EmptyCart.tsx`** — props: `{ onBrowse }`. 공용 `EmptyState` + `Button` 사용.
8. **`src/pages-v2/Cart/components/CartItem.tsx`** — props: `{ item, onQuantityChange, onRemove, pending? }`. 공용 `Card`, `AccentMediaBox`, `QuantityStepper`, `Button`, `Icon`. types에서 `CartItemVM`.
9. **`src/pages-v2/Cart/components/CartItemList.tsx`** — `CartItem` 매핑. props: `{ items, onQuantityChange, onRemove, pendingItemIds? }`.
10. **`src/pages-v2/Cart/components/OrderSummary.tsx`** — props: `{ subtotal, fee, discount, total, onCheckout, submitting?, disabled? }`. `SummaryRow` + 공용 `Card`/`Button`.
11. **`src/pages-v2/Cart/components/CartSkeleton.tsx`** — placeholder 정적 마크업. 공용 `Card`.
12. **`src/pages-v2/Cart/Cart.tsx`** — `CartQuery` 분기(`loading`/`success(empty)`/`success(non-empty)`). 결제 버튼은 `disabled`. 1~11 모두 의존.
13. **`src/pages-v2/Cart/index.tsx`** — 컨테이너. `import { mockCartWithItems } from './__mocks__/cartFixtures'` 후 `<Cart query={{ status: 'success', data: mockCartWithItems, fetchedAt: 0 }} ... />`. URL 쿼리 `?cartFixture=empty|loading|success`로 3종 전환 가능(QA 편의, PR 2에서 제거).
14. **`src/App.tsx`** — `const CartV2 = lazy(() => import('./pages-v2/Cart'))` 추가 + `/cart` 라우트 element 교체 (§ 8.2).

### 권장 커밋 분할

| # | 커밋 메시지 | 포함 파일 |
|---|---|---|
| 1 | `refactor(event-detail-v2): hoist RecommendedCardVM to _shared/recommendation` | step 3·4 |
| 2 | `feat(cart-v2): add types and mock fixtures` | step 1·2 |
| 3 | `feat(cart-v2): add SummaryRow, CartHeader, EmptyCart leaf components` | step 5·6·7 |
| 4 | `feat(cart-v2): add CartItem and CartItemList` | step 8·9 |
| 5 | `feat(cart-v2): add OrderSummary and CartSkeleton` | step 10·11 |
| 6 | `feat(cart-v2): assemble Cart page with mock fixtures` | step 12·13 |
| 7 | `feat(cart-v2): wire /cart route through VersionedRoute` | step 14 |

> 7개가 부담스러우면 (3,4,5)를 묶어 `feat(cart-v2): add presentation components` 1커밋으로 합쳐도 무방. 다만 커밋 1(EventDetail 영향)은 **반드시 분리** — 회귀 시 revert 단위가 되어야 함.

### 검증 방법 (mock 데이터로 렌더 확인)

자동화 테스트 인프라 없음(SPEC § 5). **수동 QA** 체크리스트:

#### 정적 시각 검증 (mock fixture 토글)

- [ ] `/cart?v=2&cartFixture=success` — 3개 아이템 렌더. 각 row: 72×72 accent 그라디언트 박스(`</>` 글리프 색상이 eventId별로 다름) / 제목 15px semibold / 📅 날짜 / `−` `숫자` `+` 컨트롤 / "삭제" ghost / 우측 합계 16px bold.
- [ ] `/cart?v=2&cartFixture=success` — 우측 sticky `OrderSummary`: 상품 합계 / 수수료 0원 / 할인 0원 / 구분선 / 총 결제금액 bold / "결제하기" primary lg full(`disabled`) / caption.
- [ ] `/cart?v=2&cartFixture=empty` — `EmptyCart`: 🛒 + 안내 + "이벤트 둘러보기" primary. 가운데 정렬, 40px padding.
- [ ] `/cart?v=2&cartFixture=loading` — `CartSkeleton`: 헤더 placeholder + 아이템 3개 placeholder + 요약 placeholder. **2-column 레이아웃 시프트 없음**.
- [ ] 모바일 폭(<640px) 이하에서 stack — 우측 카드가 아래로 떨어짐.
- [ ] 다크 모드 (`[data-theme="dark"]`) 토큰 정상 적용.

#### 라우팅 검증

- [ ] `/cart?v=1` → v1 그대로 (회귀 없음).
- [ ] `/cart?v=2` → v2 마운트. 쿼리 제거 후 새로고침해도 `localStorage['ui.version']='2'`로 sticky.
- [ ] 비로그인 상태로 `/cart?v=2` → `/login` redirect (`RequireAuth`가 `<VersionedRoute>` **바깥**에서 동작 — § 8.2).

#### 인터랙션 검증 (mock 한정)

- [ ] `+` `−` 클릭: `onQuantityChange` 콜백이 호출되어 fixture가 즉시 갱신(컨테이너 useState로 mock 보관). PR 1에선 서버 호출 없음.
- [ ] "삭제" 클릭: 해당 row가 즉시 사라짐. fixture가 빈 배열이 되면 `EmptyCart`로 자동 전환.
- [ ] "결제하기" 클릭: 버튼은 `disabled` 또는 `alert('결제 플로우는 PR 3에서 도입됩니다')`. 라우팅 발생 X.
- [ ] "이벤트 둘러보기" 클릭: `navigate('/events')` 또는 `/`(EventList) — v2가 토글되어 있으면 그대로 v2 EventList.

#### 회귀 검증

- [ ] EventDetail v2의 "장바구니 담기" / "바로 구매하기" 동작 변경 없음 (`RecommendedCardVM` 이동만 한 단계라 동작은 동일해야 함). 콘솔 에러 없음.
- [ ] `tsc --noEmit` 통과 (전체 프로젝트).
- [ ] `vite build` 성공 (chunk 분리 정상, `pages-v2/Cart` 단일 chunk).

### PR 본문 템플릿

```
## Summary
- /cart 라우트에 v2 시각 골격 도입 (mock 데이터, 결제·API 미포함)
- RecommendedCardVM을 _shared/recommendation.ts 로 승격 (Cart v2 후속 PR 대비)
- VersionedRoute 토글 적용 — `?v=2`에서 v2, 그 외 v1 그대로

## Test plan
- [ ] /cart?v=2&cartFixture=success — 리스트·요약 렌더
- [ ] /cart?v=2&cartFixture=empty — EmptyCart 렌더
- [ ] /cart?v=2&cartFixture=loading — 스켈레톤 렌더
- [ ] /cart?v=1 — v1 회귀 없음
- [ ] 비로그인 /cart?v=2 → /login redirect
- [ ] EventDetail v2 회귀 없음
- [ ] tsc --noEmit / vite build 통과
```

## 10.2 PR 2
(작성 예정)

## 10.3 PR 간 의존성
(작성 예정)
