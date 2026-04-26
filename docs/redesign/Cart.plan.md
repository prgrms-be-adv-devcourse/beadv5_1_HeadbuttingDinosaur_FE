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
(작성 예정)

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
