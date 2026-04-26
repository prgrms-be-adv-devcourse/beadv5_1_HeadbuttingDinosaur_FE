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
(작성 예정)

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
