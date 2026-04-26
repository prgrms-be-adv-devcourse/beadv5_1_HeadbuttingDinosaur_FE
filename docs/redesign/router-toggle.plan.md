# Router Toggle 메커니즘 계획

## 1. 현재 라우터 구조 분석

### 1) 라우팅 라이브러리

- `react-router-dom` `^6.22.3` (`package.json` / INVENTORY §5).
- React Query·Remix Router 등 별도 라우팅/데이터 로더 라이브러리 없음.

### 2) 라우터 정의 파일 위치

- 마운트: `src/main.tsx:16` — `<BrowserRouter>`로 앱 전체를 감쌈.
  ```tsx
  <BrowserRouter>
    <AuthProvider><ToastProvider><App /></ToastProvider></AuthProvider>
  </BrowserRouter>
  ```
- 라우트 정의: `src/App.tsx:73` 의 단일 `<Routes>` 트리 (전체 라우트 한 파일에 평탄 선언).
- 별도 `routes.ts`/`router.tsx`/`createBrowserRouter` 사용처 없음.

### 3) 라우트 정의 방식

- **JSX 선언적 방식** (`<Routes>` + `<Route element={...}>`). 객체 기반 `createBrowserRouter([...])` 미사용.
  ```tsx
  // src/App.tsx:75
  <Route path="/login" element={<Login />} />
  ```
- 페이지 컴포넌트는 비로그인 첫 화면(EventList/EventDetail/Login/Signup/NotFound) 5개만 즉시 import, 나머지는 `lazy()` + 상위 `<Suspense fallback={<Loading fullscreen />}>` 으로 코드 스플릿 (`src/App.tsx:17-45`, `src/App.tsx:72`).

### 4) 인증 가드 패턴

- 가드 = **래퍼 컴포넌트 3종** (`src/App.tsx:48-67`). 각자 `useAuth()`로 상태 조회 → `isLoading`이면 `<Loading fullscreen />`, 실패 시 `<Navigate to="..." replace />`, 통과 시 `children` 렌더.
  ```tsx
  // src/App.tsx:48
  function RequireAuth({ children }) {
    const { isLoggedIn, isLoading } = useAuth()
    if (isLoading) return <Loading fullscreen />
    if (!isLoggedIn) return <Navigate to="/login" replace />
    return <>{children}</>
  }
  ```
- 적용 단위가 두 가지로 혼재:
  - **개별 라우트 element 감싸기** (`RequireAuth`): `/cart`, `/payment`, `/mypage`, `/seller-apply`, 결제·지갑 결과 6종 (`src/App.tsx:87-95`).
    ```tsx
    <Route path="/cart" element={<RequireAuth><Cart /></RequireAuth>} />
    ```
  - **부모 layout route element 감싸기** (`RequireSeller`/`RequireAdmin`): seller·admin 섹션 전체 (`src/App.tsx:99`, `src/App.tsx:108`).
    ```tsx
    <Route element={<RequireSeller><SellerLayout /></RequireSeller>}> ... </Route>
    ```

### 5) 레이아웃 적용 방식

- **라우트별로 다름** — 공통 레이아웃 없이 그룹별 분리.
- pathless 부모 `<Route element={<Layout/>}>`로 묶고, 자식 라우트가 `<Outlet>`에 렌더되는 v6 nested-route 패턴 (Layout 컴포넌트는 내부에서 `<Outlet />` 호출 가정).
  ```tsx
  // src/App.tsx:84
  <Route element={<Layout />}>
    <Route path="/" element={<EventList />} />
    ...
  </Route>
  ```
- 레이아웃 3종: `Layout` (일반), `SellerLayout` (판매자), `AdminLayout` (관리자).
- **레이아웃 미적용 (공개 페이지)**: `/login`, `/signup`, `/signup/complete`, `/oauth/callback`, `/social/profile-setup`, `*`(NotFound) — 모두 평탄 라우트로 `<Routes>` 직속 (`src/App.tsx:75-81`, `src/App.tsx:117`).

### 6) 동적 라우트, 중첩 라우트

- **동적 세그먼트** (`:id`) 사용:
  - `/events/:id` (`src/App.tsx:86`)
  - `/seller/events/:id` (`src/App.tsx:103`)
  - `/seller/events/:id/edit` (`src/App.tsx:102`)
- **중첩 라우트**: 레이아웃 적용을 위해서만 1단 사용 (pathless parent → child). URL 자체의 다단 중첩 매칭(`/seller/*` 와일드카드 + 내부 `<Routes>`)은 사용하지 않음. 모든 자식 path는 절대경로 형태로 평탄 선언.
- **catch-all**: `<Route path="*" element={<NotFound />} />` 1개 (`src/App.tsx:117`).

## 2. 토글 메커니즘 설계
(작성 예정)

## 3. 헬퍼 컴포넌트/훅 API 설계
(작성 예정)

## 4. 영향받는 파일 목록
(작성 예정)

## 5. 파일 생성/수정 순서
(작성 예정)
