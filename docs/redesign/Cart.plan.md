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
(작성 예정)

## 7. 결제 플로우
(작성 예정)

## 8. 라우터 등록 방법
(작성 예정)

## 9. 의사결정 필요 지점
(작성 예정)

## 10. PR 분할 (골격만)
(작성 예정)

## 10.1 PR 1
(작성 예정)

## 10.2 PR 2
(작성 예정)

## 10.3 PR 간 의존성
(작성 예정)
