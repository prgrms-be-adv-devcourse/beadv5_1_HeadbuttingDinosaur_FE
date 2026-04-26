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

`package.json` 기준. 카테고리별로 도입된 패키지(+버전). 명시된 의존성이 없는 카테고리는 "없음" 으로 표기.

| 카테고리 | 패키지 | 버전 | 비고 |
|---|---|---|---|
| CSS / 스타일 | — | — | CSS 라이브러리 의존성 없음. 순수 CSS 한 파일 (`src/styles/globals.css`). 프로토타입은 별도 `tokens.css` / `ide-theme.css` 사용 |
| 데이터 페칭 | `axios` | `^1.6.8` | `src/api/client.ts` 에서 단일 인스턴스 + 인터셉터. React Query/SWR 류 캐시 라이브러리 없음 |
| 라우팅 | `react-router-dom` | `^6.22.3` | `Routes`/`Route`/`Navigate` + `lazy` + `Suspense` (`src/App.tsx`) |
| 폼 | — | — | `react-hook-form`, `formik`, `zod` 등 없음. 페이지마다 `useState` 로 직접 관리 |
| 전역 상태 | — | — | Redux/Zustand/Jotai 등 없음. React Context 만 사용 (`AuthContext`, `ThemeContext`, `ToastContext`) |
| UI 프레임워크 | `react`, `react-dom` | `^18.2.0` | — |
| 빌드 / 번들러 | `vite`, `@vitejs/plugin-react` | `^5.1.6`, `^4.2.1` | scripts: `dev` / `build` / `preview` |
| 언어 / 타입 | `typescript`, `@types/react`, `@types/react-dom` | `^5.2.2`, `^18.2.64`, `^18.2.21` | — |
| 결제 / 외부 SDK | `@tosspayments/tosspayments-sdk` | `^2.6.0` | 토스페이먼츠 PG |
| 지도 | `react-kakao-maps-sdk` | `^1.2.1` | 카카오 맵 |

### 주의 사항

- 테스트 러너/린터/포매터 (Vitest, Jest, ESLint, Prettier) 의존성이 **하나도 없음** — v2 도입 검토 필요.
- Tailwind/CSS-in-JS/CSS Modules 도입되지 않음. 디자인 토큰이 코드 레벨 표준이 아니므로 v2 토큰 전략 합의 필요.
- 데이터 페칭 캐시 레이어가 없어 페이지 단에서 `useEffect` + `useState` + 자체 훅(`hooks/useApi`, `usePagedApi`) 으로 처리 중.

## 6. 프로토타입에만 있는 것

§1 의 프로토타입 매칭 표 기준, **현재 라우트가 없는** 프로토타입 산출물.

### 신규 페이지 후보

| 프로토타입 파일 | 성격 | v2 작업 |
|---|---|---|
| `prototype/Landing.jsx` | 비로그인 첫 화면 | 신규 페이지 추가 검토. 현재 `/` 는 `EventList` 가 점유 중 → 라우트 정책 결정 필요 (`/` ↔ `/events` 분리 또는 Landing 을 `/intro` 등으로) |

### 페이지 아님 (참고/공유 자산)

| 프로토타입 파일 | 성격 | v2 처리 |
|---|---|---|
| `prototype/App.jsx` | 프로토타입의 앱 엔트리 | 참고만. v2 라우트는 `src/App.tsx` 에 별도 정의 |
| `prototype/Layout.jsx` | 프로토타입 레이아웃 | `src/components-v2/` 에 새 Layout 으로 재구현 (v2 절대 규칙: 기존 `src/components/Layout.tsx` 수정 금지) |
| `prototype/common.jsx` | 공통 UI 컴포넌트 모음 | 페이지 작업 시 단위 컴포넌트로 분해해 `src/components-v2/` 에 옮김 |
| `prototype/tokens.css` | 디자인 토큰 (색/타이포/스페이싱) | `src/styles-v2/` 에 토큰 파일로 이식. v2 토큰 표준의 출발점 |
| `prototype/ide-theme.css` | IDE 테마 변형 스타일 | `tokens.css` 와 함께 `src/styles-v2/` 로 이식 (테마 적용 범위 합의 필요) |
| `prototype/DevTicket IDE.html` | 정적 HTML 데모 | 참고만. 코드 이식 대상 아님 |
| `prototype/assets/` | 이미지/아이콘 등 | 사용되는 자산만 `src/assets-v2/` 또는 `public/` 으로 이식 |

## 7. 기존에만 있는 것

§1 의 매칭 표 기준, 프로토타입에 **시각 디자인이 없는** 기존 페이지. 리뉴얼 PR 단위로 처리 정책을 정해야 함.

### 인증 / 회원 가입 플로우

| 라우트 | 파일 | 권장 처리 |
|---|---|---|
| `/signup` | `pages/Signup.tsx` | 프로토타입 `Login.jsx` 의 디자인 톤을 확장해 v2 신규 디자인 작성 필요 |
| `/signup/complete` | `pages/SignupComplete.tsx` | 결과 페이지 — 프로토타입 패턴 재사용해 단순 안내 페이지로 |
| `/oauth/callback` | `pages/OAuthCallback.tsx` | UI 거의 없음 (콜백 처리/리다이렉트). 로직 이전만 |
| `/social/profile-setup` | `pages/SocialProfileSetup.tsx` | `Signup` 과 폼 공유 — Signup v2 작업과 함께 묶어서 진행 |

### 결제 / 지갑 후속 라우트

| 라우트 | 파일 | 권장 처리 |
|---|---|---|
| `/payment` | `pages/Payment.tsx` | 프로토타입 `Cart.jsx` 디자인 라인 연장. 신규 디자인 필요 |
| `/payment/complete` | `pages/PaymentComplete.tsx` | 결과 페이지 (PG 콜백). 단순 안내로 v2 작성 |
| `/payment/success` | `pages/PaymentSuccess.tsx` | 동일 — 결과 페이지 |
| `/payment/fail` | `pages/PaymentFail.tsx` | 동일 — 결과 페이지 |
| `/wallet/charge/success` | `pages/WalletChargeSuccess.tsx` | 동일 — 결과 페이지 |
| `/wallet/charge/fail` | `pages/WalletChargeFail.tsx` | 동일 — 결과 페이지 |

### 판매자 신청 / 공통

| 라우트 | 파일 | 권장 처리 |
|---|---|---|
| `/seller-apply` | `pages/SellerApply.tsx` | 신규 디자인 필요 (프로토타입 `MyPage.jsx` 톤 참고) |
| `*` | `pages/NotFound.tsx` | 단순 페이지 — v2 신규 작성 |

### 판매자 콘솔 (`/seller/*`) — 프로토타입 디자인 없음

| 라우트 | 파일 | 권장 처리 |
|---|---|---|
| `/seller` | `pages/seller/SellerDashboard.tsx` | **리뉴얼 1차 SKIP 후보**. 콘솔은 별도 디자인 트랙으로 분리 |
| `/seller/events/create` | `pages/seller/SellerEventCreate.tsx` | SKIP 또는 별도 처리 |
| `/seller/events/:id/edit` | `pages/seller/SellerEventEdit.tsx` | SKIP 또는 별도 처리 |
| `/seller/events/:id` | `pages/seller/SellerEventDetail.tsx` | SKIP 또는 별도 처리 |
| `/seller/settlements` | `pages/seller/SellerSettlement.tsx` | SKIP 또는 별도 처리 |

### 관리자 콘솔 (`/admin/*`) — 프로토타입 디자인 없음

| 라우트 | 파일 | 권장 처리 |
|---|---|---|
| `/admin` | `pages/admin/AdminDashboard.tsx` | **리뉴얼 1차 SKIP 후보** (관리자 전용, 외부 노출 X) |
| `/admin/users` | `pages/admin/AdminUsers.tsx` | SKIP |
| `/admin/events` | `pages/admin/AdminEvents.tsx` | SKIP |
| `/admin/applications` | `pages/admin/AdminApplications.tsx` | SKIP |
| `/admin/settlements` | `pages/admin/AdminSettlements.tsx` | SKIP |
| `/admin/techstacks` | `pages/admin/AdminTechStacks.tsx` | SKIP |

### 정리

- **신규 디자인 필수** (구매자 동선): `Signup`, `SignupComplete`, `SocialProfileSetup`, `Payment`, `Payment*` 결과, `Wallet*` 결과, `SellerApply`, `NotFound` — 총 11개
- **로직만 이식** (UI 없음): `OAuthCallback`
- **리뉴얼 SKIP 후보** (별도 트랙): `seller/*` 5개 + `admin/*` 6개 = 총 11개

## 7. 기존에만 있는 것
(작성 예정)

## 8. SPEC.md 갱신 제안

`docs/redesign/Spec.md` 의 § 9, § 10 표를 INVENTORY 기준으로 다음과 같이 갱신할 것을 제안. (실제 수정은 별도 PR.)

### § 9 — "범위 밖 페이지 / 항목" 갱신 제안

**현재 § 9 「프로토타입에 없는 기존 페이지」 표** — 큰 골자는 맞지만 다음 두 가지를 명확화:

| 변경 포인트 | 제안 |
|---|---|
| `seller/*`, `admin/*` 표기 | 단순 "현행 유지" 대신 §7 분류대로 **"리뉴얼 1차 SKIP, 별도 콘솔 트랙"** 으로 명시. 5+6=11개 라우트 전체를 개별 행으로 풀어쓸지(가시성↑) 그룹으로 둘지(간결성↑) 합의 |
| `/payment*`, `/wallet/charge/*` 결과 페이지 | "기존 결제 플로우 유지" 대신 **"신규 디자인 필수 — 단순 안내 페이지 6종"** 으로 격상 (§7 분류) |
| `/seller-apply` | "기존 유지" → **"신규 디자인 필요 (MyPage 톤 참고)"** 로 격상 |

**현재 § 9 「기존에 없는 프로토타입 항목」 표** — 다음 행 추가 제안:

| 추가 항목 | 처리 제안 근거 |
|---|---|
| `prototype/tokens.css` | §6: `src/styles-v2/` 토큰 표준 출발점. v2 토큰 정책의 단일 소스로 채택 |
| `prototype/ide-theme.css` | §6: 테마 변형. 적용 범위(전역/페이지) 합의 후 `src/styles-v2/` 이식 |
| `prototype/common.jsx` | §6: 단위 컴포넌트로 분해해 `src/components-v2/` 로 이식. 분해 단위 = SPEC 의 페이지별 컴포넌트 표와 정합 필요 |
| `prototype/Layout.jsx` | 이미 § 7 / § 9 에 `IDE Layout chrome` 으로 반영됨. **출처 파일명 명시** 권장 |

**현재 § 9 「의사결정 보류」 표** — INVENTORY 와 일치하므로 추가 결정 사항만 보강:

| 추가 항목 | 제안 상태 |
|---|---|
| 테스트/린트/포매터 도입 | INVENTORY §5: 현재 의존성 0개. v2 시작 시점에 도입 여부 결정 필요 (Vitest/ESLint/Prettier) |
| Landing 라우트 정책 | INVENTORY §6: 현재 `/` = `EventList`. Landing 을 `/` 로 옮기고 EventList 는 `/events` 로 갈지, Landing 을 별도 경로로 둘지 결정 |
| `src/api/types.ts` 중복 정의 정리 | INVENTORY §3: `ParticipantItem` (272행/288행), `SellerApplicationListResponse` (109행/781행) 중복. v2 작업 전 정리 필요 |

### § 10 — "API 재활용 가이드" 갱신 제안

**§ 10 「페이지별 의존 API」 표 정정** — INVENTORY §2 의 실제 import 기준으로 다음 행을 수정:

| 페이지 | 현재 SPEC 기재 | 제안 (실제 코드 기준) |
|---|---|---|
| EventList | `getEvents`, `searchEvents`, `getCategorySummary`, `recommendEvents`, `getTechStacks`, `extractTechStacks` | `getEvents`, `searchEvents`, **`filterEvents`**, `getTechStacks`, `extractTechStacks` <br>(`getCategorySummary` 는 코드에 **존재하지 않음**, `recommendEvents` 는 EventList 가 아니라 **Cart 가 사용**) |
| Cart | `getCart`, `addCartItem`, `clearCart`, `createOrder`, `recommendEvents` | `getCart`, `addCartItem`, `clearCart`, `createOrder`, `recommendEvents`, **`getEventDetail`**, **`unwrapApiData`** 추가 |
| EventDetail | `getEventDetail`, `addCartItem` | 동일 (정확함) |
| Login | `login` | 동일 (정확함). 단 OAuth 는 별도로 `OAuthCallback` 행 추가 권장 |
| MyPage | (장문) | INVENTORY §2 표와 1:1 일치 — 정확함 |
| Landing | `getEvents` 기반 (TBD) | 신규 페이지: `getEvents` + `getEventRecommendations`(현재 미사용 모듈 `ai.api.ts`) 활용 후보 |
| Layout | `logout` (+ 인증 컨텍스트) | `logout` + `useAuth()` (위치: `src/contexts/AuthContext.tsx`). 인증 컨텍스트 위치 명시 권장 |

**§ 10 「어댑터 예시」 코드 정정**:

| 위치 | 현재 SPEC | 제안 |
|---|---|---|
| `import type { ApiEvent } from '@/types/api';` | — | INVENTORY §3: `src/types/` 폴더는 **존재하지 않음**. 실제 타입은 `@/api/types`. 예시 코드를 `import type { EventItem } from '@/api/types';` 로 정정 |
| 어댑터 입력 타입 | `ApiEvent` (가상) | 실제 도메인 타입명인 `EventItem` 으로 통일. 그래야 v2 페이지가 import 시점에 typo 없음 |

**§ 10 「데이터 페칭 훅」 코드 정정**:

| 항목 | 현재 SPEC | 제안 |
|---|---|---|
| `useQuery` 예시 | React Query 가정 | INVENTORY §5 + § 9 의사결정 보류: **React Query 미도입 확정**. 예시를 `usePagedApi` / `useApi` (`src/hooks/`) 기반으로 교체. SPEC 본문과 코드 예시가 어긋나지 않게 정렬 |

**§ 10 「API 매핑」 템플릿 보강**:

INVENTORY §2 에서 발견한 함수 시그니처를 기준으로 `EventItem` (`src/api/types.ts:132`) 의 실제 필드와 프로토타입 mock 의 차이를 채울 수 있도록, 페이지별 plan 템플릿에 **"실제 타입 위치(`src/api/types.ts:LINE`)"** 컬럼을 추가 제안. 예:

```markdown
## API 매핑
| 프로토타입 mock 필드 | 실제 API 필드 | 실제 타입 위치 | 비고 |
|---|---|---|---|
| event.eventId | event.id | src/api/types.ts:132 (EventItem) | 필드명 차이 |
```

### § 0 (공통 규칙) 부수 갱신 제안

INVENTORY §4 (인증) 발견 사항을 § 0 에 명시 권장:

- 토큰 저장 위치: `localStorage` 키 3종 (`accessToken`, `refreshToken`, `userId`) — v2 페이지에서 직접 접근 금지, 반드시 `useAuth()` 경유.
- 401 자동 재발급은 `apiClient` 인터셉터가 처리하므로 **페이지 어댑터는 401 분기 작성 금지**.
- 403 + `code: PROFILE_NOT_COMPLETED` 는 인터셉터가 `/social/profile-setup` 으로 강제 이동시키므로 페이지에서 별도 처리 불필요.
- `idempotencyConfig()` 는 결제/주문 등 멱등성 필요한 호출에서 명시적으로 사용 — § 10 에 사용 가이드 추가 권장.
