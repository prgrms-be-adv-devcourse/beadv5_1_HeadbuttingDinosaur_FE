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
(작성 예정)

## 4. 데이터 페칭 / 폼 처리 전략
(작성 예정)

## 5. 신규 상태 처리 (로딩/에러/empty/권한)
(작성 예정)

## 6. 라우터 등록 방법
(작성 예정)

## 7. 의사결정 필요 지점
(작성 예정)

## 8. PR 분할 + 파일 생성 순서
(작성 예정)
