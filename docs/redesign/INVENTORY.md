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
(작성 예정)

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
