# Login 페이지 v2 계획

## 1. 페이지 디렉토리 구조

Login은 단일 폼 1개로 구성된 작은 페이지라 SPEC § 0의 표준 구조를 그대로 따르지 않고 일부 파일은 생략한다.

```
src/pages-v2/Login/
├── index.tsx        ← 라우트 진입점
├── Login.tsx        ← 프레젠테이션 (카드 + 폼 마크업)
└── hooks.ts         ← useLoginForm (폼 상태 + submit + 에러 매핑 + 리다이렉트)
```

### 실제로 만들 파일

| 파일 | 역할 |
|---|---|
| `index.tsx` | 라우트 진입점. 이미 로그인된 상태면 메인/`returnTo`로 리다이렉트. 인증 컨텍스트와 `useLoginForm`을 결합해 `Login.tsx`에 props로 주입. |
| `Login.tsx` | 프레젠테이션 컴포넌트. 로고/헤더/카드/폼/회원가입 링크 마크업. 상태는 props로만 받고 자체 fetch 로직 없음. |
| `hooks.ts` | `useLoginForm` 훅. 이메일/비밀번호/에러/로딩 로컬 상태, 클라이언트 검증, `src/api/auth.api.ts#login` 호출, HTTP 상태별 에러 메시지 매핑(401/422/5xx), 성공 시 토큰 저장 + `returnTo` 리다이렉트. |

### 생략 파일 + 사유

| 생략 파일 | 사유 |
|---|---|
| `components/` | 페이지 전용 서브 컴포넌트 없음. 입력 필드/버튼은 모두 Phase 1 공용 컴포넌트(`Input`, `Button`)로 처리. 분해할 단위가 안 나옴. |
| `adapters.ts` | API 응답(`{ accessToken, refreshToken, user }`)을 별도 VM으로 변환할 필요 없음. 토큰은 `src/lib/auth`로 그대로 넘기고, `user`는 기존 도메인 타입(`src/types/`)을 그대로 사용. UI가 소비할 추가 가공 필드 없음. 에러 매핑은 도메인 변환이 아닌 사용자 메시지 결정이므로 `hooks.ts`에서 처리. |
| `types.ts` | 페이지 고유 VM 타입 없음. 폼 상태 타입(`LoginFormState`, `LoginFieldErrors`)은 사용 범위가 `hooks.ts` ↔ `Login.tsx` 두 곳뿐이라 `hooks.ts` 내부에 인라인 정의하고 `export`. 별도 파일 분리는 과잉. 추후 폼이 커지면 그때 분리. |

## 2. 컴포넌트 분해

§1에서 `components/` 디렉토리를 생략하기로 했으므로, 아래 서브 블록은 모두 **`Login.tsx` 내부의 named 함수 컴포넌트**로 둔다(파일 분리 X). Phase 0 공용 컴포넌트는 그 안에서 호출.

### 분해 표

| 이름 | 역할 | 위치 (파일) | props 시그니처 |
|---|---|---|---|
| `LoginPage` | 라우트 진입점. 인증 상태 확인 → 이미 로그인이면 `returnTo`/메인으로 redirect, 아니면 `useLoginForm()` 호출하여 `<LoginView>` 렌더 | `src/pages-v2/Login/index.tsx` | `()` (라우트 컴포넌트, props 없음) |
| `LoginView` | 페이지 전체 마크업(에디터 스크롤 + gutter + 460px 중앙 카드 컨테이너). 하위 4개 블록 조합 | `src/pages-v2/Login/Login.tsx` (default export) | `{ form: LoginFormState; errors: LoginFieldErrors; loading: boolean; onChangeEmail: (v: string) => void; onChangePassword: (v: string) => void; onSubmit: (e: FormEvent) => void; signupHref: string }` |
| `BrandHeader` | DT 마크(36×36 brand bg, mono 14px) + "DevTicket" 워드마크 | `Login.tsx` 내부 named 컴포넌트 | `()` (정적, props 없음) |
| `PageHeading` | "로그인" 타이틀(22px semibold) + 서브카피(14px text-3) | `Login.tsx` 내부 named 컴포넌트 | `()` (문구 고정, props 없음) |
| `LoginForm` | `<form>` + 이메일/비밀번호 `Input` + 제출 `Button`. 로딩/에러 상태 반영 | `Login.tsx` 내부 named 컴포넌트 | `{ email: string; password: string; errors: LoginFieldErrors; loading: boolean; onChangeEmail: (v: string) => void; onChangePassword: (v: string) => void; onSubmit: (e: FormEvent) => void }` |
| `SignupCallout` | 카드 하단 구분선 + "아직 계정이 없으신가요? 회원가입" 링크 | `Login.tsx` 내부 named 컴포넌트 | `{ href: string }` (라우트 결정은 §7에서 확정) |

### Phase 0/1 공용 컴포넌트 사용처 (`src/components-v2/`)

| 공용 컴포넌트 | 사용 위치 | 비고 |
|---|---|---|
| `Card` (flat-card 변형) | `LoginView` — 폼/회원가입 안내를 감싸는 28px padding 카드 | `<Card padding={28}>...</Card>` 형태. 프로토타입의 `flat-card` 클래스 대체 |
| `Input` (label + error 포함) | `LoginForm` — 이메일/비밀번호 두 곳 | label/error/value/onChange/type/placeholder props 사용. 에러 시 `var(--danger)` 보더 + 하단 `× 메시지` 처리는 Input 내부 책임 |
| `Button` (`primary` + `full` + `lg` variant) | `LoginForm` — 제출 버튼 | `<Button variant="primary" size="lg" fullWidth disabled={loading}>`. 로딩 시 자식으로 `<Icon name="spinner" />` + "로그인 중..." 텍스트 |
| `Icon` | `LoginForm` 로딩 스피너 | 프로토타입의 `◐` 글리프 회전을 Icon 컴포넌트의 `spinner` 항목으로 대체. 없으면 추가 (의사결정 §7) |
| `Layout` chrome (사이드바/탭/상태바) | `LoginPage` 바깥(라우터 레벨) | Login도 IDE chrome 안에서 렌더되는지 의사결정 필요 (§7). 기본 가정: 비로그인 페이지는 chrome 없이 단독 |

### 사용하지 않는 공용 컴포넌트

`Eyebrow pill`, `StatusChip`, `Chip`, `Kbd`, `SectionHead` — Login 화면에 해당 UI 패턴 없음.

## 3. API 매핑 테이블

### 실제 API 시그니처 (확인 결과)

- 함수: `login(body: LoginRequest)` (`src/api/auth.api.ts:22`)
  ```ts
  export const login = (body: LoginRequest) =>
    apiClient.post<ApiResponse<LoginResponse>>('/auth/login', body);
  ```
- 요청 타입 (`src/api/types.ts:18`): `LoginRequest = { email: string; password: string }`
- 응답 타입 (`src/api/types.ts:22`): `LoginResponse = { accessToken: string; refreshToken: string }`
  - **주의**: SPEC § 1 에 적힌 `{ accessToken, refreshToken, user }` 와 달리 실제 응답엔 `user` 가 없다. 사용자 정보는 로그인 직후 `getProfile()` 별도 호출로 채움 (AuthContext 가 처리).
- 응답 래퍼: `apiClient` 의 `ApiResponse<T> = { code, message, data: T }`. 실제 사용 시 `res.data.data` 또는 `unwrapApiData(res)` 로 언랩.

### 프로토타입 ↔ 실제 매핑

| 프로토타입 mock 동작 | 실제 API 함수 | 요청 파라미터 | 응답 형태 | 변환 필요 |
|---|---|---|---|---|
| `setTimeout(() => login(email.split('@')[0]), 500)` 가짜 지연 + email prefix 를 username 으로 전달 | `login` (`src/api/auth.api.ts:22`) | `{ email: string, password: string }` (LoginRequest) | `ApiResponse<LoginResponse>` → `{ code, message, data: { accessToken, refreshToken } }` | mock 의 `login(username)` 콜백을 → 실 토큰 2종을 받아 `useAuth().login(accessToken, refreshToken)` 호출로 교체. **사용자 정보는 응답에 없음** — AuthContext 가 후속 `getProfile()` 으로 채움 (이 plan 범위 밖). 응답 언랩에 `unwrapApiData()` 사용 (`src/api/client.ts`). |
| 회원가입 링크 `onClick={() => login('new_user')}` (가짜) | — (Login 페이지 직접 호출 없음) | — | — | 단순 `<Link to="/signup">` 라우터 네비게이션으로 대체. SPEC § 9 기준 `/signup` 은 기존 페이지 유지(범위 밖). |
| (mock) 클라이언트 이메일 정규식 검증만 존재 | (없음 — 클라 검증) | — | — | `useLoginForm` 내부에서 동일하게 처리. 서버 호출 전에 단락. |

### 에러 응답 매핑

`src/api/client.ts` 의 axios 인터셉터가 401 발생 시 `/auth/reissue` 자동 시도 후 실패하면 토큰 3종 제거 + `/login` 리다이렉트. **그러나 `/auth/login` 호출 자체의 401 은 자격증명 오류이지 토큰 만료가 아님.** 인터셉터가 `reissue` 를 시도해 실패 → 페이지 catch 블록이 거의 동시에 도달하므로 사용자에겐 catch 블록에서 띄우는 메시지가 보임. 이 부작용 회피는 §7 의사결정 항목으로 둠.

| HTTP 상태 | API 에러 코드 (예상) | UI 메시지 | 비고 |
|---|---|---|---|
| 400 | `INVALID_REQUEST` 등 | "요청 형식이 올바르지 않습니다." | 클라 검증을 통과한 경우만 발생. 디버그 로그만, 사용자에겐 일반 메시지. |
| 401 | `INVALID_CREDENTIALS` (계정/비번 불일치) | "이메일 또는 비밀번호가 일치하지 않습니다." | SPEC § 1 명시 메시지. 인터셉터 reissue 부작용 → §7 결정. |
| 403 | `ACCOUNT_LOCKED` / `ACCOUNT_DISABLED` | "계정이 잠겼거나 비활성화되었습니다. 관리자에게 문의하세요." | 코드 명세 미확정 → 서버 응답 확인 후 갱신. |
| 422 | 필드별 검증 에러 (`errors: { email?, password? }`) | 필드 하단에 메시지 매핑. fallback "입력값을 확인해주세요." | 실제 응답 스키마 확인 후 어댑터 작성. 미확정이면 일반 메시지로 처리. |
| 429 | `TOO_MANY_REQUESTS` | "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." | 백엔드 rate-limit 도입 여부 확인 필요(§7). |
| 5xx | — | "일시적인 오류입니다. 잠시 후 다시 시도해주세요." | SPEC § 1 명시 메시지. |
| 네트워크 / 타임아웃 | (axios `code === 'ERR_NETWORK'` 등) | "네트워크 연결을 확인해주세요." | `axios.isAxiosError(err) && !err.response` 분기. |
| 그 외 | — | "로그인에 실패했습니다. 잠시 후 다시 시도해주세요." | unknown fallback. |

### 토큰 저장 방법 (기존 패턴 그대로 따름)

INVENTORY § 4 / `src/contexts/AuthContext.tsx:65` 기준.

- **저장소**: `localStorage`. cookie / sessionStorage 미사용. (기존 패턴 — 변경 시 별도 의사결정 필요)
- **저장 키**:
  - `accessToken` — `LoginResponse.accessToken` 값 그대로
  - `refreshToken` — `LoginResponse.refreshToken` 값 그대로
  - `userId` — Login 단계에서 직접 저장하지 **않음**. AuthContext 가 `login()` 직후 `fetchUser()` → `getProfile()` 응답의 `userId` 를 백필.
- **사용 함수**: `useAuth().login(accessToken, refreshToken)` (`AuthContext.tsx:65`).
  - 내부 동작: `localStorage.setItem('accessToken' / 'refreshToken', …)` → `fetchUser()` 재호출 → `getProfile()` 성공 시 `localStorage.setItem('userId', …)` + 컨텍스트 상태 갱신.
- **금지 사항**: v2 페이지 코드에서 `localStorage.setItem('accessToken', …)` 등 **직접 접근 금지**. 항상 `useAuth().login(...)` 경유. (SPEC § 0 보존 vs 신규 / `docs/CLAUDE.md` 절대 규칙)
- **요청 헤더 주입**: `src/api/client.ts:36` 의 request 인터셉터가 `accessToken` → `Authorization: Bearer …`, `userId` → `X-User-Id` 자동 주입. Login 페이지에서 추가 작업 없음.

## 4. 데이터 페칭 / 폼 처리 전략

### 결론 (한 줄)

**기존 패턴 그대로 따른다. 신규 라이브러리 도입 없음.** `useState` 로 폼/에러/로딩 관리, 정규식+커스텀 함수로 검증, axios 직접 호출 + `try/catch` 로 제출. 모두 `src/pages-v2/Login/hooks.ts` 의 단일 훅 `useLoginForm()` 에 캡슐화.

### 1) 폼 라이브러리 — **직접 (`useState`)**

- **사용할 훅 / API**: `useState` 만. 폼 상태 1개 + 에러 상태 1개.
- **기존 패턴 따라야 하는 이유 (일관성)**: INVENTORY § 5 — `react-hook-form`, `formik` 미도입. 모든 기존 페이지(Login/Signup/Cart/Payment/MyPage)가 `useState` 로 폼 관리. SPEC § 9 「데이터 페칭 라이브러리 — 추가 라이브러리 미도입 확정」 의 정신을 폼에도 동일 적용. 새로 들이면 v2 단일 페이지만 다른 컨벤션이 되어 혼란.
- **신규 도입 없음**.
- **코드 구조 (3~5줄)**:
  ```ts
  // src/pages-v2/Login/hooks.ts
  const [form, setForm] = useState<LoginFormState>({ email: '', password: '' });
  const [errors, setErrors] = useState<LoginFieldErrors>({});
  const [loading, setLoading] = useState(false);
  const onChangeEmail = (v: string) => { setForm(f => ({ ...f, email: v })); setErrors(e => ({ ...e, email: undefined })); };
  ```

### 2) 검증 — **직접 (정규식 + 커스텀 함수)**

- **사용할 훅 / API**: `validate(form): LoginFieldErrors` 순수 함수. 정규식 `/\S+@\S+\.\S+/` 로 이메일, 빈 값 체크.
- **기존 패턴 따라야 하는 이유 (일관성)**: INVENTORY § 5 — `zod`, `yup` 미도입. 기존 `src/pages/Login.tsx:18-25` 가 동일하게 인라인 함수로 처리. 422 응답에 따른 서버 측 필드 에러 매핑은 §3 표 참조 — 클라 검증과 같은 `LoginFieldErrors` 형태로 통합되므로 별도 스키마 라이브러리 가치 낮음.
- **신규 도입 없음**.
- **코드 구조 (3~5줄)**:
  ```ts
  function validate(form: LoginFormState): LoginFieldErrors {
    const e: LoginFieldErrors = {};
    if (!form.email) e.email = '이메일을 입력하세요';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = '올바른 이메일 형식이 아닙니다';
    if (!form.password) e.password = '비밀번호를 입력하세요';
    return e;
  }
  ```

### 3) 데이터 페칭 — **직접 axios 호출 (`useApi` 미사용)**

- **사용할 훅 / API**: `src/api/auth.api.ts` 의 `login(body)` 직접 호출 + `unwrapApiData()` (`src/api/client.ts`) 로 응답 언랩 + `useAuth().login(accessToken, refreshToken)` 으로 토큰 저장 + `useNavigate()` 로 리다이렉트.
- **기존 패턴 따라야 하는 이유 (일관성)**: INVENTORY § 5 — React Query / SWR 미도입. SPEC § 9 「데이터 페칭 라이브러리 — 추가 라이브러리 미도입 확정」.
- **`useApi` 를 쓰지 않는 이유**: `src/hooks/useApi.ts:23` 의 `useApi` 는 **GET 조회 + mount 즉시 실행** 용도의 read-only 훅이다 (`immediate=true` 기본값, mount 시 1회 실행). Login 의 submit 은 사용자 클릭 트리거의 mutation 이라 `useApi` 의 사용 모델과 맞지 않음. 기존 `src/pages/Login.tsx:27-41` 도 `useApi` 미사용 — 같은 판단을 따른다.
- **신규 도입 없음**. (mutation 훅 신설도 하지 않음 — 한 페이지에서만 쓰면 추상화 가치 없음.)
- **코드 구조 (3~5줄)**:
  ```ts
  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const fieldErrors = validate(form);
    if (Object.keys(fieldErrors).length) { setErrors(fieldErrors); return; }
    setLoading(true);
    try {
      const { accessToken, refreshToken } = unwrapApiData(await loginApi(form));
      await auth.login(accessToken, refreshToken);
      navigate(returnTo ?? '/', { replace: true });
    } catch (err) {
      setErrors(mapLoginError(err));   // §3 의 HTTP 상태 → 메시지 매핑
    } finally {
      setLoading(false);
    }
  };
  ```

### 요약 표

| 항목 | 선택 | 위치 / 함수 | 신규 도입 | 사유 |
|---|---|---|---|---|
| 폼 | `useState` 직접 | `hooks.ts` 의 `useLoginForm` | X | INVENTORY § 5: 폼 라이브러리 미도입 / 기존 페이지 전반 동일 |
| 검증 | 정규식 + 순수 함수 | `hooks.ts` 의 `validate` | X | INVENTORY § 5: zod/yup 미도입 / 기존 Login 과 동일 |
| 페칭 | axios 직접 호출 | `src/api/auth.api.ts#login` + `unwrapApiData` | X | INVENTORY § 5 + SPEC § 9 확정 / `useApi` 는 GET 즉시 실행용이라 부적합 |
| 토큰 저장 | `useAuth().login()` | `src/contexts/AuthContext.tsx:65` | X | §3 참조. localStorage 직접 접근 금지 |
| 리다이렉트 | `useNavigate()` | `react-router-dom` | X | INVENTORY § 5 기존 도입 |

## 5. 신규 상태 처리 (로딩/에러/empty/권한)

> Login 은 데이터 조회가 없으므로 "empty 상태" 카테고리는 해당 없음. 4개 상태군만 정의.

### 5.1 로딩 (제출 중)

| 항목 | 내용 |
|---|---|
| 트리거 | `onSubmit` 진입 → 클라 검증 통과 시 `setLoading(true)`. `loginApi()` Promise 종료까지 유지. `finally` 에서 `setLoading(false)`. |
| 상태 소스 | `hooks.ts` 의 `useLoginForm` → `loading: boolean` |
| 표시 (버튼) | `<Button disabled={loading}>` + 자식으로 `<Icon name="spinner" />` 회전 + "로그인 중..." 텍스트. 프로토타입 `◐` 글리프는 `Icon spinner` 로 대체 (§2 표). |
| 표시 (인풋) | `<Input disabled={loading} />` 두 곳 (이메일/비밀번호). 입력 변경 차단. 스피너/오버레이 없음 — 카드 컴포지션이 작아서 버튼 한 곳만으로 충분. |
| 표시 (회원가입 링크) | `loading` 동안 `aria-disabled` + `pointer-events: none` 으로 클릭 차단 (페이지 이탈 방지). |
| 사용자 액션 | 없음 (제출 종료 대기). 제출 종료 후 성공 → 리다이렉트, 실패 → 5.2 로 진입. |
| 접근성 | `<Button aria-busy={loading}>`. 스크린리더용 `<span className="sr-only">로그인 처리 중</span>` (스피너 옆). |

### 5.2 에러 (제출 후)

`hooks.ts` 의 `mapLoginError(err)` 가 §3 의 HTTP 상태 → `LoginFieldErrors` + `formError`(폼 전체) 두 갈래로 분류해 반환. 표시 위치는 분류에 따라 달라진다.

| 케이스 | 트리거 | 매핑 결과 | 표시 위치 | 사용자 액션 |
|---|---|---|---|---|
| 401 INVALID_CREDENTIALS | `loginApi` 응답 401 | `formError = '이메일 또는 비밀번호가 일치하지 않습니다'` (필드별 분리 안 함 — 어느 쪽이 틀렸는지 노출 금지) | 폼 상단 인라인 배너 (`<Card>` 내 `<form>` 위, `var(--danger)` 텍스트 + `×` 글리프). 이메일/비밀번호 인풋 보더는 `var(--danger)` 동시 활성화하되 인풋 하단 메시지는 비움. | 입력값 수정 → onChange 시 `formError` 즉시 클리어 (재제출 가능). |
| 422 검증 에러 | `loginApi` 응답 422 + body 의 `errors: { email?, password? }` | `fieldErrors = { email?, password? }` 로 어댑팅. body 가 비어있으면 `formError = '입력값을 확인해주세요'` fallback. | 각 인풋 **하단** 12px `var(--danger)` 텍스트 (`× 메시지`). 인풋 보더도 `var(--danger)`. | 해당 필드 수정 → onChange 시 그 필드의 `fieldErrors[field]` 만 클리어. |
| 403 ACCOUNT_LOCKED / DISABLED | 응답 403 (단, `PROFILE_NOT_COMPLETED` 코드는 인터셉터가 `/social/profile-setup` 으로 강제 리다이렉트하므로 페이지 도달하지 않음 — INVENTORY § 4) | `formError = '계정이 잠겼거나 비활성화되었습니다. 관리자에게 문의하세요.'` | 폼 상단 인라인 배너. 인풋 보더는 정상 색상 유지. | 메시지만 표시. 인풋 수정해도 같은 메시지 반복될 가능성 — onChange 로 클리어해 재시도는 허용. |
| 429 TOO_MANY_REQUESTS | 응답 429 | `formError = '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.'` | 폼 상단 인라인 배너. | 시간 경과 후 재제출. (백오프 표시는 §7 결정) |
| 5xx 서버 오류 | 응답 5xx | `formError = '일시적인 오류입니다. 잠시 후 다시 시도해주세요.'` | **토스트** (전역 `useToast`) + 폼 상단 배너 동시 노출. 사용자가 토스트를 놓쳐도 카드에 남도록. | 사용자가 [다시 시도] (= 로그인 버튼 재클릭) 또는 페이지 이탈. |
| 네트워크 / 타임아웃 | `axios.isAxiosError(err) && !err.response` | `formError = '네트워크 연결을 확인해주세요. 연결 후 다시 시도해주세요.'` | 폼 상단 인라인 배너. (토스트 X — 오프라인이면 토스트가 가려질 수 있음) | 네트워크 복구 → 동일 버튼으로 재제출. 인풋 값/검증 결과는 유지. |
| unknown fallback | 위 분류 미해당 | `formError = '로그인에 실패했습니다. 잠시 후 다시 시도해주세요.'` | 폼 상단 인라인 배너. | 재시도 또는 이탈. |

### 5.3 폼 검증 에러 (제출 전, 클라 사이드)

| 항목 | 내용 |
|---|---|
| 트리거 | `onSubmit` 진입 시 `validate(form)` 호출. 에러 1개 이상이면 `setErrors(...)` 후 `loginApi` 호출하지 **않고** 반환. (네트워크 비용 0) |
| 규칙 | 1) `email` 빈 값 → "이메일을 입력하세요" / 2) `email` 비형식 → "올바른 이메일 형식이 아닙니다" (정규식 `\S+@\S+\.\S+`) / 3) `password` 빈 값 → "비밀번호를 입력하세요" |
| onBlur 검증 여부 | **하지 않음**. 제출 시점에만 검증 (기존 `src/pages/Login.tsx:18-29` 와 동일 UX). 사용자에게 너무 공격적인 피드백 회피. |
| 표시 위치 | 각 인풋 **하단** 12px `var(--danger)` 텍스트 (`× 메시지`). 인풋 보더 `var(--danger)`. SPEC § 1 「에러 시 border var(--danger) + 하단 12px danger 텍스트」 그대로. |
| 클리어 시점 | 해당 필드 `onChange` → 그 필드의 `errors[field]` 만 비움. 다른 필드 에러는 유지. |
| 사용자 액션 | 잘못된 필드 수정 → 자동 클리어 → 다시 [로그인] 클릭. |
| 접근성 | `<Input aria-invalid={!!errors.email} aria-describedby="email-error" />`. 에러 메시지 노드 `id="email-error"`. |

### 5.4 권한 (인증 상태 체크)

| 항목 | 내용 |
|---|---|
| 가드 위치 | `src/pages-v2/Login/index.tsx` (LoginPage). 라우트 컴포넌트 진입 직후 `useAuth()` 의 `isLoading` / `isLoggedIn` 확인. |
| 케이스 A — `isLoading: true` | AuthProvider 가 마운트 시 `getProfile()` 호출 중. **빈 화면 또는 단순 placeholder** 표시 (Login.tsx 의 카드 마크업까지 그리지 않음). 깜빡임 방지. <br>코드 예: `if (auth.isLoading) return null;` (또는 SPEC 의 `<Loading fullscreen />` 가 있다면 그걸 사용 — §7 결정). |
| 케이스 B — `isLoggedIn: true` 로 진입 | 이미 로그인된 사용자가 `/login` 으로 직접 들어온 경우. **로그인 폼을 그리지 않고 즉시 redirect**. <br>대상: `returnTo` 쿼리스트링 우선, 없으면 `/`. <br>코드: `<Navigate to={returnTo ?? '/'} replace />` (react-router-dom v6, INVENTORY § 5). |
| 케이스 C — `isLoggedIn: false` (정상) | LoginView 렌더 + `useLoginForm` 활성화. |
| 로그인 성공 직후 | `useAuth().login(accessToken, refreshToken)` 가 내부적으로 `fetchUser()` 까지 await → resolve 되면 `navigate(returnTo ?? '/', { replace: true })`. **`replace: true` 로** 히스토리에 `/login` 남기지 않아 뒤로가기 시 다시 로그인 화면으로 돌아오지 않게 함. |
| `returnTo` 추출 | `useSearchParams()` 로 `?returnTo=...` 파싱. (`react-router-dom` 기본 제공) |
| `returnTo` 화이트리스트 | **반드시 적용**. 외부 도메인 / 프로토콜 우회 (`returnTo=https://evil.com`, `returnTo=javascript:...`) 차단을 위해 다음 조건만 통과: `returnTo` 가 `/` 로 시작 + `//` 로 시작하지 않음. 위반 시 무시하고 `/` 사용. <br>구현 위치: `hooks.ts` 의 `useLoginForm` 가 `returnTo` 를 검사한 안전 값을 반환. |
| `returnTo` 미명시 시 기본 경로 | `/`. (SPEC § 1 「성공 시 토큰 저장 + 리다이렉트 (메인 또는 returnTo)」) |
| RequireAuth 와의 관계 | INVENTORY § 4: `RequireAuth` 가 미인증 사용자를 `/login` 으로 보낼 때 `returnTo` 를 부여하는지 확인 필요. 현재 `App.tsx:48` 가 단순 `<Navigate to="/login" />` 면 v2 cutover 시점에 `state` 또는 쿼리에 `returnTo` 를 실어 보내도록 수정 필요. **이 작업은 본 plan 범위 밖** — §7 결정 항목으로 위탁. |
| 사용자 액션 | A: 자동 (대기). B: 자동 (즉시 redirect). C: 폼 입력 → 제출. |

## 6. 라우터 등록 방법

### 전제 — Phase 0 router-toggle 헬퍼 (`docs/redesign/router-toggle.plan.md` § 3 / § 4)

- 헬퍼: `<VersionedRoute v1={...} v2={...} />` (`src/router-v2/VersionedRoute.tsx`)
- 보조 훅: `useUiVersion()` (`src/router-v2/useUiVersion.ts`)
- 우선순위: URL `?v=2|1` > `localStorage['ui.version']` > env `VITE_UI_DEFAULT_VERSION` > `'1'`
- v2 prop 부재 시 자동 v1 fallback. URL `?v=` 발견 시 localStorage 동기화 (sticky)
- 모두 Phase 0 에서 도입 완료된 상태라고 가정. 본 plan 은 Login 페이지 등록만 다룸.

### 등록할 라우트

| 라우트 경로 | `/login` |
|---|---|
| 가드 | 없음 (공개 페이지) — INVENTORY § 4 「가드 없음(공개): `/login` …」 |
| 레이아웃 | 없음 (`<Layout>` 미적용) — `router-toggle.plan` § 1-5 「레이아웃 미적용 (공개 페이지): `/login` …」 |
| 변경 위치 | `src/App.tsx:75` 의 한 줄 |

### legacy / v2 컴포넌트 경로

| 구분 | 경로 | 임포트 형태 |
|---|---|---|
| legacy | `src/pages/Login.tsx` (= `./pages/Login`) | `import Login from './pages/Login'` (현재 `App.tsx:12` 즉시 import — INVENTORY § 5 와 router-toggle § 1-3 에 따라 비로그인 첫 화면 5개 즉시 import 패턴 유지) |
| v2 | `src/pages-v2/Login/index.tsx` (= `./pages-v2/Login`) | `const LoginV2 = lazy(() => import('./pages-v2/Login'))` (이미 lazy 페이지 다수 존재 — `App.tsx:17-45`. Login v2 도 lazy 로 시작해 v1 번들 사이즈에 영향 없게 함). v2 진입점은 §1 의 `LoginPage` (default export). |

### `src/App.tsx` 변경 diff (정확한 위치 명시)

```tsx
// src/App.tsx 상단 import 영역 — lazy 그룹에 추가 (INVENTORY 의 lazy 패턴 따름)
+ import { VersionedRoute } from './router-v2'
+ const LoginV2 = lazy(() => import('./pages-v2/Login'))

// src/App.tsx:75 — 한 줄 element 만 교체. path / 가드 / Suspense 트리 모두 그대로
- <Route path="/login" element={<Login />} />
+ <Route path="/login" element={<VersionedRoute v1={<Login />} v2={<LoginV2 />} />} />
```

다른 라우트는 건드리지 않음. router-toggle § 5 Step 3 의 임시 검증 패치는 본 PR 에서 정식 변경으로 채택하는 셈이라 별도 revert 불필요.

### 검증 방법 (수동)

`npm run dev` 후 다음 5케이스 통과 확인. router-toggle § 5 Step 3 표 그대로 적용하되 Login 기준으로 좁힘.

| # | 동작 | 기대 결과 | 검증 항목 |
|---|---|---|---|
| 1 | `/login` 접속 | 기존 `<Login />` (legacy 마크업) 렌더 | 기본값 `'1'` |
| 2 | `/login?v=2` 접속 | v2 LoginPage 렌더 (DT 마크 + "로그인" 22px + 카드 28px padding) + DevTools 콘솔에서 `localStorage.getItem('ui.version') === '2'` | URL 파싱 + localStorage sync |
| 3 | (#2 직후) 다른 페이지 이동 후 다시 `/login` (쿼리 없이) | v2 LoginPage 유지 | sticky 동작 |
| 4 | `/login?v=1` 접속 | legacy `<Login />` + `localStorage.getItem('ui.version') === null` | URL `v=1` 시 키 제거 |
| 5 | 로그인 성공 후 | `/` 또는 `?returnTo=...` 로 리다이렉트, 재방문 시 §5.4 케이스 B (이미 로그인) 로 즉시 redirect | 권한 가드 + returnTo |

추가 케이스 (Login 고유):
- `/login?v=2&returnTo=/cart` 접속 → 로그인 성공 후 `/cart` 로 redirect.
- `/login?v=2&returnTo=https://evil.com` 접속 → §5.4 화이트리스트로 무시, `/` 로 redirect.

### 영향 범위

- `App.tsx`: 2 라인 추가(import + lazy) + 1 라인 교체. 다른 라우트 영향 0.
- 기존 `src/pages/Login.tsx`: **수정 금지** (SPEC § 0 / `docs/CLAUDE.md` 절대 규칙). cutover PR 까지 보존.
- 토글이 꺼진 경우 v2 코드는 `lazy` 경로로만 존재해 번들에 미포함.

## 7. 의사결정 필요 지점

> 사용자 지시로 일부 항목은 **이미 결정**됨. 결정된 항목은 "확정" 컬럼에 명시. 그 외는 작업 시작 전 합의 필요.

### 기능 범위 결정 (사용자 입력 반영)

| 항목 | 결정 | 영향 범위 |
|---|---|---|
| 회원가입 링크 처리 | **확정** — 기존 `/signup` 페이지 흐름 유지. UI 만 v2 톤(brand color, semibold)으로 refine. v2 카드 하단 구분선 + "아직 계정이 없으신가요? 회원가입" 링크. `<Link to="/signup">` 사용 (router-toggle 가 v=2 sticky 처리하므로 쿼리 부착 불필요) | §2 `SignupCallout`, `signupHref = '/signup'` |
| "비밀번호 찾기" 링크 | **확정 — 추가하지 않음** | 마크업에서 제거. 백엔드 reset 엔드포인트도 본 plan 범위 밖 |
| 소셜 로그인 (Google) | **확정 — 필요함** | 카드 내부 "또는" 구분선 + "Google로 로그인" 버튼 추가. 기존 `src/pages/Login.tsx:96-111` 와 동일한 OAuth start URL(`VITE_GOOGLE_OAUTH_URL`) 사용. v2 마크업에서는 `Button` 공용 컴포넌트의 `secondary` 또는 `ghost` variant + GoogleIcon 으로 재구성 (인라인 `style={{}}` 금지 — SPEC § 0). §2 컴포넌트 분해 표에 `SocialLoginBlock` 추가 필요 (다음 commit 으로 §2 갱신 권장) |
| 로그인 후 리다이렉트 정책 | **확정 — 메인(`/`) 으로 리다이렉트** | §5.4. `returnTo` 쿼리스트링이 있으면 그 경로(화이트리스트 통과 시) 우선, 없으면 `/`. RequireAuth 가 부여하는 `returnTo` 가 들어올 수 있으므로 처리 로직은 유지 |
| "로그인 유지" 체크박스 / 자동 로그인 | **확정 — 추가하지 않음** | 마크업에서 제거. 토큰 만료 정책은 백엔드 기본값에 위임 (별도 UI 없음) |

### 미결정 — 작업 시작 전 합의 필요

| 번호 | 항목 | 옵션 | 권장 | 영향 |
|---|---|---|---|---|
| D-1 | `/auth/login` 호출의 401 부작용 (§3) | (A) axios 인터셉터 우회 옵션 추가 (`config.skipReissue`) (B) 페이지에서 인터셉터 동작을 그대로 두고 catch 블록 메시지로 무마 | **B**. 인터셉터 수정은 영향 범위가 v2 단일 페이지를 넘어가므로 보수적으로. catch 블록이 reissue 실패보다 먼저 도달하는지 실제 동작 확인 후 확정 | hooks.ts mapLoginError, src/api/client.ts 무수정 |
| D-2 | 422 검증 응답 스키마 | 백엔드와 합의 필요 — `errors: { email?, password? }` 형태인가, `errors: [{ field, message }]` 배열인가 | 양쪽 모두 어댑팅 가능하도록 `mapLoginError` 가 두 형태 모두 수용. 확정 시 한 갈래로 좁힘 | hooks.ts |
| D-3 | 429 / 5xx 시 백오프·재시도 횟수 | 현재 구현 0회. 토스트만 띄우고 사용자 재클릭에 위임 | 그대로(추가 구현 X). 자동 재시도는 멱등성 검토 필요한데 login 은 부작용 없어 안전하지만 UX 가치 낮음 | hooks.ts |
| D-4 | `RequireAuth` 가 `/login` 으로 보낼 때 `returnTo` 부여 | 현재 `App.tsx:48` 미부여 (`router-toggle.plan` § 1-4). v2 페이지가 `returnTo` 를 활용하려면 가드 측 변경 필요 | **본 plan 범위 밖**. cutover PR 또는 별도 인프라 PR 에서 처리. v2 LoginPage 는 `returnTo` 가 없으면 그냥 `/` 로 redirect 하므로 동작은 안전 | App.tsx (별도 PR), §5.4 |
| D-5 | Login 페이지를 IDE chrome(`Layout`) 안에서 렌더할지 | INVENTORY § 4: 현재 `/login` 은 레이아웃 없음. SPEC § 7 「Layout chrome A/B 선택 — Option A 확정」 와 충돌 가능성 | 현행 유지(레이아웃 없음). 비로그인 페이지에 사이드바·탭바 노출은 부적절 | App.tsx 라우트 위치(공개 평탄 라우트 그대로) |
| D-6 | `Icon` 공용 컴포넌트의 `spinner` 항목 존재 여부 | SPEC § 0 의 Phase 1 공용 컴포넌트 목록에 Icon 은 있으나 개별 항목 명세 없음. 프로토타입 `◐` 글리프를 어떻게 매핑할지 | Icon 컴포넌트에 `spinner` 추가. 없으면 Login 작업 PR 안에서 1줄 추가 또는 Phase 1 공용 PR 로 위탁 | components-v2/Icon |
| D-7 | OAuth 시작 URL 환경변수 명 | 기존 `VITE_GOOGLE_OAUTH_URL` (src/pages/Login.tsx:7) 그대로 사용 vs v2 prefix 부여 | 기존 그대로 사용. env 분리 가치 없음 | hooks.ts 내 GOOGLE_OAUTH_URL 상수 |
| D-8 | OAuth 콜백(`/oauth/callback`) v2 도입 여부 | 본 plan 범위 밖이지만 Login → Google → callback 흐름이 한 묶음이라 명시 | 본 plan 은 Login 만. callback 은 SPEC § 9 「기존 소셜 로그인 플로우 유지」 따라 legacy 그대로 (사용자 흐름은 v2 Login → legacy callback → AuthContext 업데이트 → v2 메인) | callback 페이지 무수정 |
| D-9 | §2 컴포넌트 분해 갱신 | 사용자 결정으로 `SocialLoginBlock` 이 추가됨 | §2 의 분해 표에 다음 행 보강: `SocialLoginBlock` (위치: `Login.tsx` 내부 named, props: `{ googleOAuthUrl: string }`). 본 plan 의 § 2 갱신은 별도 commit 으로 처리 권장 | 본 문서 § 2 |
| D-10 | 클라 검증 동작의 onBlur 도입 여부 | §5.3 결정대로 onSubmit 만. 향후 UX 개선 시 검토 | 그대로 | hooks.ts |

## 8. PR 분할 + 파일 생성 순서

### 8.1 LOC 추정 (총량 + 분포)

§1~§7 결정을 반영해 실제 만들 파일과 줄수 추정.

| 파일 | 신/수 | LOC (대략) | 내용 |
|---|---|---|---|
| `src/pages-v2/Login/hooks.ts` | 신규 | ~110 | `LoginFormState`/`LoginFieldErrors` 인라인 타입 + `validate()` + `mapLoginError()` + `safeReturnTo()` 화이트리스트 + `useLoginForm()` 훅 |
| `src/pages-v2/Login/Login.tsx` | 신규 | ~130 | `LoginView` (default export) + 5개 named 인라인 컴포넌트(`BrandHeader`, `PageHeading`, `LoginForm`, `SocialLoginBlock`, `SignupCallout`) |
| `src/pages-v2/Login/index.tsx` | 신규 | ~35 | `LoginPage` — 인증 게이트(§5.4) + `returnTo` 추출 + `useLoginForm` 호출 + `<LoginView>` props 주입 |
| `src/App.tsx` | 수정 | +3 | `import { VersionedRoute }` + `const LoginV2 = lazy(...)` + `/login` element 한 줄 교체 |
| **합계** | — | **~278** | (테스트/스토리북 미포함 — INVENTORY § 5: 테스트 러너 의존성 0개) |

§1 결정에 따라 `components/`, `adapters.ts`, `types.ts` 는 **만들지 않음**. 사용자 제안의 PR 1/PR 2 분할안에 포함된 `types.ts → 컴포넌트`, `adapters.ts → hooks.ts` 단계는 본 페이지에 해당 파일이 없으므로 생략하고, 인라인 타입은 `hooks.ts` 내부에, 에러 매핑은 `hooks.ts` 의 `mapLoginError` 에 둠.

### 8.2 PR 분할 비교

| 방식 | 장점 | 단점 | 적합도 |
|---|---|---|---|
| **A. 통합 1 PR** (본 plan 권장) | 리뷰·머지 1회. rebase/충돌 위험 1회. ~280 LOC 는 단일 PR 로도 충분히 검토 가능 (현 프로젝트 평균 PR 사이즈 대비 작음) | 시각 단계와 API 단계가 한 PR 에 섞여 시각 회귀와 로직 회귀가 같은 diff 에 공존 | **★ 권장** |
| B. PR 1 (시각) + PR 2 (API) | 디자이너 시각 검수를 API 위험 없이 받을 수 있음. PR 1 머지 후 v2 토글 켜고 mock 만 노출 → QA 안전 | mock 데이터를 일시적으로 코드에 박아야 함(SPEC § 0「프로토타입 mock 데이터는 v2 코드에 들어가면 안 됨」 위반 위험). PR 1 의 컴포넌트 props 를 PR 2 에서 다시 손대 diff 폭발. PR 2 가 단순 wiring 인데 별도 리뷰 사이클은 비용 과잉 | △ 비권장 (Login 규모에 과한 분할) |

**근거**:
- §3 의 mock 위반 리스크: PR 1 시각만 PR 의 정의상 `loginApi` 미호출이 되어, `LoginForm` 의 `loading`/`errors` 같은 상태를 채우려면 임시 더미를 둬야 한다. 이는 SPEC § 0 의 mock 금지 규칙과 정면 충돌.
- §1 결정으로 `adapters.ts`/`types.ts` 가 사라져 사용자 제안의 "기반 PR 먼저 → 통합 PR" 분할의 절단면이 자연스럽게 사라짐.
- ~280 LOC 는 router-toggle.plan(~43 LOC) 에 비하면 크지만, 한 PR 로 검토 가능한 규모.

→ **통합 1 PR 채택**. 단, 커밋은 §8.3 의 7단계로 잘게 쪼개 리뷰어가 단계별로 따라갈 수 있게 한다.

### 8.3 단일 PR 내부 — 파일/커밋 생성 순서

각 step = 1 commit. 의존 방향(타입 → 로직 → 뷰 → 진입점 → 라우터)을 따라 빌드가 깨지지 않게 진행.

#### Step 1 — `hooks.ts` 골격 + 타입

1. `src/pages-v2/Login/hooks.ts` 생성.
2. 인라인 타입 export: `LoginFormState`, `LoginFieldErrors`.
3. 순수 함수 export: `validate(form)` (§5.3 규칙), `safeReturnTo(raw)` (§5.4 화이트리스트), `mapLoginError(err)` (§3 에러 매핑 표).
4. `useLoginForm()` 훅 시그니처 + `useState` 3종(form/errors/loading) + `onChangeEmail`/`onChangePassword`/`onSubmit` 스텁(아직 axios 미호출).

> 이 시점에서는 `loginApi` 미연결이라 빌드만 통과. 빌드 깨짐 없음.

권장 commit: `feat(pages-v2/login): add useLoginForm hook scaffold with validators`

#### Step 2 — `hooks.ts` API 통합 완성

1. `import { login as loginApi } from '@/api/auth.api'`, `import { unwrapApiData } from '@/api/client'`, `useAuth`, `useNavigate`, `useSearchParams` 추가.
2. `onSubmit` 본체 작성: `validate` → `setLoading(true)` → `loginApi(form)` → `unwrapApiData` → `auth.login(accessToken, refreshToken)` → `navigate(safeReturnTo, { replace: true })`. catch 에서 `mapLoginError` → `setErrors`.
3. `useLoginForm` 반환값에 `signupHref`, `googleOAuthUrl` 포함 (§7 D-7: `import.meta.env.VITE_GOOGLE_OAUTH_URL` 그대로).

권장 commit: `feat(pages-v2/login): wire useLoginForm to auth.api login + AuthContext`

#### Step 3 — `Login.tsx` 프레젠테이션

1. `src/pages-v2/Login/Login.tsx` 생성. `LoginView` 함수 컴포넌트 + props 시그니처(§2 표).
2. 인라인 named 컴포넌트 5종 작성, 의존 순서대로:
   - `BrandHeader` (정적)
   - `PageHeading` (정적)
   - `LoginForm` (Phase 0 공용 `Input`/`Button`/`Icon` 사용, 폼 상태 props)
   - `SocialLoginBlock` (§7 D-9 추가, `googleOAuthUrl` props, `Button` secondary + GoogleIcon)
   - `SignupCallout` (`href` props, `<Link>`)
3. `LoginView` 본체에서 `<Card padding={28}>` 안에 위 5개를 SPEC § 1 마크업 순서대로 조합. 인라인 `style={{}}` 금지(SPEC § 0).

> 이 시점에서 `LoginView` 는 props 만 받아 그리는 순수 컴포넌트라 단독 빌드 OK. 라우트 미연결로 화면 노출은 아직 없음.

권장 commit: `feat(pages-v2/login): add LoginView presentation with 5 inline blocks`

#### Step 4 — `index.tsx` 진입점

1. `src/pages-v2/Login/index.tsx` 생성, default export `LoginPage`.
2. `useAuth()` 로 §5.4 인증 게이트:
   - `isLoading` → `return null` (또는 §7 D-1 의 `<Loading fullscreen />`, 결정 따름).
   - `isLoggedIn` → `<Navigate to={safeReturnTo(...)} replace />`.
3. 미인증 정상 케이스: `useLoginForm()` 호출 결과를 `<LoginView ...props />` 에 전개.

권장 commit: `feat(pages-v2/login): add LoginPage entry with auth gate and returnTo`

#### Step 5 — 라우터 등록 (`src/App.tsx`)

§6 의 정확한 diff 적용:

1. import 영역: `import { VersionedRoute } from './router-v2'` 추가.
2. lazy 그룹에 `const LoginV2 = lazy(() => import('./pages-v2/Login'))` 추가.
3. `App.tsx:75` 한 줄 교체: `<Route path="/login" element={<VersionedRoute v1={<Login />} v2={<LoginV2 />} />} />`.

> Phase 0 의 `src/router-v2/` 가 이미 존재한다고 가정. 미존재 시 본 PR 의 사전 의존성으로 기록 후 router-toggle PR 머지 대기.

권장 commit: `feat(app): wire /login to VersionedRoute v2 (LoginV2)`

#### Step 6 — 수동 검증 (커밋 없음)

`npm run dev` 후 §6 의 5+2 케이스 모두 통과 확인. 불통 발견 시 해당 step 으로 돌아가 fix-up commit 추가.

#### Step 7 — PR 본문 작성 + push

PR description 에 §6 검증 표 + §5 상태 표 + §7 미결정 항목(D-1~D-10) 링크. 리뷰어가 결정 보류 항목을 인지한 채 검토하도록.

권장 commit: (없음 — push 만)

### 8.4 커밋 요약 (총 5 commits)

| # | commit | 파일 | 누적 LOC |
|---|---|---|---|
| 1 | `feat(pages-v2/login): add useLoginForm hook scaffold with validators` | `hooks.ts` (부분) | ~60 |
| 2 | `feat(pages-v2/login): wire useLoginForm to auth.api login + AuthContext` | `hooks.ts` (완성) | ~110 |
| 3 | `feat(pages-v2/login): add LoginView presentation with 5 inline blocks` | `Login.tsx` | ~240 |
| 4 | `feat(pages-v2/login): add LoginPage entry with auth gate and returnTo` | `index.tsx` | ~275 |
| 5 | `feat(app): wire /login to VersionedRoute v2 (LoginV2)` | `App.tsx` | ~278 |

### 8.5 사전 / 사후 의존성

- **사전 (PR 머지 전 확정 필요)**:
  - `src/router-v2/` 도입 PR 머지 (router-toggle.plan).
  - Phase 1 공용 컴포넌트 `Card`, `Input`, `Button`, `Icon(spinner)` 사용 가능 (§2). `Icon spinner` 미존재 시 §7 D-6 따라 본 PR 안에서 추가 또는 별도 PR 선행.
  - `VITE_GOOGLE_OAUTH_URL` 환경변수 (`.env.development` 등에 이미 존재 — 기존 Login 사용 중이라 추가 작업 불필요).
- **사후 (본 PR 머지 후 별도 PR)**:
  - §7 D-4 — `RequireAuth` 가 `/login` 이동 시 `returnTo` 부여. v2 LoginPage 는 부재 시 `/` fallback 이라 본 PR 동작 안전.
  - cutover PR — `src/pages/Login.tsx` 삭제, `App.tsx` 의 `<VersionedRoute v1={<Login />} v2={<LoginV2 />} />` 를 `<LoginV2 />` 단독으로 교체.
