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
(작성 예정)

## 5. 데이터 흐름 (담기 / 수정 / 결제)
(작성 예정)

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
