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

### 1) 토글 신호 소스

세 채널 모두 채택. 역할 분리:

- **`?v=2` / `?v=1`** — URL 쿼리. 가장 명시적·일회성. PR 미리보기 링크/QA 공유용.
- **`localStorage['ui.version']`** — 세션 내 끈끈한 선호. 한 번 `?v=2` 로 들어오면 이후 모든 내부 이동(쿼리 미보존되는 `<Link>` 포함)에서 유지하려면 sticky 저장이 필요. (`?v=1` 입력 시 명시적으로 키 제거.)
- **`VITE_UI_DEFAULT_VERSION`** (env) — 전역 기본값. 스테이징=v2 강제, 프로덕션=v1 같은 환경별 기본 톤 결정.

근거: 쿼리만 쓰면 페이지 이동마다 사라지고, env만 쓰면 한 사용자만 v2 보기를 못 함. 셋을 우선순위로 합치는 게 운영비용 최소.

### 2) 우선순위

높음 → 낮음:

1. URL 쿼리 (`?v=2` / `?v=1`) — 명시 입력은 무조건 승.
2. `localStorage['ui.version']` — 직전 세션 선호.
3. `VITE_UI_DEFAULT_VERSION` env — 환경 기본값.
4. 모두 없으면 `'1'` (현행 유지).

근거: URL은 사람이 방금 친 것이므로 최우선, env는 빌드 타임 기본값이라 최후. URL 처리 시 sideeffect로 localStorage에 동기화 → 이후 내부 `<Link>` 이동에서도 유지 (§5 참조).

### 3) 새 라우트 추가 vs 기존 라우트 wrapping

**기존 라우트 element 를 `<VersionedRoute v1={...} v2={...} />` 헬퍼로 wrapping** 채택. `/v2/cart` 같은 별도 path 신설은 비채택.

근거 (§1 기반):
- §1-3: 라우트 정의가 `src/App.tsx` 한 파일의 JSX 선언이라, **element만 헬퍼로 교체**하면 `path`/가드/레이아웃 nesting 트리를 그대로 유지할 수 있음. 별도 path를 만들면 §1-5의 Layout/SellerLayout/AdminLayout 트리를 v2용으로 전부 복제해야 함 (중복 폭발).
- §1-4: 가드(`RequireAuth` 등)도 wrapping 컴포넌트라 합성이 자연스러움 — `<RequireAuth><VersionedRoute v1={...} v2={...} /></RequireAuth>` 식으로 한 줄에 끝.
- 사용자에게 노출되는 URL이 동일하게 유지되므로 북마크/공유 링크/외부 리다이렉트(예: 토스 PG 콜백 `/payment/success`) 가 깨지지 않음. 이는 `/v2/*` 신설안으로는 불가.
- v2 페이지 1개 도입 = `App.tsx` 한 줄 element 교체. 분기 코드는 헬퍼 한 곳에만 존재 (§4 참조).

### 4) v2 컴포넌트 미존재 시 fallback

**Props 부재 = 자동 v1 렌더**. 헬퍼 시그니처:

```tsx
<VersionedRoute v1={<Cart />} v2={<CartV2 />} />   // v2 도입 페이지
<VersionedRoute v1={<Payment />} />                // v2 미도입 (자동 fallback)
```

동작: 활성 버전이 `'2'`이고 `v2` prop이 truthy면 v2 element, 그 외 모두 v1. 즉 v2 prop을 안 넘기면 토글이 켜져 있어도 조용히 v1 렌더.

근거: 요구사항 "v2 페이지가 없는 라우트는 기존 그대로". 별도 manifest/매핑 테이블 없이 **`App.tsx` 라우트 한 줄이 단일 진실 공급원**이 되어 누락 가능성 0. 동적 import + ErrorBoundary 방식은 v2 진행도가 일정치 않은 현 단계엔 과설계.

### 5) 토글 상태가 페이지 이동 시 유지되는지

**유지됨.** 단 쿼리스트링 자동 부착이 아니라 **localStorage 동기화 방식**으로 해결.

메커니즘:
- 헬퍼/훅이 마운트 시 URL의 `?v=` 값을 읽음 → 있으면 즉시 `localStorage['ui.version']`에 기록 (`?v=1`은 키 제거).
- 이후 내부 `<Link to="/cart">` 이동으로 쿼리가 사라져도, 다음 라우트의 헬퍼가 localStorage 값을 읽어 v2 유지.
- 외부에서 직접 입력한 URL(쿼리 없는 상태)도 동일하게 localStorage 우선.

근거:
- §1-3: 모든 내부 이동은 `react-router-dom` v6 `<Link>` / `<Navigate>` 기반인데 v6 기본 동작은 쿼리 미보존. 모든 `<Link>` 사용처를 패치하는 비용 > localStorage sync 한 곳 비용.
- §1-4 가드들이 이미 `<Navigate to="/login" replace />` 같은 쿼리 없는 redirect를 쓰고 있어, 쿼리 보존 전략은 가드까지 모두 손대야 성립 → 비현실적.
- localStorage 방식은 명시적 끄기(`?v=1`)와 자연스러운 만료(브라우저 데이터 삭제) 둘 다 지원.

## 3. 헬퍼 컴포넌트/훅 API 설계

### 채택 옵션: A (컴포넌트 wrapper) + 보조 훅

이름: `<VersionedRoute>` (메인) + `useUiVersion()` (보조).

**왜 옵션 A인가**:
- §1-3: 라우터가 `<Route element={...}>` JSX 선언 방식이라, element 슬롯에 그대로 꽂히는 컴포넌트가 가장 적은 구조 변경으로 들어감. 옵션 C는 `createBrowserRouter([...])` 객체 정의 방식 전제 → §1과 어긋남.
- §1-4: 가드(`RequireAuth` 등)가 wrapping 컴포넌트라 `<RequireAuth><VersionedRoute .../></RequireAuth>` 합성이 자연스러움. 옵션 B(훅)는 page 본체 또는 별도 라우트 컴포넌트에 코드를 또 넣어야 해 §2의 "분기 코드 중복 없게" 위배.
- §2-4: v2 prop 부재 = 자동 fallback. 컴포넌트 props로 표현하면 호출부 한 줄에서 의도가 드러남.

### 시그니처

```ts
// src/router-v2/VersionedRoute.tsx (이름·경로 안)

type UiVersion = '1' | '2'

type VersionedRouteProps = {
  v1: React.ReactElement                 // 필수: 기존 페이지
  v2?: React.ReactElement                // 옵션: v2 페이지 (없으면 자동 v1)
}

declare function VersionedRoute(props: VersionedRouteProps): React.ReactElement

// 보조 훅 (UI 버전을 알아야 하는 비-라우트 컴포넌트, 예: 디버그 토글 배지용)
declare function useUiVersion(): UiVersion
```

**동작 요약** (§2 결정 반영, 구현은 ## 5에서):
- `VersionedRoute` 는 내부에서 `useUiVersion()` 호출.
- `useUiVersion` 우선순위: `URLSearchParams.get('v')` → `localStorage['ui.version']` → `import.meta.env.VITE_UI_DEFAULT_VERSION` → `'1'`. URL 값이 있으면 `useEffect` 로 localStorage 동기화 (v=1이면 키 제거).
- 활성 버전이 `'2'` && `v2` truthy → `v2` 반환, 그 외 `v1`.
- 반환값은 단일 `ReactElement` (Suspense·Outlet과 트리상 동일 위치라 `<Route element={...}>` 슬롯에 그대로 적합).

### 사용 예시 — `src/App.tsx` 에 들어가는 형태

```tsx
{/* 단순 교체: 공개 라우트 */}
<Route path="/login" element={<VersionedRoute v1={<Login />} v2={<LoginV2 />} />} />

{/* 가드와 합성: §1-4 RequireAuth 패턴 그대로 유지 */}
<Route path="/cart"
  element={<RequireAuth><VersionedRoute v1={<Cart />} v2={<CartV2 />} /></RequireAuth>} />

{/* v2 미존재 → v2 prop 생략 → 토글 켜져 있어도 자동으로 v1 렌더 (§2-4) */}
<Route path="/payment"
  element={<RequireAuth><VersionedRoute v1={<Payment />} /></RequireAuth>} />
```

페이지별 v2 도입 = 위 한 줄에 `v2={<XxxV2 />}` 만 추가. 분기 로직은 `VersionedRoute` 한 곳에만 존재 (§2 요구사항 충족).

## 4. 영향받는 파일 목록

### 신규 (`src/router-v2/` 디렉토리 신설)

`-v2` 접미사 규약(`docs/CLAUDE.md`)에 맞춰 라우팅 인프라 전용 디렉토리 분리. 기존 `src/components/`, `src/pages/` 와 격리.

| 경로 | 신/수 | LOC(대략) | 핵심 변경 |
|---|---|---|---|
| `src/router-v2/useUiVersion.ts` | 신규 | ~25 | `UiVersion` 타입 + `useUiVersion()` 훅. `URLSearchParams` → `localStorage['ui.version']` → `import.meta.env.VITE_UI_DEFAULT_VERSION` 순 우선순위 해석 + URL 값 발견 시 `useEffect` 로 localStorage 동기화 (§2-2, §2-5) |
| `src/router-v2/VersionedRoute.tsx` | 신규 | ~15 | §3 시그니처(`v1: ReactElement`, `v2?: ReactElement`) 그대로. 내부에서 `useUiVersion()` 호출 → `'2'` && `v2` 면 `v2`, 아니면 `v1` 반환 |
| `src/router-v2/index.ts` | 신규 | ~3 | barrel: `VersionedRoute`, `useUiVersion`, `UiVersion` 재수출 |

### 수정

| 경로 | 신/수 | LOC(대략) | 핵심 변경 |
|---|---|---|---|
| `.env.development` | 수정 | +1 | `VITE_UI_DEFAULT_VERSION=1` 한 줄 추가 (env 채널 §2-1 활성화, 누락 시 `'1'` fallback이라 동작은 동일하지만 노출용) |
| `src/api/.env.example` | 수정 | +1 | 동일 변수 한 줄 주석과 함께 추가 (앱 전역 변수지만 현 프로젝트에 다른 `.env.example` 가 없어 여기 같이 둠) |

### 의도적으로 손대지 않는 파일

| 경로 | 이유 |
|---|---|
| `src/App.tsx` | 라우트 wiring(`element={<VersionedRoute .../>}` 교체)은 v2 페이지 도입 PR 단위로 한 줄씩 진행. 본 PR에서 미리 wrap 해두면 v2 prop 부재 라우트가 모두 헬퍼를 거치게 되어 회귀 위험만 늘림 (현 시점 v2 페이지 0개) |
| `src/main.tsx`, `BrowserRouter` 마운트 | URL 쿼리는 `URLSearchParams(window.location.search)` 로 직접 읽으므로 라우터 마운트 변경 불필요 |
| `src/contexts/*` | 토글은 라우팅 레이어 책임. AuthContext 류 전역 컨텍스트에 결합하지 않음 (단순화 + 테스트 용이) |
| `package.json` | 신규 의존성 없음 (react-router-dom, React만으로 구현) |

총 변경: 신규 3 파일(~43 LOC) + 수정 2 파일(+2 LOC).

## 5. 파일 생성/수정 순서

### Step 1 — 헬퍼 모듈 신규 작성 (1 commit)

순서:
1. `src/router-v2/useUiVersion.ts` 작성 (의존성 없음 — React + 브라우저 API만).
2. `src/router-v2/VersionedRoute.tsx` 작성 (Step 1.1 의 훅 사용).
3. `src/router-v2/index.ts` 작성 (위 둘 barrel).

세 파일은 한 커밋으로 묶음 (서로 1:1 결합, 분할 시 중간 커밋이 빌드 깨짐).

권장 commit 메시지: `feat(router-v2): add VersionedRoute toggle helper`

### Step 2 — env 변수 노출 (1 commit)

1. `.env.development` 에 `VITE_UI_DEFAULT_VERSION=1` 추가.
2. `src/api/.env.example` 에 동일 변수 + `# 1 또는 2. 미설정 시 1` 한 줄 주석 추가.

권장 commit 메시지: `chore(env): document VITE_UI_DEFAULT_VERSION`

### Step 3 — 메커니즘 검증 (커밋 없음, 로컬 임시 작업)

App.tsx 미변경 상태에선 헬퍼가 호출되지 않으므로, 다음을 **로컬에서만** 적용 후 확인 → **반드시 되돌리고 커밋하지 않음**.

검증용 임시 패치 (`src/App.tsx`):
```tsx
import { VersionedRoute } from './router-v2'

// /login 라우트 한 줄을 임시로 교체
<Route path="/login"
  element={<VersionedRoute v1={<Login />} v2={<div>V2 DUMMY</div>} />} />
```

`npm run dev` 후 다음 케이스 수동 확인:

| # | 동작 | 기대 결과 | 검증 항목 |
|---|---|---|---|
| 1 | `/login` 접속 | `<Login>` 렌더 | 기본값 `'1'` (§2-2 4단계) |
| 2 | `/login?v=2` 접속 | "V2 DUMMY" 렌더 + DevTools에서 `localStorage.getItem('ui.version') === '2'` | URL 파싱 + localStorage 동기화 (§2-5) |
| 3 | (#2 직후) `/` 클릭 → `/login` 로 다시 이동 (쿼리 없이) | "V2 DUMMY" 유지 | §2-5 sticky 동작 |
| 4 | `/login?v=1` 접속 | `<Login>` + `localStorage.getItem('ui.version') === null` | URL `v=1` 명시 시 키 제거 |
| 5 | 쿼리 제거 후 v2 prop 빼고 `<VersionedRoute v1={<Login />} />` 로 임시 변경 → `/login?v=2` 접속 | `<Login>` 그대로 | v2 미존재 자동 fallback (§2-4) |

5케이스 통과 후 App.tsx 임시 수정 전부 revert (예: `git checkout -- src/App.tsx`). 이 PR 의 최종 diff 에는 App.tsx 변경 없음.

### Step 4 — push & PR 본문에 검증 결과 5케이스 OK 명시

PR 리뷰어가 동일 절차로 재현할 수 있도록 §5 Step 3 표를 PR 설명에 그대로 인용.
