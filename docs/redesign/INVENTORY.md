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
(작성 예정)

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
