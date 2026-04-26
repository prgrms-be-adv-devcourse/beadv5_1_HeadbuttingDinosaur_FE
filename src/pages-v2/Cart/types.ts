/**
 * Cart 페이지 v2 타입.
 *
 * 설계 근거: docs/redesign/Cart.plan.md
 *  - § 1 (디렉토리 구조 / 신규 정의가 필요한 이유)
 *  - § 3 (서버 only · CartQuery 디스크리미네이티드 유니온)
 *  - § 4 (어댑트 매핑 · OrderResultVM)
 *  - § 9.2-18 (클라 stock 상한 가드 미사용 → max 필드 부재)
 *
 * `CartItemVM`은 API `CartItemDetail`로부터 직접 만들 수 있는 최소 필드만 정의.
 * 보강 필드(`accentIndex`, `dateLabel`)는 색상은 `accent(eventId)` 유틸로 런타임 산출,
 * 날짜 라벨은 API가 내려주지 않으므로 PR 2 이후 별도 보강 전략에서 결정.
 */

export interface CartItemVM {
  cartItemId: string;
  eventId: string;
  eventTitle: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface CartVM {
  cartId: string | null;
  items: CartItemVM[];
  subtotal: number;
  fee: number;
  discount: number;
  total: number;
}

/**
 * 페이지 진입 페치 상태. mutation 인플라이트(`pendingItemIds`)와
 * 결제 진행(`checkoutState`)는 별도 페이지 로컬 상태로 다룬다 (§ 3, § 5).
 */
export type CartQuery =
  | { status: 'loading'; previous?: CartVM }
  | { status: 'success'; data: CartVM; fetchedAt: number }
  | { status: 'error'; error: unknown; previous?: CartVM };

/**
 * `createOrder` 응답을 `PaymentModal`(v1 브리지 / 추후 v2)로 넘기기 위한 최소 형태.
 * § 4 표 2 / § 5(4) 결제 흐름에서 모달이 요구하는 것은 `orderId`, `totalAmount` 두 가지.
 */
export interface OrderResultVM {
  orderId: string;
  totalAmount: number;
}
