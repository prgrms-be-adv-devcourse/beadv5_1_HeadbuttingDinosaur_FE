# v2 리뉴얼 사전 조사

## 1. 페이지 매핑

### src/pages/ 트리

```
src/pages/
├── Cart.tsx
├── EventDetail.tsx
├── EventList.tsx
├── Login.tsx
├── MyPage.tsx
├── NotFound.tsx
├── OAuthCallback.tsx
├── Payment.tsx
├── PaymentComplete.tsx
├── PaymentFail.tsx
├── PaymentSuccess.tsx
├── SellerApply.tsx
├── Signup.tsx
├── SignupComplete.tsx
├── SocialProfileSetup.tsx
├── WalletChargeFail.tsx
├── WalletChargeSuccess.tsx
├── admin/
│   ├── AdminApplications.tsx
│   ├── AdminDashboard.tsx
│   ├── AdminEvents.tsx
│   ├── AdminSettlements.tsx
│   ├── AdminTechStacks.tsx
│   └── AdminUsers.tsx
└── seller/
    ├── SellerDashboard.tsx
    ├── SellerEventCreate.tsx
    ├── SellerEventDetail.tsx
    ├── SellerEventEdit.tsx
    └── SellerSettlement.tsx
```

### 라우트 ↔ 파일 ↔ 프로토타입 매핑

| 파일 | 라우트 | 가드 / 레이아웃 | 프로토타입 매칭 |
|---|---|---|---|
| `pages/EventList.tsx` | `/` | Layout | `prototype/EventList.jsx` |
| `pages/EventDetail.tsx` | `/events/:id` | Layout | `prototype/EventDetail.jsx` |
| `pages/Login.tsx` | `/login` | (공개) | `prototype/Login.jsx` |
| `pages/Signup.tsx` | `/signup` | (공개) | — (프로토타입 없음) |
| `pages/SignupComplete.tsx` | `/signup/complete` | (공개) | — |
| `pages/OAuthCallback.tsx` | `/oauth/callback` | (공개) | — |
| `pages/SocialProfileSetup.tsx` | `/social/profile-setup` | (공개) | — |
| `pages/Cart.tsx` | `/cart` | Layout + RequireAuth | `prototype/Cart.jsx` |
| `pages/Payment.tsx` | `/payment` | Layout + RequireAuth | — |
| `pages/PaymentComplete.tsx` | `/payment/complete` | Layout + RequireAuth | — |
| `pages/PaymentSuccess.tsx` | `/payment/success` | Layout + RequireAuth | — |
| `pages/PaymentFail.tsx` | `/payment/fail` | Layout + RequireAuth | — |
| `pages/WalletChargeSuccess.tsx` | `/wallet/charge/success` | Layout + RequireAuth | — |
| `pages/WalletChargeFail.tsx` | `/wallet/charge/fail` | Layout + RequireAuth | — |
| `pages/MyPage.tsx` | `/mypage` | Layout + RequireAuth | `prototype/MyPage.jsx` |
| `pages/SellerApply.tsx` | `/seller-apply` | Layout + RequireAuth | — |
| `pages/seller/SellerDashboard.tsx` | `/seller` | SellerLayout + RequireSeller | — |
| `pages/seller/SellerEventCreate.tsx` | `/seller/events/create` | SellerLayout + RequireSeller | — |
| `pages/seller/SellerEventEdit.tsx` | `/seller/events/:id/edit` | SellerLayout + RequireSeller | — |
| `pages/seller/SellerEventDetail.tsx` | `/seller/events/:id` | SellerLayout + RequireSeller | — |
| `pages/seller/SellerSettlement.tsx` | `/seller/settlements` | SellerLayout + RequireSeller | — |
| `pages/admin/AdminDashboard.tsx` | `/admin` | AdminLayout + RequireAdmin | — |
| `pages/admin/AdminUsers.tsx` | `/admin/users` | AdminLayout + RequireAdmin | — |
| `pages/admin/AdminEvents.tsx` | `/admin/events` | AdminLayout + RequireAdmin | — |
| `pages/admin/AdminApplications.tsx` | `/admin/applications` | AdminLayout + RequireAdmin | — |
| `pages/admin/AdminSettlements.tsx` | `/admin/settlements` | AdminLayout + RequireAdmin | — |
| `pages/admin/AdminTechStacks.tsx` | `/admin/techstacks` | AdminLayout + RequireAdmin | — |
| `pages/NotFound.tsx` | `*` | (공개) | — |

### 프로토타입 측 비매칭 파일

| 프로토타입 파일 | 비고 |
|---|---|
| `prototype/Landing.jsx` | 현재 라우트 없음 (랜딩 페이지 신규 도입 후보) |
| `prototype/App.jsx` | 앱 엔트리 (페이지 아님, `src/App.tsx`에 대응) |
| `prototype/Layout.jsx` | 레이아웃 (페이지 아님, `src/components/Layout.tsx`에 대응) |
| `prototype/common.jsx` | 공통 컴포넌트 모음 (페이지 아님) |
| `prototype/tokens.css`, `prototype/ide-theme.css`, `prototype/DevTicket IDE.html`, `prototype/assets/` | 디자인 토큰 / 정적 자원 |

## 2. API 클라이언트

### `src/api/` 디렉토리 구조

```
src/api/
├── .env.example
├── client.ts            # axios 인스턴스, ApiResponse/Page 타입, unwrapApiData, idempotencyConfig
├── index.ts             # barrel: client + types + 모든 *.api 재수출
├── types.ts             # 도메인 DTO 타입
├── auth.api.ts          # 회원가입/로그인/프로필/판매자 신청, 공통 techStacks
├── events.api.ts        # 이벤트 목록/검색/상세, 판매자 이벤트 CRUD, 이미지 업로드
├── cart.api.ts          # 장바구니
├── orders.api.ts        # 주문 생성/조회/취소
├── tickets.api.ts       # 티켓 조회
├── payments.api.ts      # PG 결제 ready/confirm/fail
├── wallet.api.ts        # 지갑 잔액/충전/출금/거래내역
├── refunds.api.ts       # 환불 (티켓/주문/판매자 이벤트)
├── seller.api.ts        # 판매자 정산 미리보기/월별
├── admin.api.ts         # 관리자 대시보드/유저/이벤트/신청/정산/수수료/기술스택
├── techStacks.ts        # extractTechStacks (공통 헬퍼)
└── ai.api.ts            # getEventRecommendations
```

### 페이지 → 호출 함수 매핑

| 페이지 | 모듈 | 호출 함수 |
|---|---|---|
| `EventList.tsx` | `events.api`, `auth.api`, `techStacks` | `getEvents`, `searchEvents`, `filterEvents`, `getTechStacks`, `extractTechStacks` |
| `EventDetail.tsx` | `events.api`, `cart.api` | `getEventDetail`, `addCartItem` |
| `Login.tsx` | `auth.api` | `login` |
| `Signup.tsx` | `auth.api`, `techStacks` | `signup`, `createProfile`, `getTechStacks`, `reissueToken`, `extractTechStacks` |
| `SignupComplete.tsx` | — | (호출 없음) |
| `OAuthCallback.tsx` | `auth.api` | `getProfile` |
| `SocialProfileSetup.tsx` | `auth.api`, `techStacks` | `createProfile`, `getTechStacks`, `extractTechStacks` |
| `Cart.tsx` | `cart.api`, `events.api`, `orders.api`, `client` | `addCartItem`, `clearCart`, `getCart`, `getEventDetail`, `recommendEvents`, `createOrder`, `unwrapApiData` |
| `Payment.tsx` | `payments.api`, `wallet.api`, `client` | `readyPayment`, `getWalletBalance`, `unwrapApiData` |
| `PaymentComplete.tsx` | — | (호출 없음) |
| `PaymentSuccess.tsx` | `payments.api` | `confirmPayment` |
| `PaymentFail.tsx` | `payments.api` | `failPayment` |
| `WalletChargeSuccess.tsx` | `wallet.api` | `confirmWalletCharge` |
| `WalletChargeFail.tsx` | — | (호출 없음) |
| `MyPage.tsx` | `tickets.api`, `orders.api`, `wallet.api`, `refunds.api`, `auth.api`, `techStacks` | `getTickets`, `getOrders`, `cancelOrder`, `getWalletBalance`, `getWalletTransactions`, `startWalletCharge`, `withdrawWallet`, `getRefunds`, `getRefundInfo`, `refundTicketByPg`, `refundOrder`, `getTechStacks`, `updateProfile`, `changePassword`, `withdrawUser`, `extractTechStacks` |
| `SellerApply.tsx` | `auth.api` | `applyForSeller`, `getSellerApplicationStatus` |
| `NotFound.tsx` | — | (호출 없음) |
| `seller/SellerDashboard.tsx` | `events.api`, `refunds.api` | `getSellerEvents`, `stopSellerEvent`, `getSellerEventRefundsPage` |
| `seller/SellerEventCreate.tsx` | `events.api`, `auth.api`, `techStacks` | `createSellerEvent`, `getSellerEventDetail`, `updateSellerEvent`, `uploadEventImage`, `getTechStacks`, `extractTechStacks` |
| `seller/SellerEventEdit.tsx` | — | (직접 import 없음 — `SellerEventCreate`를 재사용/포워딩) |
| `seller/SellerEventDetail.tsx` | `events.api` | `getSellerEventDetail`, `getSellerEventSummary`, `getSellerEventParticipants` |
| `seller/SellerSettlement.tsx` | `seller.api` | `getSellerSettlementByMonth`, `getSellerSettlementPreview` |
| `admin/AdminDashboard.tsx` | `admin.api` | `getAdminDashboard` |
| `admin/AdminUsers.tsx` | `admin.api` | `getAdminUsers`, `updateUserStatus`, `updateUserRole` |
| `admin/AdminEvents.tsx` | `admin.api` | `getAdminEvents`, `forcecancelEvent`, `getSellerApplications`, `processSellerApplication`, `runSettlementProcess`, `getAdminSettlements` |
| `admin/AdminApplications.tsx` | `admin.api` | `getSellerApplications`, `processSellerApplication` |
| `admin/AdminSettlements.tsx` | — | (직접 import 없음) |
| `admin/AdminTechStacks.tsx` | `admin.api` | `getAdminTechStacks`, `createAdminTechStack`, `updateAdminTechStack`, `deleteAdminTechStack`, `reindexAdminTechStacks` |

### 비고 — 페이지에서 미사용 모듈

| 모듈 | 노출 함수 | 페이지 사용 여부 |
|---|---|---|
| `ai.api.ts` | `getEventRecommendations` | 페이지 직접 호출 없음 (Cart는 `events.api`의 `recommendEvents` 사용) |
| `admin.api.ts` 일부 | `getFeePolicies`, `createFeePolicy`, `updateFeePolicy`, `getAdminUserDetail` | 페이지 직접 호출 없음 |

## 3. 도메인 타입

### 위치

- `src/types/` 폴더는 **존재하지 않음**.
- 모든 도메인 DTO는 `src/api/types.ts` (단일 파일, 약 800 LOC) 에 평탄하게 선언.
- 공통 응답 래퍼/페이지네이션은 `src/api/client.ts` 에 별도 export.

```
src/api/
├── client.ts   # ApiResponse<T>, Page<T>
└── types.ts    # 도메인 DTO 전부
```

### 도메인 그룹

| 그룹 | 대표 타입 |
|---|---|
| 공통 래퍼 (`client.ts`) | `ApiResponse<T>`, `Page<T>` |
| 인증 / 토큰 | `SignUpRequest/Response`, `LoginRequest/Response`, `SocialSignUpOrLoginRequest/Response`, `LogoutResponse`, `TokenRefreshRequest/Response`, `WithdrawResponse` |
| 프로필 | `SignUpProfileRequest/Response`, `GetProfileResponse`, `UpdateProfileRequest/Response`, `ChangePasswordRequest/Response` |
| 판매자 신청 | `SellerApplicationRequest`, `SellerApplicationStatusResponse`, `SellerApplicationListResponse`, `SellerApplicationListItem` |
| 이벤트 (구매자) | `EventListRequest`, `EventItem`, `EventListResponse`, `EventDetailResponse`, `EventSearchRequest/Response`, `EventFilterRequest/Response` |
| 이벤트 (판매자) | `SellerEventCreateRequest/Response`, `SellerEventListRequest`, `SellerEventItem`, `SellerEventListResponse`, `SellerEventDetailResponse`, `SellerEventUpdateRequest/Response`, `SellerEventStopResponse`, `ParticipantItem`, `SellerEventParticipantListRequest/Response`, `SellerEventRefundListRequest/Response` |
| 장바구니 | `CartItemDetail`, `CartItemRequest`, `AddCartItemResponse`, `CartResponse`, `CartItemQuantityRequest/Response`, `CartItemDeleteResponse`, `CartClearResponse` |
| 추천 | `RecommendationRequest`, `RecommendationResponse` |
| 주문 | `OrderRequest/Response`, `OrderListRequest`, `OrderItem`, `OrderListResponse`, `OrderDetailItem`, `OrderDetailResponse`, `OrderCancelResponse` |
| 티켓 | `TicketListRequest`, `TicketItem`, `TicketListResponse`, `TicketDetailResponse` |
| 결제 (PG) | `PaymentRequest/Response`, `PaymentConfirmRequest/Response`, `PaymentFailRequest` |
| 지갑 | `WalletChargeStartRequest/Response`, `WalletChargeConfirmRequest/Response`, `WalletBalanceResponse`, `WalletTransactionListRequest`, `WalletTransactionItem`, `WalletTransactionListResponse`, `WalletWithdrawRequest/Response` |
| 환불 | `RefundInfoResponse`, `TicketRefundRequest/Response`, `OrderRefundRequest/Response`, `RefundItem`, `RefundListResponse`, `SellerRefundItem`, `SellerRefundListResponse`, `RefundDetailResponse` |
| 정산 | `SettlementItem`, `SettlementResponse`, `SettlementEventItem`, `SettlementMonthResponse` |
| 관리자 | `AdminDashboardResponse`, `AdminEventSearchRequest`, `AdminEventItem`, `AdminEventListResponse`, `EventCancelResponse`, `UserSearchCondition`, `UserListItem`, `UserListResponse`, `AdminUserDetailResponse`, `UserStatusRequest/Response`, `UserRoleRequest/Response`, `AdminTechStackItem` |
| 기술 스택 | `TechStackItem`, `TechStackListResponse` |

### 주의 사항

- `ParticipantItem` 인터페이스가 `types.ts` 내에서 **중복 선언**됨 (272행, 288행) — 한쪽이 다른 정의를 덮어씀. 정리 필요.
- `EventSearchResponse`, `EventFilterResponse` 는 `EventListResponse` 의 type alias.
- `SellerApplicationListResponse` 가 인증 섹션과 관리자 섹션 양쪽에 등장 (109행, 781행) — 중복 선언 가능성.
- v2 규칙 상 페이지는 이 타입을 **직접 쓰지 않고** `adapters.ts` 를 거쳐 VM 으로 변환해야 함 (`docs/CLAUDE.md` 절대 규칙).

## 4. 인증

### 토큰 저장 위치

| 키 | 저장소 | 쓰는 곳 |
|---|---|---|
| `accessToken` | `localStorage` | 요청 인터셉터에서 `Authorization: Bearer …` 헤더로 주입 |
| `refreshToken` | `localStorage` | 401 발생 시 `/auth/reissue` 재발급 / `logout` 헤더 |
| `userId` | `localStorage` | 요청 인터셉터에서 `X-User-Id` 헤더로 주입 |

세 키는 다음 시점에 동시에 정리됨:
- `AuthContext.logout()` (`src/contexts/AuthContext.tsx:71`)
- `AuthContext.fetchUser()` 의 프로필 조회 실패 (`src/contexts/AuthContext.tsx:56`)
- 토큰 재발급 실패 → `/login` 강제 이동 (`src/api/client.ts:97`)

### Axios 인터셉터 (`src/api/client.ts`)

| 종류 | 위치 | 동작 |
|---|---|---|
| Request | `client.ts:36` | `accessToken` 있으면 `Authorization: Bearer …`, `userId` 있으면 `X-User-Id` 주입 |
| Response (성공) | `client.ts:53` | passthrough |
| Response (403 + `code: PROFILE_NOT_COMPLETED`) | `client.ts:60` | 현재 경로가 `/social/profile-setup`, `/oauth/callback` 가 아니면 `window.location.href = '/social/profile-setup'` |
| Response (401, 첫 시도) | `client.ts:68` 이하 | `isRefreshing` 락 + `failedQueue` 로 동시 요청 직렬화 → `${BASE_URL}/auth/reissue` 호출 → 새 access 토큰 저장 → `originalRequest._retry=true` 로 재시도 |
| Response (재시도 실패) | `client.ts:95` | 토큰 3종 제거 + `window.location.href = '/login'` |

추가 유틸:
- `unwrapApiData<T>()` — `{code,message,data}` 래퍼와 raw payload 양쪽 안전 언랩.
- `idempotencyConfig()` — `Idempotency-Key` 헤더 (UUID v4, crypto fallback 3단) — 결제/주문 중복 방지용.
- baseURL 은 `"/api"` (런타임), `BASE_URL` (= `VITE_API_BASE_URL` ?? `http://localhost:8080`) 은 토큰 재발급 호출에만 사용.

### `AuthContext` (`src/contexts/AuthContext.tsx`)

- 상태: `{ user: GetProfileResponse | null, isLoggedIn, isLoading, role: 'USER' | 'SELLER' | 'ADMIN' | null }`
- 마운트 시 `fetchUser()` → `localStorage.accessToken` 있으면 `getProfile()` 호출, 응답 `data.userId` 를 `localStorage.userId` 에 백필 + 상태 갱신.
- `getProfile` 이 403 + `PROFILE_NOT_COMPLETED` 를 던지면 토큰은 **유지**하고 비로그인 상태로만 둠 (axios 인터셉터가 다음 호출에서 `/social/profile-setup` 로 보냄).
- `login(accessToken, refreshToken)` — 두 토큰을 localStorage 에 저장 후 `fetchUser()` 재호출.
- `logout()` — 토큰 3종 제거 + 상태 초기화.
- `useAuth()` 훅: Provider 밖에서 호출 시 throw.

`AuthProvider` 는 `src/main.tsx:15` 에서 앱 루트에 마운트.

### 라우트 가드 (`src/App.tsx`)

세 가드 모두 `useAuth()` 를 사용하며, `isLoading` 동안 `<Loading fullscreen />` 노출:

| 가드 | 통과 조건 | 실패 시 이동 | 위치 |
|---|---|---|---|
| `RequireAuth` | `isLoggedIn === true` | `/login` | `App.tsx:48` |
| `RequireSeller` | `role` 이 `SELLER` 또는 `ADMIN` | `/` | `App.tsx:55` |
| `RequireAdmin` | `role` 이 `ADMIN` | `/` | `App.tsx:62` |

가드 적용 라우트:
- `RequireAuth`: `/cart`, `/payment`, `/payment/complete`, `/payment/success`, `/payment/fail`, `/mypage`, `/seller-apply`, `/wallet/charge/success`, `/wallet/charge/fail` (모두 `<Layout>` 하위)
- `RequireSeller` + `<SellerLayout>`: `/seller`, `/seller/events/create`, `/seller/events/:id`, `/seller/events/:id/edit`, `/seller/settlements`
- `RequireAdmin` + `<AdminLayout>`: `/admin`, `/admin/users`, `/admin/events`, `/admin/applications`, `/admin/settlements`, `/admin/techstacks`
- 가드 없음(공개): `/`, `/events/:id`, `/login`, `/signup`, `/signup/complete`, `/oauth/callback`, `/social/profile-setup`, `*`

## 4. 인증
(작성 예정)

## 5. 라이브러리
(작성 예정)

## 6. 프로토타입에만 있는 것
(작성 예정)

## 7. 기존에만 있는 것
(작성 예정)

## 8. SPEC.md 갱신 제안
(작성 예정)
