# Cutover 계획 (v2 → 메인 승격)

이 작업은 모든 v2 페이지 PR 머지 후 실행되는 마지막 단계.
v2 코드를 메인으로 승격하고 기존 코드를 일괄 삭제.

## 1. 사전 검증 (필수 체크리스트)

Cutover PR 머지 직전, 아래 항목을 전부 통과해야 머지 가능.
각 항목은 **확인 방법**과 **통과 기준**을 함께 명시한다.

### 1.1 v2 라우트 동작 검증
모든 v2 페이지를 `?v=2` 쿼리로 접속해 정상 동작을 확인.

- 대상 페이지: Landing, EventList, EventDetail, Cart, 결제, MyPage (그 외 v2 로 이관된 모든 페이지)
- 확인 방법
  - 로컬 dev 서버 (`npm run dev`) 에서 각 페이지를 직접 접속
  - 다음 조합을 매트릭스로 전수 확인
    - 테마: 라이트 / 다크 (시스템 설정 + 명시적 토글 둘 다)
    - 뷰포트: 모바일 (375px) / 태블릿 (768px) / 데스크탑 (1280px+)
    - 인증: 비로그인 / 로그인 상태
    - 상태: 정상 데이터 / 로딩 (네트워크 throttle) / 에러 (API 강제 실패) / 빈 결과 (필터로 0건 유도)
- 통과 기준
  - 콘솔 에러 / 경고 0건 (React key warning, hydration mismatch 포함)
  - 모든 조합에서 레이아웃 깨짐 없음 (가로 스크롤, 텍스트 잘림, 겹침 없음)
  - 로딩 / 에러 / 빈 상태가 의도한 UI 로 노출됨 (흰 화면 금지)

### 1.2 v2 페이지 간 네비게이션
v2 페이지 사이 이동 시 `?v=2` 가 끊기지 않는지 확인.

- 시나리오
  - Landing → EventList → EventDetail → Cart → 결제 (전체 구매 플로우)
  - MyPage 내부 탭 간 이동 (예: 예약 내역 ↔ 프로필)
  - 브라우저 뒤로가기 / 앞으로가기 후에도 `?v=2` 유지
- 확인 방법
  - 위 플로우를 한 세션에서 끊김 없이 수행
  - 각 이동 후 주소창과 `useSearchParams` 값을 직접 확인
- 통과 기준
  - 모든 이동 후 URL 에 `?v=2` 가 보존됨
  - v2 → v1 으로 의도치 않게 떨어지는 페이지 없음
  - 새로고침 후에도 같은 v2 화면 유지

### 1.3 v1 잔존 페이지 동작
INVENTORY § 6, § 7 의 cutover 범위 밖 페이지가 정상 동작하는지 확인.

- 대상: admin, signup 등 v2 로 이관되지 않은 페이지 (정확한 목록은 INVENTORY 기준)
- 확인 방법
  - 각 잔존 페이지를 `?v=2` 없이 접속해 기존 플로우 수행
  - 새 디자인 토큰이 전역에 적용된 상태에서 외관 회귀 점검
- 통과 기준
  - 기능 회귀 0건 (기존 시나리오 그대로 동작)
  - 토큰 변경으로 인한 색상 / 폰트 / 간격 깨짐 없음
  - v1 페이지에서 의도치 않게 v2 컴포넌트가 섞여 들어가지 않음

### 1.4 기존 사용자 세션 / 데이터 호환
Cutover 직후에도 기존 사용자가 끊김 없이 사용 가능해야 함.

- 확인 방법
  - Cutover 전 빌드에서 로그인 + 장바구니 담기 → Cutover 빌드로 교체 → 같은 브라우저로 재방문
  - localStorage / sessionStorage / 쿠키 키 변경 여부 점검
- 통과 기준
  - 로그인 상태가 그대로 유지됨 (재로그인 강제 X)
  - 장바구니 데이터가 유지되거나, 변환이 필요한 경우 명시적 마이그레이션 코드가 동작함
  - 캐시 무효화가 필요한 항목 (예: SW, CDN, react-query 키)이 § 6 에 명시되어 있음

### 1.5 빌드 / 테스트
머지 전 CI 그린 + 번들 사이즈 확인.

- 확인 방법
  - `npm run typecheck` (또는 `tsc --noEmit`)
  - `npm run lint`
  - `npm test` (단위 + 통합)
  - `npm run build` 후 번들 사이즈를 v1 메인과 비교 (initial JS / CSS)
- 통과 기준
  - tsc 에러 0건
  - eslint 에러 0건 (warning 은 PR 설명에 사유 명시)
  - 테스트 전부 통과, 신규 추가 테스트는 의미 있는 케이스 커버
  - 번들 사이즈 증가가 v1 대비 합리적 범위 (목표: initial JS +10% 이내, 초과 시 PR 에서 사유 / 후속 최적화 계획 명시)

## 2. 영향 범위 매핑

Cutover 가 건드리는 모든 영역을 한눈에 보기 위한 매핑.
영향 정도 표기: **대** (구조 변경 / 회귀 위험 큼) / **중** (다수 파일 수정) / **소** (국지적 / 자동화 가능).

### 2.1 라우트 — 영향 정도: **대**
- 변경 (v1 → v2 로 전환): INVENTORY § 6 의 v2 이관 완료 페이지 전부
  - Landing (`/`)
  - EventList (`/events`)
  - EventDetail (`/events/:id`)
  - Cart (`/cart`)
  - 결제 (`/checkout` 또는 동등 경로)
  - MyPage (`/mypage` 및 하위 탭)
- 변경 안 됨 (v1 유지, INVENTORY § 7 기준): admin, signup 등 cutover 범위 밖 라우트
- 비고: 정확한 라우트 목록은 § 5 에서 router 파일 단위로 다시 명세.

### 2.2 디렉토리 — 영향 정도: **대**
- 삭제: `src/pages/`, `src/components/` 중 v2 로 대체된 항목 (정확한 파일 단위는 § 3)
- 이동 (rename): 
  - `src/pages-v2/` → `src/pages/`
  - `src/components-v2/` → `src/components/`
  - `src/types-v2/` → `src/types/` (또는 기존 타입과 병합)
  - `src/router-v2/` → `src/router/` (router-toggle 헬퍼 제거 후)
- 통합: `src/styles-v2/` → `src/styles/` (토큰 / 글로벌 CSS 병합, 충돌 시 v2 우선)
- 위험: import 경로 일괄 변경 필요 → codemod 또는 정규식 치환 필수 (§ 5 에서 명세)

### 2.3 라우터 — 영향 정도: **중**
- Phase 0 의 `router-toggle` 헬퍼 (`?v=2` 분기) 제거
- v1 / v2 분기 로직 단순화 → 단일 라우트 트리
- `useSearchParams` 로 `v` 를 읽는 코드 전부 제거 (페이지 / 훅 양쪽)
- 위험: 분기 잔존 시 v1 코드가 dead 상태로 살아있어 번들에 포함될 수 있음 → grep 으로 0건 확인

### 2.4 의존성 — 영향 정도: **소~중** (조사 필요)
- 점검 항목 (package.json):
  - `react-type-animation` — v1 Landing 외 사용처 없으면 제거 후보
  - `react-kakao-maps-sdk` — v1/v2 양쪽 사용 여부 확인 후 결정
  - `@tosspayments/tosspayments-sdk` — 결제 v2 에서도 사용하면 유지
- v2 전용으로 추가된 신규 의존성 (있다면) → devDependencies / dependencies 위치 재확인 후 영구화
- 위험: v1 만 쓰던 패키지를 너무 일찍 제거하면 v1 잔존 페이지 (admin 등) 가 깨질 수 있음 → § 1.3 검증 후 제거

### 2.5 CLAUDE.md — 영향 정도: **소**
- `docs/CLAUDE.md` 의 "프론트엔드 v2 재구축 (진행 중)" 섹션 제거 또는 완료 상태로 갱신
- 절대 규칙 항목 제거 / 갱신:
  - "신규 코드: src/pages-v2/, src/components-v2/, src/styles-v2/" → 삭제
  - "기존 src/pages/, src/components/는 cutover PR 전까지 절대 수정 금지" → 삭제
  - 나머지 (adapters / VM 변환, 프로토타입 인라인 style 금지 등) 는 일반 규칙으로 유지
- SPEC.md / WORKFLOW.md 참조 링크는 § 7 에서 별도로 정리

### 2.6 테스트 — 영향 정도: **중** (테스트 인프라 도입 여부에 따라 달라짐)
- 현 상태: 테스트 인프라 미설치 (package.json 에 test runner 없음). v1 테스트가 존재하지 않으면 이 항목은 NO-OP.
- v1 단위 / 통합 테스트가 존재하는 경우: 해당 테스트 파일 삭제
- v2 테스트 파일이 `__tests__-v2/` 또는 `*.v2.test.ts` 등 분리 위치에 있으면 메인 위치로 이동
- 위험: 테스트가 없는 상태로 cutover 시 § 1.5 의 "테스트 통과" 기준은 typecheck + lint + 수동 시나리오로 대체

### 2.7 CI / CD — 영향 정도: **소**
- 현재 빌드 스크립트 (`vite build`) 자체는 변경 불필요
- 영향 가능 항목 점검:
  - GitHub Actions 워크플로우에서 `pages-v2`, `components-v2` 등을 명시적으로 참조하는지
  - eslint / tsconfig 의 `paths`, `include`, `exclude` 에 v2 경로가 박혀 있는지
  - PR 템플릿 (`docs/redesign/pr-templat.md`) 의 v2 전용 체크 항목
- 영향 있을 시 cutover PR 에서 함께 갱신, 없으면 NO-OP

### 2.8 영향 정도 요약
| 영역 | 정도 | 주요 위험 |
|------|------|-----------|
| 라우트 | 대 | 진입점 변경, SEO / 북마크 영향 |
| 디렉토리 | 대 | import 경로 일괄 변경 |
| 라우터 | 중 | 분기 잔존 시 dead code |
| 의존성 | 소~중 | v1 잔존 페이지 깨짐 |
| CLAUDE.md | 소 | 문서 정합성만 |
| 테스트 | 중 | 인프라 유무에 따라 달라짐 |
| CI / CD | 소 | 설정 파일에 v2 경로 박혀있는지 |

## 3. 삭제 대상 (기존 코드)

INVENTORY § 1 (페이지 매핑) / § 7 (기존에만 있는 페이지) 기준으로 v2 로 대체된 항목만 삭제.
v1 잔존 페이지(admin / seller / signup / payment 결과 등)에서 사용 중인 코드는 cutover 시점에 **유지**.

각 항목의 안전성 확인은 `git grep` 으로 import 0건을 증명한 뒤 삭제한다.

### 3.1 페이지 (`src/pages/`)

| 경로 | 대체된 v2 위치 | 처리 | 비고 |
|------|----------------|------|------|
| `src/pages/EventList.tsx` | `src/pages-v2/EventList/` | **삭제** | INVENTORY § 1: `/` 라우트. 라우트 정책에 따라 `/events` 로 옮길지 결정(§9) |
| `src/pages/EventDetail.tsx` | `src/pages-v2/EventDetail/` | **삭제** | `/events/:id` |
| `src/pages/Cart.tsx` | `src/pages-v2/Cart/` | **삭제** | `/cart` |
| `src/pages/MyPage.tsx` | `src/pages-v2/MyPage/` | **삭제** | `/mypage` |
| `src/pages/Login.tsx` | `src/pages-v2/Login/` | **삭제** | `/login` |
| (없음 — 신규) | `src/pages-v2/Landing/` | (삭제 대상 없음) | Landing 은 v2 신규 페이지 |
| `src/pages/Payment.tsx` | `src/pages-v2/PaymentCallback/` 매핑 검토 | **§9 결정 필요** | INVENTORY § 7: 신규 디자인 필수로 분류. v2 PaymentCallback 이 결제 + 결과까지 모두 커버하는지 확인 후 결정 |
| `src/pages/PaymentSuccess.tsx`, `PaymentFail.tsx`, `PaymentComplete.tsx` | 동상 | **§9 결정 필요** | 위와 동일. v2 가 콜백 1개로 통합했는지, 별도 결과 페이지가 살아있는지 검증 후 결정 |
| `src/pages/WalletChargeSuccess.tsx`, `WalletChargeFail.tsx` | (없음) | **유지** | INVENTORY § 7: 신규 디자인 필수로 분류되었으나 cutover 시점 미이관 → 유지 |
| `src/pages/Signup.tsx`, `SignupComplete.tsx`, `SocialProfileSetup.tsx` | (없음) | **유지** | INVENTORY § 7: 신규 디자인 필수지만 cutover 시점 미이관 → 유지 |
| `src/pages/OAuthCallback.tsx` | (없음) | **유지** | INVENTORY § 7: UI 거의 없음 / 로직만 |
| `src/pages/SellerApply.tsx` | (없음) | **유지** | INVENTORY § 7: 신규 디자인 필요지만 미이관 |
| `src/pages/NotFound.tsx` | (없음) | **유지** | INVENTORY § 7: 신규 디자인 필수지만 미이관 |
| `src/pages/admin/*` (6개) | (해당 없음) | **유지** | 범위 밖 (관리자 콘솔, 별도 트랙) |
| `src/pages/seller/*` (5개) | (해당 없음) | **유지** | 범위 밖 (판매자 콘솔, 별도 트랙) |

**안전성 확인**: 삭제 직전 각 파일에 대해 `git grep -n "from .*pages/<basename>"` 결과가 **App.tsx 의 import 한 줄뿐**임을 확인. 그 import 는 § 5 의 라우터 수정에서 v2 경로로 전환되며 함께 사라진다.

### 3.2 컴포넌트 (`src/components/`)

| 경로 | 대체된 v2 위치 | 처리 | 사용처 / 안전성 |
|------|----------------|------|-----------------|
| `src/components/EventCard.tsx` | `src/components-v2/Card/` | **삭제** | 사용처: `src/pages/EventList.tsx:10` 1건 → 페이지 삭제와 함께 dead |
| `src/components/EventMap.tsx` | (지도 컴포넌트 v2 신규 필요 시 신설) | **삭제 검토** | 사용처: `src/pages/EventDetail.tsx:8` 1건. v2 EventDetail 이 지도 컴포넌트를 자체 보유하면 삭제, 아니면 v2 로 이전 후 삭제 |
| `src/components/Pagination.tsx` | (v2 내부 처리) | **삭제** | 사용처: `src/pages/EventList.tsx:11` 1건 |
| `src/components/Modal.tsx` | (v2 모달 패턴) | **삭제** | 사용처: `src/components/TicketDetailModal.tsx:2` 1건 → TicketDetailModal 삭제와 함께 dead |
| `src/components/TicketDetailModal.tsx` | v2 MyPage 내부 처리 | **삭제** | 사용처: `src/pages/MyPage.tsx:6` 1건 |
| `src/components/PaymentModal.tsx` | `src/components-v2/PaymentModal/` | **삭제** | 사용처: `src/pages/Cart.tsx:12` 1건. v2 PaymentModal 이 v1 동작을 1:1 보존(v2 파일 주석 다수 참조) |
| `src/components/PaymentSuccess.tsx`, `PaymentFail.tsx` | v2 PaymentModal / PaymentCallback 내부 | **삭제 검토** | v1 결제 결과 페이지(§3.1)와 함께 처리. v1 페이지가 유지되면 함께 유지 |
| `src/components/Layout.tsx` | `src/components-v2/Layout/` | **§9 결정 필요** | 사용처: `src/App.tsx:4`. v1 잔존 라우트(signup, payment 결과, oauth, wallet 등)가 여전히 `<Layout>` 으로 감싸여 있음 → v2 Layout 으로 통일할지, v1 잔존을 위해 유지할지 결정 |
| `src/components/ThemeToggle.tsx` | (v2 Layout 내부) | **§9 결정 필요** | 사용처: `src/components/Layout.tsx:5,58`. v1 Layout 운명에 종속 |
| `src/components/AdminLayout.tsx` | (해당 없음) | **유지** | admin 페이지 전용 |
| `src/components/SellerLayout.tsx` | (해당 없음) | **유지** | seller 페이지 전용 |
| `src/components/ErrorBoundary.tsx` | (전역) | **유지** | v1/v2 공통 |
| `src/components/Loading.tsx` | (전역) | **유지** | App.tsx 의 가드 / Suspense 에서 사용 |

**안전성 확인 절차**: 삭제 후보 각 파일에 대해 `git grep -n "<ComponentName>"` 으로 import / JSX 사용처가 모두 § 3.1 의 삭제 대상 페이지에 한정되는지 검증. v1 잔존 페이지에서 1건이라도 import 되면 **유지로 분류 변경**.

### 3.3 스타일 (`src/styles/`)

| 경로 | 처리 | 비고 |
|------|------|------|
| `src/styles/globals.css` | **§9 결정 필요** | INVENTORY § 5: 현재 CSS 라이브러리 없음, 단일 globals.css. v2 가 `src/styles-v2/{tokens,global,index}.css` + `components/`, `pages/` 로 분화 → 합치는 방식과 변수 충돌 정책 합의 필요 (§4 / §5 와 함께 처리) |

**안전성 확인**: v1 globals.css 안에 v2 가 의존하는 reset / 폰트 / 전역 클래스가 있는지 grep. 있다면 v2 styles 로 흡수 후 삭제.

### 3.4 hooks / contexts / utils

INVENTORY § 4 / § 5 기준, 아래 항목은 v1 / v2 가 **공유** 하므로 cutover 시점에 삭제 대상 없음.

| 경로 | 처리 | 사유 |
|------|------|------|
| `src/hooks/useApi.ts`, `useDebounce.ts`, `useLocalStorage.ts` | **유지** | v1 / v2 공통, INVENTORY § 5 에서 데이터 페칭 자체 훅으로 명시 |
| `src/contexts/AuthContext.tsx` | **유지** | INVENTORY § 4: 토큰 / 가드 / `useAuth()` 진입점 |
| `src/contexts/ThemeContext.tsx`, `ToastContext.tsx` | **유지** | 전역 |
| `src/utils/index.ts` | **유지** (내부 미사용 함수만 정리) | cutover 시점에는 일괄 처리하지 말고 dead-code 정리는 § 10.3 (사후 PR) 로 분리 |

**안전성 확인**: v2 코드가 위 모듈 중 어느 함수를 import 하는지 grep 으로 매핑. v1 전용으로만 쓰이던 함수가 있다면 § 10.3 PR 에서 별도 정리.

### 3.5 의존성 (`package.json`)

§ 2.4 에서 거론된 패키지를 cutover 시점에 함께 점검. 삭제는 cutover PR 본체가 아니라 **§ 10.3 사후 PR** 로 분리해 회귀 위험을 줄인다.

| 패키지 | 점검 방법 | 처리 |
|--------|-----------|------|
| `react-type-animation` | `git grep -n "react-type-animation" src/` | v1 페이지에서만 쓰이면 cutover 후 제거 후보 |
| `react-kakao-maps-sdk` | 위와 동일 | EventMap 운명에 종속 (§ 3.2). v2 가 지도를 안 쓰면 제거 후보 |
| 그 외 | 동일 | v1 잔존 페이지에서 1건이라도 import 되면 유지 |

### 3.6 일괄 안전성 확인 명령 (요약)

cutover PR 직전, 아래 명령을 모두 실행해 결과가 **0건** 또는 **명시된 예상 위치만** 임을 확인:

```bash
# v1 페이지 import 잔존 확인 (App.tsx 외 0건이어야 함)
git grep -nE "from .*pages/(EventList|EventDetail|Cart|MyPage|Login)" src/

# v1 컴포넌트 import 잔존 확인
git grep -nE "from .*components/(EventCard|EventMap|Pagination|Modal|TicketDetailModal|PaymentModal)['\"]" src/

# v2 디렉토리 외부에서 v1 전용 자산 참조 확인
git grep -nE "components/Payment(Success|Fail)['\"]" src/
```

위 결과가 § 3.1 / § 3.2 의 "삭제 대상" 외 위치를 가리키면 **삭제를 보류**하고 § 9 의사결정 항목으로 이관.

## 4. 이동 / rename 대상 (v2 → 메인)

§ 3 의 삭제가 끝난 자리(또는 충돌하지 않는 위치)로 v2 폴더를 통째로 옮긴다.
경로 alias 는 `@/* → ./src/*` (tsconfig.json + vite.config.ts) 한 가지뿐이므로 alias 자체 변경은 불필요.

### 4.1 이동 대상 일람

| 현재 위치 | 이동 후 위치 | 처리 방식 | 비고 |
|-----------|--------------|-----------|------|
| `src/pages-v2/` | `src/pages/` | 폴더 통째로 (§ 3.1 의 v1 페이지 삭제 후) | 충돌: § 3.1 미삭제 v1 페이지(`Signup.tsx`, `OAuthCallback.tsx`, `WalletCharge*.tsx`, `SellerApply.tsx`, `NotFound.tsx`, `admin/`, `seller/`)는 그대로 같은 디렉토리에 공존 |
| `src/components-v2/` | `src/components/` | 폴더 통째로 (§ 3.2 의 v1 컴포넌트 삭제 후) | **충돌 2건**: `Layout`, `PaymentModal` (§ 4.3) |
| `src/styles-v2/` | `src/styles/` | 머지 (§ 4.4) | v1 `globals.css` 와 v2 `global.css` 충돌, 토큰/컴포넌트/페이지 css 다수 신규 |
| `src/types-v2/` | `src/types/` | 폴더 통째로 | 현재 `src/types/` 폴더 없음(INVENTORY § 3) → 충돌 없음 |
| `src/router-v2/` | `src/router/` | 폴더 통째로 (또는 § 5 에서 헬퍼 제거하며 인라인 흡수) | 사용처 1건(`src/App.tsx:8`) |

`src/lib-v2/` 는 **존재하지 않음** → 처리 불필요. 기존 `src/lib/` 는 v1/v2 공유로 유지.

### 4.2 이동 방법 — `git mv` 권장

| 옵션 | 장점 | 단점 |
|------|------|------|
| **`git mv` (권장)** | 파일 히스토리 보존 (`git log --follow`), blame 추적 가능, 리뷰 시 rename 으로 인식되어 diff 가 깔끔 | 충돌 파일은 사전 삭제 필요 |
| `cp` + `rm` | 단순함 | 히스토리 단절. blame / log --follow 가 끊김 → 비권장 |

권장 절차 (cutover PR 본체):

```bash
# 1) § 3 의 삭제부터 (이미 머지 직전 검증 완료된 상태에서)
git rm src/pages/EventList.tsx src/pages/EventDetail.tsx \
       src/pages/Cart.tsx src/pages/MyPage.tsx src/pages/Login.tsx
git rm src/components/EventCard.tsx src/components/EventMap.tsx \
       src/components/Pagination.tsx src/components/Modal.tsx \
       src/components/TicketDetailModal.tsx src/components/PaymentModal.tsx
# (충돌 컴포넌트 Layout / PaymentModal 처리는 § 4.3 결정에 따름)

# 2) v2 → 메인으로 git mv (디렉토리 단위)
git mv src/pages-v2/EventList   src/pages/EventList
git mv src/pages-v2/EventDetail src/pages/EventDetail
git mv src/pages-v2/Cart        src/pages/Cart
git mv src/pages-v2/MyPage      src/pages/MyPage
git mv src/pages-v2/Login       src/pages/Login
git mv src/pages-v2/Landing     src/pages/Landing
git mv src/pages-v2/PaymentCallback src/pages/PaymentCallback
git mv src/pages-v2/_shared     src/pages/_shared
git mv src/pages-v2/_dev        src/pages/_dev      # § 9 결정: dev-only 라면 제외 검토
rmdir src/pages-v2

git mv src/components-v2/<each>  src/components/<each>   # § 4.3 충돌 처리 후
rmdir src/components-v2

git mv src/types-v2  src/types
git mv src/router-v2 src/router  # § 5 에서 헬퍼 제거와 함께 처리할 수도 있음
```

대안 — **`git mv src/pages-v2/* src/pages/`** 로 한 번에 옮기는 셸 글롭은 동작하지만 충돌 파일이 있을 때 진단이 어려우므로 디렉토리 단위로 분리 권장.

### 4.3 충돌 컴포넌트 (`Layout`, `PaymentModal`) 처리

`comm` 결과로 v1/v2 동명 컴포넌트는 정확히 **2건**:

| 이름 | v1 파일 | v2 위치 | 처리 방침 |
|------|---------|---------|-----------|
| `Layout` | `src/components/Layout.tsx` (단일 파일) | `src/components-v2/Layout/` (폴더) | **§ 9 결정 필요**. v1 Layout 은 `src/App.tsx:4` 가 잔존 v1 라우트 래핑에 사용. v2 Layout 으로 통일하려면 v1 잔존 페이지(signup, oauth, wallet 결과 등)도 v2 Layout 으로 동시 전환 필요 |
| `PaymentModal` | `src/components/PaymentModal.tsx` | `src/components-v2/PaymentModal/` | § 3.2 에서 v1 삭제 확정 → v1 삭제 후 v2 폴더를 `git mv` 로 같은 자리로 |

**충돌 처리 일반 원칙**:
1. v1 을 먼저 `git rm` (§ 3 단계)
2. 같은 PR 안에서 v2 폴더를 `git mv` 로 같은 이름으로 이동
3. git 은 이를 **삭제 + 추가**가 아니라 **rename** 으로 인식 → blame 은 v2 측 히스토리만 따라감 (v1 측 히스토리는 삭제된 파일로 별도 보존됨)

별도 폴더로 공존시키는 안(`components/v1/`, `components/v2/`)은 cutover 의 목적(코드 단일화)에 어긋나므로 채택하지 않음.

### 4.4 styles 머지 (§ 3.3 와 연계)

v1 `src/styles/globals.css` 1개 ↔ v2 `src/styles-v2/{tokens.css, global.css, index.css, accent.ts, components/*.css(16), pages/*.css(10)}`.

| 항목 | 처리 |
|------|------|
| v1 `globals.css` | v2 가 의존하는 reset / 폰트 / 전역 변수가 있는지 grep 후, 필요한 부분만 `src/styles/global.css` 로 흡수, 나머지 삭제 |
| v2 `tokens.css`, `global.css`, `index.css` | `src/styles/` 로 그대로 이동 |
| v2 `components/`, `pages/` 하위 | 폴더 채로 이동 |
| v2 `accent.ts` | TS 파일이므로 위치 정책 결정(§ 9). `src/styles/` 안에 TS 가 들어가도 되는지, 아니면 `src/lib/` 또는 `src/utils/` 로 분리할지 |
| 이름 충돌 | v1 `globals.css` ↔ v2 `global.css` (s 유무) → 단복수 통일하면서 한쪽으로 합치기 |

### 4.5 import 경로 변경 — 현재 그랩 결과

이동 후 변경해야 할 import 경로 통계 (cutover 직전 시점, `git grep` 기준):

| 패턴 | import 라인 수 | 영향 받은 파일 수 | 변경 형태 |
|------|----------------|--------------------|-----------|
| `pages-v2` | 12 | 17 | `@/pages-v2/X` → `@/pages/X` <br> `./pages-v2/X` → `./pages/X` (App.tsx 의 `lazy(...)` 다수) |
| `components-v2` | 64 | 52 | `@/components-v2/X` → `@/components/X` |
| `styles-v2` | 5 | 13 | `@/styles-v2/...` → `@/styles/...` <br> CSS `import` 도 동일 |
| `types-v2` | 5 | 5 | `@/types-v2/X` → `@/types/X` |
| `router-v2` | 1 | 1 | `./router-v2` → `./router` (App.tsx) |
| **합계** | **87** | **88** (중복 제외 시 더 적음) | — |

import 라인 수 vs 파일 수 차이: 한 파일에서 같은 v2 디렉토리를 여러 번 import 하는 경우(예: `@/components-v2/Button` + `@/components-v2/Card` 한 파일에서) 때문. 라인 단위로 치환해야 누락 없음.

### 4.6 자동화 — `sed` 1줄로 충분

alias 가 `@/*` 한 가지뿐이고 v2 접미사가 디렉토리명 끝에 붙는 단순 패턴이라, **codemod 없이 `sed` 로 치환 가능**.

```bash
# dry-run: 매칭 라인 출력
git grep -lE "(pages-v2|components-v2|styles-v2|types-v2|router-v2)" -- 'src/**/*.{ts,tsx,css}' \
  | xargs -I{} grep -nE "(pages-v2|components-v2|styles-v2|types-v2|router-v2)" {}

# 실제 치환 (BSD/GNU sed 호환을 위해 -i.bak 후 .bak 정리)
git grep -lE "(pages-v2|components-v2|styles-v2|types-v2|router-v2)" -- 'src/**/*.{ts,tsx,css}' \
  | xargs sed -i.bak -E 's@(pages|components|styles|types|router)-v2@\1@g'
find src -name '*.bak' -delete

# 검증: v2 접미사가 코드에서 0건이어야 함
git grep -nE "(pages|components|styles|types|router)-v2" src/ && echo "FAIL: v2 잔존" || echo "OK"
```

**주의 / 함정**:
- 위 정규식은 단어 경계 없이 치환하므로 `pages-v2-something` 같은 문자열도 잡힘 → 실제 치환 전에 `grep -nE` 결과를 한 번 눈으로 검토
- 문자열 리터럴 / 주석 안의 `pages-v2` 도 함께 바뀜 (예: § 3 의 코드 주석에서 v1 경로 인용) — 의도와 다른 변경이 없는지 PR diff 검토 필수
- CSS 안의 `@import url("../styles-v2/...")` 같은 케이스도 같은 sed 한 줄로 함께 바뀜
- `components-v2/Layout` 처럼 **충돌 컴포넌트** import 는 sed 치환 후 v1 자리에 놓이므로, § 4.3 의 v1 삭제가 반드시 선행되어야 함

자동화 스크립트는 cutover PR 의 **첫 커밋**에서 한 번에 적용해 diff 를 분리하면 리뷰가 쉬움 (rename diff + import 치환 diff 가 섞이지 않게).

## 5. 수정 대상 (라우터 / 토글 / import)

§ 3 (삭제) / § 4 (이동) 와 별개로, **파일 삭제 / 이동 없이 코드 본문만 고치는** 작업을 모은다.

### 5.1 라우터 정의 (`src/App.tsx`)

현재 `src/App.tsx` 는 9개 라우트가 `<VersionedRoute v1={...} v2={...} />` 로 분기되고, lazy import 가 v1 / v2 두 벌 선언되어 있다 (`src/App.tsx:8, 22-30, 41-49, 94, 109-114, 122-123`).

수정 항목:

| 라인 (현재) | 변경 |
|-------------|------|
| `:8` `import { VersionedRoute, RequireAuthV2 } from './router-v2'` | `VersionedRoute` import 제거. `RequireAuthV2` 는 § 5.2-(c) 결정에 따라 처리 |
| `:11-15` v1 즉시 import (`EventList`, `EventDetail`, `Login`, `Signup`, `NotFound`) | `EventList`, `EventDetail`, `Login` 제거 (§ 3.1 삭제 대상). `Signup`, `NotFound` 는 v1 잔존 → 유지 |
| `:22-30` v2 lazy import 9건 (`LoginV2`, `EventListV2`, `EventDetailV2`, `CartV2`, `PaymentSuccessV2`, `PaymentFailV2`, `PaymentCompleteV2`, `MyPageV2`, `LandingV2`) | `V2` 접미사 제거 + 경로 `./pages-v2/` → `./pages/` (§ 4.5 sed 와 일괄). 비로그인 첫 화면 5종은 lazy → 즉시 import 로 전환 검토 (§ 9) |
| `:33-37` `_dev` showcase lazy import 3건 | **§ 9 결정 필요**. Landing.plan §12 주석상 cutover/PR 4 cleanup 시 제거 예정 → 보통은 § 10.3 사후 PR 에서 일괄 삭제 |
| `:41-49` v1 lazy import (`Cart`, `MyPage`, `PaymentSuccess`, `PaymentFail`, `PaymentComplete`) | 모두 제거 (§ 3.1 삭제 대상). `SignupComplete`, `Payment`, `SellerApply`, `WalletChargeSuccess`, `WalletChargeFail` 는 v1 잔존 → 유지 |
| `:94` `<Route path="/login" element={<VersionedRoute v1={<Login />} v2={<LoginV2 />} />} />` | `element={<Login />}` (v2 가 새 `Login`) |
| `:102-105` `_dev` 라우트 3건 | § 5.1 의 `_dev` import 와 운명 동일 |
| `:109` `/` Landing 분기 | `element={<Landing />}`. **§ 9 결정**: `/` 를 Landing 으로, `/events` 를 EventList 로 분리 (현재 둘 다 `?v=1` 에서 EventList) |
| `:110` `/events` 분기 | `element={<EventList />}` |
| `:111` `/events/:id` 분기 | `element={<EventDetail />}` |
| `:112` `/cart` 분기 | `element={<RequireAuth><Cart /></RequireAuth>}` |
| `:114` `/payment/complete` 분기 | `element={<RequireAuth><PaymentComplete /></RequireAuth>}` (v2 가 새 `PaymentComplete`) |
| `:115-120` `/mypage/*` 의 가드 중첩 분기 | `element={<RequireAuth><MyPage /></RequireAuth>}`. **§ 5.2-(c)** 의 가드 통일 결정에 따라 `RequireAuth` 가 returnTo 동작 흡수 |
| `:122-123` `/payment/success`, `/payment/fail` 분기 | 동일 패턴으로 단일화 |

수정 후 App.tsx 의 v1 즉시 import (`Signup`, `NotFound`)와 v1 잔존 lazy import 5종은 그대로 유지.

### 5.2 router-toggle 헬퍼 정리 (`src/router-v2/`)

INVENTORY § 5 / router-toggle.plan §2 기준, 토글 메커니즘은 다음 4개 파일로 구성:

| 파일 | 처리 | 사유 |
|------|------|------|
| `src/router-v2/VersionedRoute.tsx` (12 LOC) | **삭제** | § 5.1 에서 호출 0건 됨 → dead |
| `src/router-v2/useUiVersion.ts` (32 LOC) | **삭제** | URL `?v=` / `localStorage['ui.version']` / env `VITE_UI_DEFAULT_VERSION` 우선순위 해석. 분기 사라지면 호출 0건 |
| `src/router-v2/RequireAuthV2.tsx` (23 LOC) | **§ 9 결정 — 둘 중 하나** | 옵션 (c-1) v1 `RequireAuth` (`App.tsx:67-72`) 를 삭제하고 이 파일을 메인 `RequireAuth` 로 승격(returnTo 기능 보존). 옵션 (c-2) v2 returnTo 기능을 v1 `RequireAuth` 에 흡수하고 이 파일은 삭제 |
| `src/router-v2/index.ts` (4줄 barrel) | **삭제 또는 갱신** | 위 결정에 따라. `RequireAuthV2` 만 살아남으면 barrel 정리 후 § 4.1 의 `router-v2/ → router/` 이동에 합류 |

**부수 효과**:
- `localStorage['ui.version']` 키는 cutover 후 의미 없는 stale 데이터로 남음 → § 6 (마이그레이션) 에서 1회성 cleanup 다룸
- `VITE_UI_DEFAULT_VERSION` env 는 § 5.5 에서 함께 제거

**삭제 안전성 확인**:
```bash
git grep -nE "VersionedRoute|useUiVersion|UiVersion|RequireAuthV2" src/
# App.tsx 의 § 5.1 수정이 끝난 후 0건이어야 함 (RequireAuthV2 는 § 9 결정에 따라 잔존 가능)
```

### 5.3 import 경로 일괄 변경

§ 4.5 / § 4.6 의 sed 한 줄로 처리 (`-v2` 접미사 일괄 제거). 이 절은 sed 결과를 라우터 외 파일에서도 검증.

| 영향 받는 import 패턴 | 검증 명령 |
|-----------------------|-----------|
| `@/components-v2/X` → `@/components/X` (라인 64건) | `git grep -n "components-v2" src/` 결과 0건 |
| `@/pages-v2/X` → `@/pages/X` (라인 12건) | `git grep -n "pages-v2" src/` 결과 0건 |
| `@/styles-v2/X` → `@/styles/X` (라인 5건, CSS `import` 포함) | `git grep -nE "styles-v2" src/` 결과 0건 |
| `@/types-v2/X` → `@/types/X` (라인 5건) | `git grep -n "types-v2" src/` 결과 0건 |
| `./router-v2` → `./router` (App.tsx 1건) | `git grep -n "router-v2" src/` 결과 0건 |

추가로, §5.1 의 라우터 수정이 끝난 뒤에는 주석 / lazy 변수명에 남은 `V2` 접미사도 함께 정리:
```bash
git grep -nE "\b(LoginV2|EventListV2|EventDetailV2|CartV2|MyPageV2|LandingV2|Payment(Success|Fail|Complete)V2)\b" src/
# 0건이어야 함
```

IDE refactor (VS Code "Rename Symbol") 도 가능하지만, alias 변경은 단순 텍스트 치환이라 `sed` 가 빠르고 정확.

### 5.4 docs/CLAUDE.md

전체 16줄 짜리 1개 섹션 (`docs/CLAUDE.md:1-16`) 전부 cutover 의 영향권. 옵션:

- **옵션 A — 통째로 삭제**: "v2 재구축" 자체가 종료되었으므로 섹션 제거. 깔끔하지만 신규 합류자가 "v2 가 무엇이었는지" 추적 불가.
- **옵션 B — "완료됨" 으로 변환** (권장): 섹션 제목을 "프론트엔드 디자인 가이드" 등 일반 명칭으로 바꾸고, 절대 규칙 중 다음만 남김:
  - "모든 API 응답은 페이지별 adapters.ts 거쳐서 VM으로 변환"
  - "프로토타입의 인라인 style, window.\*, useStateA 별칭은 가져오지 않음"
  - "프로토타입의 mock 데이터는 코드에 들어가면 안 됨 (반드시 실제 API)"
  
  제거 대상:
  - "신규 코드: src/pages-v2/, src/components-v2/, src/styles-v2/" (디렉토리 자체가 사라짐)
  - "기존 src/pages/, src/components/는 cutover PR 전까지 절대 수정 금지" (cutover 완료)
  - "페이지 1개 작업 = plan 먼저" (작업 절차 항목, 별도 WORKFLOW.md 로 위임)

옵션 B 채택 권장. 실제 문구는 cutover PR 본문에서 확정.

### 5.5 환경 변수 / config

| 항목 | 위치 | 처리 | 검증 |
|------|------|------|------|
| `VITE_UI_DEFAULT_VERSION=1` | `.env.development:4` | **삭제** | 토글 사라짐 → 의미 없음 |
| `VITE_UI_DEFAULT_VERSION` 주석 | `src/api/.env.example:5` | **삭제** | 동일 |
| `VITE_API_BASE_URL`, `VITE_GOOGLE_OAUTH_URL`, `VITE_KAKAO_MAP_KEY`, `VITE_TOSS_CLIENT_KEY` | (각 위치) | **유지** | v2 와 무관 |
| `tsconfig.json` paths (`@/*`) | `tsconfig.json:24` | **유지** | alias 자체는 그대로 |
| `vite.config.ts` alias | `vite.config.ts:9` | **유지** | 동일 |

**검증**:
```bash
git grep -nE "VITE_UI_DEFAULT_VERSION|ui\.version" .env* src/  # 0건이어야 함
```

### 5.6 테스트 import 경로

INVENTORY § 5 + § 1.5 기준 **테스트 인프라 미설치** (Vitest/Jest 등 의존성 0개, `*.test.*` / `*.spec.*` 파일 0개). 이 절은 **NO-OP**.

테스트가 도입된 상태였다면 § 5.3 의 sed 한 줄이 `src/` 에 한정되어 있으므로, `tests/` 또는 `__tests__/` 디렉토리에 같은 sed 를 별도 적용하면 됨.

### 5.7 검증 (전체)

cutover PR 의 마지막 빌드 검증 시퀀스:

```bash
# 1) 타입 체크 (현재 npm script 미정의 → tsc 직접 호출)
npx tsc --noEmit

# 2) lint (INVENTORY § 5 기준 ESLint 미설치 → § 9 결정에 따라 도입 시 실행)
# npx eslint src/

# 3) 빌드
npm run build

# 4) v2 잔재 0건 확인
git grep -nE "(pages|components|styles|types|router)-v2|VersionedRoute|useUiVersion|VITE_UI_DEFAULT_VERSION|ui\.version|\bV2\b" src/ .env*
# (router/ 안의 RequireAuthV2 가 § 9-c 옵션으로 살아남는 경우는 예외)

# 5) 번들 크기 비교 (§ 1.5)
ls -la dist/assets/
```

위 4 / 5 단계가 통과하면 cutover PR 머지 가능 상태.

## 6. v1 ↔ v2 호환성 / 마이그레이션

요약: **사용자 영향이 있는 마이그레이션은 사실상 없음**.
v2 가 `AuthContext` / `ThemeContext` / 서버 cart 를 그대로 재사용했기 때문에 클라이언트 영속 데이터 포맷이 동일.
유일하게 정리할 잔재는 `localStorage['ui.version']` 키 (의미 사라짐).

### 6.1 인증 토큰 — 호환성: **OK** (마이그레이션 0)

| 항목 | v1 | v2 | 호환 |
|------|----|----|------|
| 저장소 | localStorage | localStorage (공유 — `src/contexts/AuthContext.tsx`, `src/api/client.ts`) | 동일 |
| 키 1 | `accessToken` | 동일 (`AuthContext.tsx:30,56,66,72`, `client.ts:37,89,97`) | 동일 |
| 키 2 | `refreshToken` | 동일 (`AuthContext.tsx:57,67,73`, `client.ts:85,98`) | 동일 |
| 키 3 | `userId` | 동일 (`AuthContext.tsx:38,58,74`, `client.ts:38,99`) | 동일 |
| 401 재발급 | `client.ts` 인터셉터 | 동일 모듈 사용 | 동일 |
| 가드 | v1 `RequireAuth` (App.tsx) / v2 `RequireAuthV2` (router-v2) | 가드 코드만 다르고 토큰 / `useAuth()` 는 공유 | 동일 |

**결론**: v2 코드가 자체 토큰 저장 로직을 가지지 않음 (`git grep -n "localStorage" src/pages-v2/ src/components-v2/ src/router-v2/` → 토글 키 외 0건). cutover 전후로 같은 localStorage 가 그대로 유효 → **재로그인 불필요, 마이그레이션 코드 0**.

처리 방침: **무시**.

### 6.2 장바구니 데이터 — 호환성: **OK** (서버 단일 소스)

Cart.plan § 3 에서 **Option B (서버 only)** 채택. 근거:
- v1 (`src/pages/Cart.tsx`) 도 서버 API 만 사용. 본문 grep 결과 v1 Cart 의 `localStorage` / `sessionStorage` 사용 0건.
- v2 (`src/pages-v2/Cart/`) 도 동일하게 `getCart` / `addCartItem` / `clearCart` 서버 API 만 사용. 클라이언트 영속 0건.

| 항목 | v1 | v2 | 호환 |
|------|----|----|------|
| 영속 위치 | 서버 (`/cart`) | 서버 (`/cart`) | 동일 |
| 클라이언트 캐시 | 없음 | 페이지 내 메모리만 (Cart.plan §3 의 낙관적 업데이트) | 무관 |

**결론**: 서버가 단일 소스이므로 클라이언트 마이그레이션 0. cutover 직후 v2 페이지가 `getCart` 를 호출하면 그대로 기존 카트가 보임.

처리 방침: **무시**.

### 6.3 테마 / 사용자 설정 — 호환성: **OK**

| 항목 | 위치 | 값 | 호환 |
|------|------|----|------|
| localStorage 키 | `devticket-theme` (`ThemeContext.tsx:13`) | `'light' \| 'dark' \| 'system'` | v1 / v2 동일 (모듈 공유) |
| DOM 적용 | `document.documentElement.setAttribute('data-theme', ...)` (`ThemeContext.tsx:21`) | `'light' \| 'dark'` | 동일 |
| Provider 마운트 | `src/main.tsx:24` | `<ThemeProvider>` 로 앱 전체 | 동일 |
| v2 사용처 | `src/components-v2/Layout/index.tsx:7,78,188` 가 같은 `useTheme()` 사용 | — | 동일 |
| v2 CSS | `src/styles-v2/components/*.css` 가 `[data-theme="dark"]` 셀렉터로 분기 (chip / ide-chrome 등) | — | 같은 attribute 의존 |

**결론**: Phase 0 에서 ThemeContext 자체를 리팩터하지 않음 (코드 위치 / 키 / attribute 모두 그대로). cutover 후에도 기존 사용자의 테마 선호 유지.

처리 방침: **무시**.

### 6.4 URL 쿼리스트링 — 호환성: **부분** (v1 → v2 손실 0건, v2 → v1 백워드는 무의미)

| 페이지 | v1 | v2 | 호환 |
|--------|----|----|------|
| EventList (`/`, `/events`) | 필터 / 페이지를 **URL 에 저장 안 함** (내부 state 만 — `src/pages/EventList.tsx:27, 44-54`) | URL 키: `q`(키워드), `cat`(카테고리), `stack`(기술 스택), `page`(0-base) — `src/pages-v2/EventList/hooks.ts:20-26` | v1 사용자가 가진 북마크 / 공유 URL 에는 필터 정보가 애초에 **없음** → 호환성 문제 없음 |
| EventDetail (`/events/:id`) | path param `:id` | 동일 | 동일 |
| Cart (`/cart`) | 쿼리 없음 | 쿼리 없음 | 동일 |
| Login (`/login`) | 쿼리 없음 | `?returnTo=...` 추가 (RequireAuthV2 의 returnTo, `RequireAuthV2.tsx:17-19`) | v2 신규 — v1 사용자 영향 없음 |
| MyPage (`/mypage/*`) | 단일 페이지 (`/mypage`) | 하위 path (`/mypage/*` 의 sub-route) | v2 가 매칭 범위 확장 — v1 북마크 (`/mypage`) 는 v2 에서도 유효 |

**결론**: v1 쪽 쿼리 정보가 빈약했기 때문에 cutover 시 손실되는 정보가 없음. v2 가 새로 도입한 키(`q`, `cat`, `stack`, `page`, `returnTo`)는 모두 net-new.

처리 방침: **무시** (단, EventList 의 `cat=` 값 슬러그가 INVENTORY § 8 의 `CATEGORY_MAP` 과 일치하는지는 § 9 에서 별도 확인 필요).

### 6.5 SSR / hydration — N/A

SPA 빌드 (Vite + `vite build`). `renderToString` / `hydrateRoot` 등 SSR 진입점 0건. 서버 렌더링이 없으므로 v1 ↔ v2 hydration mismatch 가 발생할 수 없음.

처리 방침: **N/A**.

### 6.6 Stale 잔재 — `localStorage['ui.version']` (선택적 cleanup)

cutover 후에도 사용자 브라우저에 남는 유일한 의미 없는 키.

| 항목 | 값 | cutover 후 동작 |
|------|----|-------------------|
| 키 | `ui.version` (`router-v2/useUiVersion.ts:5`) | 토글 자체가 사라지므로 읽는 코드 없음 |
| 값 예시 | `'2'` (이전에 `?v=2` 로 접속한 사용자) | 무시됨 |
| 영향 | 없음 (단지 stale localStorage 한 칸 차지) | — |

**옵션**:
- (a) **무시** (권장). 의미 없는 데이터 1 키 정도는 남겨도 사용자 영향 0. 코드 추가 0.
- (b) **1회성 cleanup**. `src/main.tsx` 진입부에 `localStorage.removeItem('ui.version')` 한 줄 추가. § 10.3 사후 PR 에서 N주 후 삭제. 코드 1줄 vs 2번의 PR.

권장: **(a) 무시**. 단, INVENTORY / CLAUDE.md 정리 차원에서 § 7 의 router-toggle.plan 아카이브 노트에 "stale 키 `ui.version` 은 cleanup 하지 않음 (영향 없음)" 명시.

### 6.7 캐시 무효화 (CDN / SW / 브라우저)

| 레이어 | 무효화 필요? | 비고 |
|--------|--------------|------|
| Service Worker | **N/A** | 현재 SW 등록 없음 (`git grep -n "serviceWorker" src/` → 0건 가정. cutover 직전 재확인) |
| 브라우저 캐시 (HTML) | **자동** | Vite 가 빌드 산출물에 hash 부착 (`assets/index-XXXX.js`) → `index.html` 만 새로 받으면 자동 무효화 |
| CDN (있다면) | **수동** | 배포 파이프라인에서 `index.html` 무효화 보장 필요. 배포 인프라 책임 (이 plan 범위 밖) |
| react-query 등 | **N/A** | INVENTORY § 5: 데이터 캐시 라이브러리 미도입 |

처리 방침: 인프라 측면은 cutover 배포 절차에 명시 (`§ 10.2` 의 PR 본문 / 배포 체크리스트), 코드 변경 0.

### 6.8 종합 요약

| 영역 | 호환 | 처리 |
|------|------|------|
| 인증 토큰 | OK (동일 키 / 동일 모듈) | 무시 |
| 장바구니 | OK (서버 단일 소스) | 무시 |
| 테마 | OK (동일 키 / 동일 attribute) | 무시 |
| URL 쿼리 | 부분 OK (v1 쪽 정보 빈약 → 손실 0) | 무시 |
| SSR | N/A | N/A |
| `ui.version` 키 | stale 1건 | 무시 (옵션: 1회성 cleanup) |
| 캐시 | 자동 hash 무효화 | 무시 (CDN 만 인프라 측에서 처리) |

**마이그레이션 코드 위치 / 제거 시점**: 위 옵션 6.6-(b) 채택 시에만 의미 있음. 채택 시 → `src/main.tsx` 1줄 추가 → cutover 후 4~8주(=평균 활성 사용자 1회 방문 주기) 뒤 § 10.3 사후 PR 에서 제거. 그 외 마이그레이션 코드는 **추가하지 않음**.

## 7. docs/redesign/ 정리

cutover 가 끝나면 `docs/redesign/` 의 존재 의의(=v2 재구축의 설계 / 작업 가이드)가 사라진다.
원칙: **git history 가 있으니 폴더 통째로 삭제**, 단 외부 참조(코드 주석 + CLAUDE.md)는 별도로 정리.

### 7.1 현재 폴더 인벤토리

| 파일 | LOC | 분류 |
|------|-----|------|
| `README.md` | 87 | 가이드 (인덱스) |
| `Spec.md` | 463 | 디자인 / API 스펙 |
| `WORKFLOW.md` | 307 | 작업 가이드 |
| `pr-templat.md` | 134 | PR 템플릿 (오타 그대로) |
| `INVENTORY.md` | 432 | 사전 조사 (페이지 / API / 인증 매핑) |
| `Cutover.plan.md` | 630 | **본 문서** |
| `Cart.plan.md` | 1172 | 페이지 plan |
| `EventDetail.plan.md` | 1434 | 페이지 plan |
| `EventList.plan.md` | 894 | 페이지 plan |
| `Landing.plan.md` | 1700 | 페이지 plan |
| `Login.plan.md` | 446 | 페이지 plan |
| `MyPage.plan.md` | 2843 | 페이지 plan |
| `layout.plan.md` | 1186 | 횡단 plan |
| `router-toggle.plan.md` | 264 | 횡단 plan |
| `shared-components.plan.md` | 1820 | 횡단 plan |
| `tokens.plan.md` | 778 | 횡단 plan |
| `prototype/` (12 항목) | — | jsx 8 + tokens.css + ide-theme.css + html + assets/ |

총 16 markdown + prototype 트리. 합계 약 14,590 LOC.

### 7.2 삭제 대상 (전체)

원칙적으로 **모두 삭제**. 사후 가치는 git log / blame 으로 충분히 추적 가능.

```bash
# 페이지 / 횡단 plan + 가이드
git rm docs/redesign/README.md \
       docs/redesign/Spec.md \
       docs/redesign/WORKFLOW.md \
       docs/redesign/pr-templat.md \
       docs/redesign/INVENTORY.md \
       docs/redesign/Cart.plan.md \
       docs/redesign/EventDetail.plan.md \
       docs/redesign/EventList.plan.md \
       docs/redesign/Landing.plan.md \
       docs/redesign/Login.plan.md \
       docs/redesign/MyPage.plan.md \
       docs/redesign/layout.plan.md \
       docs/redesign/router-toggle.plan.md \
       docs/redesign/shared-components.plan.md \
       docs/redesign/tokens.plan.md

# 프로토타입 트리 (재귀)
git rm -r docs/redesign/prototype/

# Cutover.plan.md (본 문서) — cutover PR 자체의 변경 이력으로 가치가 끝남 → 함께 삭제
git rm docs/redesign/Cutover.plan.md

# 폴더 자체 (git 은 빈 디렉토리를 추적 안 함, 위 명령으로 사실상 사라짐)
```

기재 정정: 원래 요청에 있던 파일 중 다음은 **존재하지 않음** → 삭제 명령에서 제외:
- `docs/redesign/SETUP.md` — 없음
- `docs/redesign/{Page}.pr.md` (PR 본문 모음) — 없음. PR 템플릿은 `pr-templat.md` 1개만 존재 (오타 유지)
- 실제 스펙 파일명은 `SPEC.md` 가 아니라 `Spec.md` — 위 명령에 정정 반영

### 7.3 보존 검토 (옵션)

전체 삭제 외 대안:

| 옵션 | 처리 | 장점 | 단점 |
|------|------|------|------|
| **(A) 전체 삭제** (권장) | 위 § 7.2 명령 | 깔끔. git history 가 사후 참조원 | history 검색 비용. 외부 링크(이슈 / PR / 외부 문서) 깨짐 |
| (B) 통째로 `docs/archive/v2-cutover/` 로 이동 | `git mv docs/redesign docs/archive/v2-cutover` | 외부 링크 살아있음. 코드 주석 (§ 7.4) 도 부분적으로 유효 | repo 에 dead 문서 14k LOC 잔존 |
| (C) 선별 보존 | INVENTORY 와 Spec 만 `docs/architecture/` 로 이동 | 디자인 결정 / API 매핑 등 이후에도 참조 가치 있는 일부만 살림 | 어디까지 살릴지 결정 비용. plan / prototype 은 어차피 생명주기 끝남 |

**권장: (A) 전체 삭제**. 다만 § 7.4 의 코드 주석이 다수라 (B) 옵션의 효용이 무시할 수 없으므로, **§ 9 의사결정 항목**으로 이관해 PR 시점에 최종 합의.

(C) 가 채택되는 경우 후보:
- `INVENTORY.md` → `docs/architecture/api-inventory.md` (페이지 ↔ API 매핑은 cutover 후에도 유효)
- `Spec.md` 의 § 0 (공통 규칙) / § 10 (API 가이드) → `docs/architecture/frontend-conventions.md` 로 발췌 이식

### 7.4 코드 주석의 dangling reference

`git grep` 결과 `src/` 안에 `docs/redesign/...` 를 가리키는 주석이 **약 30+ 곳** 존재 (§ 7.0 grep 참조). 대표 예:

| 위치 | 참조 |
|------|------|
| `src/components-v2/Icon/index.tsx:5` | `docs/redesign/prototype/common.jsx` |
| `src/components-v2/Layout/*.tsx` (10여 곳) | `docs/redesign/layout.plan.md §3-x` |
| `src/lib/format.ts:1` | `docs/redesign/prototype/common.jsx` |
| `src/pages-v2/Cart/{adapters,types}.ts` | `docs/redesign/Cart.plan.md` |
| `src/pages-v2/PaymentCallback/types.ts` | `docs/redesign/Cart.plan.md` |
| `src/pages-v2/Landing/components/TypedTerminal.tsx:7` | `docs/redesign/Landing.plan.md §3, §12.1` |
| `src/styles-v2/accent.ts:1` | `docs/redesign/prototype/common.jsx` |
| `src/styles-v2/components/accent-media-box.css:2` | `docs/redesign/prototype Cart thumb` |

이 주석들의 처리:

| 옵션 | 처리 | 비고 |
|------|------|------|
| **(α) 그대로 둠** | 손대지 않음 | 가장 단순. 주석은 "출처는 git log 에서 추적" 의미로 격하됨. dead link 지만 동작에는 영향 0 |
| (β) 전부 제거 | 30+ 파일에서 해당 주석 라인만 삭제 | 대규모 diff. § 10.3 사후 PR 로 분리 권장 |
| (γ) 일괄 치환 | `docs/redesign/X` → `(legacy: v2 재구축 설계, git history 참조)` | 주석은 남기되 dead link 표시. sed 한 줄 가능하지만 §3-x 같은 섹션 번호 보존이 까다로움 |

**권장**: (α) 그대로 두고, § 10.3 사후 PR 에서 dead-code / dead-comment 정리할 때 (β) 진행. cutover PR 본체에서는 손대지 않음 (diff 노이즈 감소).

§ 7.3 에서 (B) 를 채택하면 주석의 경로가 `docs/archive/v2-cutover/...` 로 부분 유효 → 그래도 (β) 의 정리 가치는 유지 (출처 명시는 좋지만 cutover 후엔 stale).

### 7.5 docs/CLAUDE.md 의 참조 제거

`docs/CLAUDE.md` 5~7 행에 `docs/redesign/` 참조 3건:

```
- 디자인 & API 스펙: @docs/redesign/SPEC.md
- 작업 가이드: @docs/redesign/WORKFLOW.md
- 시각 참고 프로토타입: @docs/redesign/prototype/
```

§ 5.4 의 옵션 B (CLAUDE.md "완료됨" 변환) 와 함께 **세 줄 모두 제거**. § 7.3 (C) 가 채택되면 살아남은 문서로 1~2 줄 갱신.

검증:
```bash
git grep -nE "docs/redesign" docs/CLAUDE.md   # 0건이어야 함
git grep -nE "docs/redesign" -- ':!src/'      # 코드 외 영역에서 0건이어야 함
```

### 7.6 PR 분할 (이 절의 작업 위치)

| 작업 | 어느 PR | 사유 |
|------|---------|------|
| `docs/redesign/` 전체 삭제 (§ 7.2) | **§ 10.2 PR 2 (Cutover 본체)** | 코드 cutover 와 한 묶음. 삭제 후 빌드 영향 0 |
| 코드 주석 정리 (§ 7.4 옵션 β) | **§ 10.3 PR 3 (사후 정리)** | diff 분리 / 리뷰 부담 감소 |
| `docs/CLAUDE.md` 갱신 (§ 7.5) | **§ 10.2 PR 2 (Cutover 본체)** | 본체와 의미적으로 한 단위 |
| (C) 선별 보존 — `docs/architecture/` 이동 | **§ 10.1 PR 1 (선행 정리)** | cutover 본체 diff 를 키우지 않기 위해 사전 분리 |

## 8. 롤백 계획

### 8.0 전제 — 배포 인프라 요약

| 환경 | 트리거 | 방식 | 롤백 자연 경로 |
|------|--------|------|----------------|
| 운영 (main) | `push` to `main` (`.github/workflows/headbuttingdino-front-cd.yaml`) | self-hosted runner → Docker Hub `devticket-frontend:{SHORT_SHA, latest}` push → `docker stop && rm && run --restart always` + `curl http://localhost:80` 헬스체크 (10회 × 2s) | 컨테이너 재시작이 빠름 (수십 초). `:{SHORT_SHA}` 이전 태그가 Docker Hub 에 살아 있으면 즉시 재배포 가능 |
| 개발 (develop) | `push` to `develop` (`.github/workflows/headbuttingDino_front_develp_cd.yml`) | Docker Hub `:dev` 태그 + `kubectl set image deployment/frontend ... && rollout restart` (k3s) | `kubectl rollout undo deployment/frontend -n devticket` 한 줄로 직전 ReplicaSet 으로 즉시 복귀 |

핵심 사실:
- **canary / blue-green / 점진 배포 없음** → cutover 머지 = 전체 트래픽 플립.
- **DB / 백엔드 변경 없음** (이 PR 은 프론트엔드 단독). 데이터 측면 롤백 부담 0.
- v1 코드는 cutover PR 머지 직전까지 main 에 살아있음 → **머지 직전 커밋이 바로 v1 fallback**.

### 8.1 즉각 롤백 (배포 직후 critical 이슈)

**판단 기준** (아래 중 하나라도 해당하면 즉시):
- 헬스체크 실패 / `index.html` 5xx
- 콘솔 에러로 인한 화이트 스크린이 메인 동선에서 재현
- 결제 / 로그인 / 장바구니 → 주문 동선 차단

**경로 A — 컨테이너 재배포 (가장 빠름, 권장)**:

```bash
# 운영 (main): 직전 SHORT_SHA 로 :latest 재태깅 후 재기동
PREV_SHA=<머지 직전 main 커밋의 SHORT_SHA>
docker pull $DOCKERHUB_USER/devticket-frontend:${PREV_SHA}
docker tag  $DOCKERHUB_USER/devticket-frontend:${PREV_SHA} \
            $DOCKERHUB_USER/devticket-frontend:latest
docker push $DOCKERHUB_USER/devticket-frontend:latest
# 그 후 self-hosted 머신에서 deploy 잡과 동일 절차 수동 실행 (또는 워크플로우 re-run)

# 개발 (develop) / k3s: 한 줄 롤백
sudo /usr/local/bin/k3s kubectl -n devticket rollout undo deployment/frontend
```

장점: 코드 / git 변경 없이 수십 초 내 복구. 단점: main HEAD 와 배포 상태가 어긋남 → 곧바로 경로 B 를 후속 진행.

**경로 B — `git revert` (권장, 코드 정합성 회복)**:

```bash
# cutover PR 머지 커밋 식별
git log --oneline -1 main   # 또는 PR 페이지의 merge commit SHA

# revert (squash 머지든 merge 커밋이든 -m 1 옵션 주의)
git checkout main && git pull
git revert --no-edit -m 1 <CUTOVER_MERGE_COMMIT>
git push origin main
# → CD 워크플로우 자동 트리거 → v1 상태로 재배포
```

`-m 1` 은 merge commit 의 첫 부모(=main 직전) 를 기준으로 되돌린다는 뜻. squash 머지였다면 단일 커밋이므로 `-m` 불필요.

**되돌아가는 범위**:
- 본 PR 의 모든 변경(파일 삭제 / 이동 / import 치환 / CLAUDE.md 갱신 / docs/redesign 삭제) 이 한 커밋으로 역적용됨.
- **이미 머지된 v2 페이지 PR 들의 코드는 그대로 살아 있음** (`pages-v2/`, `components-v2/`, `styles-v2/` 등이 다시 등장). 토글(`?v=2`) 도 부활 → v1 default + v2 opt-in 상태로 자연 복귀.
- v2 PR 자체가 사라지지 않음. cutover 만 되돌리는 것.

### 8.2 부분 롤백 (특정 페이지만 문제)

cutover 후에는 v1 페이지 파일이 git working tree 에 없음. 따라서 진정한 의미의 "특정 페이지만 v1 으로" 는 **불가**. 옵션:

| 옵션 | 절차 | 비고 |
|------|------|------|
| (a) **전체 revert 후 재공략** (권장) | § 8.1 경로 B → v2 토글 부활 상태에서 문제 페이지만 별도 hotfix → 다음 cutover 재시도 | 일관성 우선. 가장 안전 |
| (b) 라우트 단위 점검 페이지 | App.tsx 의 해당 `<Route>` 를 임시로 `<Maintenance />` 컴포넌트로 교체 → hotfix PR | 특정 동선만 막고 나머지 살림. UX 손상은 있음 |
| (c) git history 에서 v1 페이지 하나만 cherry-pick | `git checkout <PRE_CUTOVER_SHA> -- src/pages/EventList.tsx` 등으로 단일 파일 복원 후 라우트 분기 임시 부활 | 가능하지만 import 경로 / 컴포넌트 의존성 정합 안 맞음 → **고난이도, 비권장** |

권장: **(a)**. cutover 의 매력(코드 단일화)을 부분 롤백으로 깨뜨리지 말 것.

### 8.3 데이터 롤백

§ 6 결론 재확인: **마이그레이션 코드 0**. 즉:
- localStorage 키 형식 변경 없음 (auth / theme 모두 v1·v2 공유)
- 서버 데이터 변경 없음 (이 PR 은 프론트 only)
- 6.6-(b) 옵션을 채택하지 않은 이상 `localStorage.removeItem('ui.version')` 같은 파괴적 동작도 없음

따라서 **데이터 롤백 0**. 8.6-(b) 가 채택된 경우만: 해당 키 제거는 비파괴적(다음 토글 사용 시 자동 재기록 가능했던 키지만 이제 토글이 없으므로 무관) → 롤백 후에도 영향 없음.

### 8.4 머지 후 모니터링 (롤백 결정의 근거)

권장 모니터링 윈도우: **머지 후 1시간 집중 + 24시간 일반**.

| 신호 | 어디서 | 임계값 (예시) | 액션 |
|------|--------|---------------|------|
| HTTP 5xx | nginx / 컨테이너 액세스 로그 | 머지 전 baseline 대비 +50% / 5분 | 즉시 § 8.1 |
| 헬스체크 실패 | CD 워크플로우 마지막 step | 1회 실패 | CD 가 자동으로 deploy 단계 fail → 운영 컨테이너는 직전 상태 유지 (§ 8.0). main HEAD 만 어긋남 → 경로 B 로 정합 |
| 콘솔 에러 | (수동) Sentry 등 미도입 → 팀원 직접 / 사용자 신고 | 신규 종류 1건이라도 메인 동선이면 | § 8.1 |
| 사용자 신고 (장바구니 비었다 / 로그인 풀렸다 등) | 슬랙 / CS 채널 | 동일 증상 2건 이상 | § 8.1 후 재현 / 원인 분석 |
| 백엔드 에러율 | 서버 측 모니터링 | 머지 전 baseline 대비 +20% | 프론트 호출 패턴 변화 의심 → § 8.1 |

INVENTORY § 5 기준 **에러 모니터링 / APM 미도입** 상태. 따라서 머지 직후엔 **팀원 직접 클릭 / 슬랙 모니터링**에 의존. § 9 의사결정 항목으로 "Sentry 등 도입" 후보 등재 권장.

### 8.5 revert 시뮬레이션 (머지 전 검증)

cutover PR 의 **머지 전** 체크리스트:

| 항목 | 방법 | 통과 기준 |
|------|------|-----------|
| revert 가능성 | 로컬에서 `git revert -m 1 <CUTOVER_LAST_COMMIT> --no-commit` 시뮬레이션 | 충돌 0건. 충돌 발생 시 cutover PR 의 커밋 분할 / 베이스 재정렬 검토 |
| v1 코드의 git 보존 | `git log --diff-filter=D --name-only -- src/pages/EventList.tsx \| head -1` (cutover 머지 가정 후) | 삭제 커밋이 cutover commit 안에 있고, 직전 커밋에서는 살아있음 |
| 직전 SHA 의 Docker 이미지 | `docker pull $DOCKERHUB_USER/devticket-frontend:${PREV_SHA}` 사전 시도 | pull 성공. (Docker Hub 이미지 retention 정책 확인) |
| 헬스체크 스크립트 | CD 워크플로우의 health check 단계 코드 리뷰 | `curl http://localhost:80` 200 응답 + 10×2s = 20초 내 판정 |
| k3s rollout undo | dev 환경에서 사전 1회 실험 | `kubectl rollout history deployment/frontend -n devticket` 가 직전 revision 보유 |

cutover PR 본문 (`§ 10.2`) 에 위 표를 그대로 박아 PR 리뷰어가 체크하게 함.

### 8.6 배포 시점 권장

| 항목 | 권장 |
|------|------|
| 시간대 | **트래픽 최저 시간대** (서비스 특성에 맞춰 결정 — 통상 평일 오전 이른 시간) |
| 요일 | **월~목**. 금요일 / 휴일 직전 금지 (이슈 발생 시 대응 인력 부족) |
| 대기 인력 | 머지 후 **최소 1시간**, 프론트 담당 + 결제 / 인증 도메인 담당이 즉시 응답 가능한 상태 |
| 백엔드 동시 배포 | **금지**. 백엔드 배포와 분리해 회귀 원인 격리 |
| 사전 공지 | 슬랙 / 팀 채널에 머지 시각 + 롤백 SHA + 담당자 연락처 게시 |
| 대안 채널 | 운영(main) 배포 직전 develop(k3s) 에서 동일 빌드를 1~2일 운용해 사전 신호 수집 권장 |

### 8.7 롤백 결정 권한 / 의사소통

| 단계 | 권한자 | 채널 |
|------|--------|------|
| § 8.1 즉각 롤백 (경로 A — 컨테이너 재태깅) | on-call 1인 단독 결정 가능 | 결정 직후 슬랙 공지 |
| § 8.1 경로 B (`git revert`) | on-call + 코드 오너 1인 합의 | revert PR 본문에 사유 / 영향 / 다음 cutover 일정 |
| § 8.2 부분 점검 페이지 | 팀 합의 | hotfix PR 리뷰 + 슬랙 공지 |
| § 8.3 데이터 작업 | 본 cutover 에서는 N/A | — |

### 8.8 요약

| 시나리오 | 추천 경로 | 예상 복구 시간 |
|----------|-----------|----------------|
| 헬스체크 실패 | CD 가 자동 fail → 운영 컨테이너 유지 → § 8.1 경로 B 로 정합 | < 5분 (CD 한 사이클) |
| 화이트 스크린 / 5xx | § 8.1 경로 A → 후속 경로 B | < 5분 |
| 특정 페이지만 깨짐 | § 8.2-(a) 전체 revert 후 hotfix 재공략 | revert: < 5분, 재공략: 일/주 단위 |
| 데이터 손상 | 본 PR 에서 발생 불가 (§ 8.3) | N/A |
| 백엔드 동시 변경으로 원인 불명 | § 8.6 위반 → 가능하면 처음부터 동시 배포 금지 | — |

## 9. 의사결정 필요 지점

각 항목은 **추천안** + **본인 결정** + **§ 10 (PR 분할) 에 미치는 영향**.
"본인 결정" 칸은 cutover PR 의 출발점에서 확정된 값.

⚠️ § 10 은 본 절의 결정을 전제로 작성된다. 먼저 채울 것.

### 9.1 사용자 제기 항목

| # | 항목 | 추천안 | 본인 결정 | § 10 영향 |
|---|------|--------|-----------|-----------|
| 1 | INVENTORY § 7 의 범위 밖 페이지 (admin, signup, oauth, payment 결과, wallet, seller-apply, NotFound 등) 처리 | 1차 SKIP, 별도 트랙 | **API 로 처리 가능한 부분이면 UI/UX v2 기준으로 마이그레이션** | cutover PR 본체에 포함 불가능 (v2 페이지가 아직 없음). § 10.3 (사후) 또는 별도 트랙 PR 들로 처리. cutover 본체는 § 3 의 5개 페이지(EventList/EventDetail/Cart/MyPage/Login) + Landing + PaymentCallback 만 다룬다 |
| 2 | v1 ↔ v2 토큰 / 캐시 호환 (마이그레이션 vs 강제 초기화) | 마이그레이션 0 — 무시 (§ 6.1) | **미배포 상태이므로 호환 고민 자체 무관** | § 6.1 / § 6.6 의 cleanup 코드(`localStorage.removeItem('ui.version')` 등) **추가하지 않음**. § 10 본체에서 마이그레이션 커밋 0 |
| 3 | v1 ↔ v2 장바구니 데이터 호환 | 서버 단일 소스 → 호환 (§ 6.2) | **호환** (확인) | 변경 없음. § 10 본체에 카트 마이그레이션 작업 없음 |
| 4 | `src/components-v2/` ↔ `src/components/` 충돌(`Layout`, `PaymentModal`) 처리 | v1 삭제 후 v2 를 같은 자리로 `git mv` (§ 4.3) | **v2 가 기준** → v1 `Layout`, `PaymentModal` 모두 삭제, v2 가 자리 차지. v1 잔존 페이지(signup, oauth, payment 결과 등)도 v2 `Layout` 으로 통일 | § 10.2 본체: ① v1 컴포넌트 삭제 ② App.tsx 의 모든 `<Layout>` import 가 v2 Layout 을 가리키도록 ③ v1 잔존 페이지가 v2 Layout 안에서 정상 동작하는지 § 1.3 검증 강화 |
| 5 | `docs/redesign/` 삭제 vs 일부 보존 | (A) 전체 삭제 권장 / (C) INVENTORY·Spec 발췌 (§ 7.3) | **전부 보존** → § 7.3 옵션 (B) `docs/archive/v2-cutover/` 로 통째 이동 | § 10.2 에서 `git mv docs/redesign docs/archive/v2-cutover` 한 줄. § 5.4 의 CLAUDE.md 참조 3건도 새 경로로 갱신 (또는 § 5.4 의 옵션 B 와 동시 적용 시 참조 자체 제거 검토). § 7.4 의 코드 주석은 (B) 옵션 덕에 새 경로로 부분 유효 — § 10.3 사후에서 재정리 여부 결정 |
| 6 | Cutover 를 한 PR / 여러 PR 로 분할 | 3개 PR 분할 (§ 10.1 / § 10.2 / § 10.3) | **단일 PR** | § 10 의 골격을 1개 PR 로 흡수: PR 1(선행 정리) / PR 3(사후 정리) 의 작업도 PR 2(본체) 에 합침. 단일 PR diff 가 매우 커지므로(§ 4 87 라인 import 치환 + § 7 전체 폴더 이동 + 컴포넌트 삭제 + 라우터 재작성) **커밋은 § 10.2 의 단계대로 분할**해 리뷰 단위만 보존 |
| 7 | 머지 후 모니터링 기간 / 임계값 | 1시간 집중 + 24시간 일반 (§ 8.4) | **없음** | § 8.4 의 모니터링 표는 참고용으로만. § 10.2 PR 본문의 "머지 후 액션" 섹션에서 모니터링 항목 제거. 단, § 8.1 의 revert 절차 자체는 보존(이슈 발생 시 어차피 사용) |
| 8 | `git mv` 로 history 보존 vs `cp + rm` | `git mv` (§ 4.2) | **없음** (지정 안 함) → 추천안 채택 | § 10.2 의 이동 단계에서 `git mv` 사용. 변경 없음 |
| 9 | 배포 시간대 | 트래픽 최저 + 평일 (§ 8.6) | **미배포 상태** → 결정 시점 아님 | § 10.2 PR 본문의 "배포 일정" 섹션 보류 (TBD). 머지 시점에 다시 결정 |
| 10 | 사용자 공지 (배너 / 이메일 / 무공지) | 트래픽 / 운영 정책에 따라 결정 | **미배포 상태** → 결정 시점 아님 | § 10.2 PR 본문의 "공지" 섹션 보류 |

### 9.2 이전 섹션에서 §9 로 이관된 항목

본 plan 작성 중 미결로 남긴 항목들. 위 § 9.1 의 결정으로 자동 해소되는 것은 ✅ 표시.

| 출처 | 항목 | 자동 해소 여부 / 결정 |
|------|------|-----------------------|
| § 3.1 | v1 `Payment.tsx` / `Payment(Success\|Fail\|Complete).tsx` 삭제 가부 (v2 `PaymentCallback` 이 결제 진입까지 커버하는지) | **결정 필요**. App.tsx 라인 113 (`/payment` → v1 `Payment` 단독, v2 분기 없음) 기준으로 보면 v2 가 결제 시작 페이지를 가지지 않음 → v1 `Payment.tsx` 는 **유지**, v1 `PaymentSuccess/Fail/Complete` 만 삭제. § 9.1-1 의 "API 처리 가능하면 v2 마이그레이션" 원칙에 따라 후속 트랙에서 v2 Payment 작성 |
| § 3.2 | v1 `Layout`, `ThemeToggle` 운명 | ✅ § 9.1-4 로 해소 — v2 Layout 으로 통일. `ThemeToggle` 은 v2 Layout 내부의 `useTheme()` 사용 코드로 흡수 → **삭제** |
| § 3.2 | v1 `EventMap.tsx` 삭제 가부 | **결정 필요**. v2 `EventDetail` 이 지도를 보여주는지 확인 필요. 보여주지 않으면 삭제 + `react-kakao-maps-sdk` 의존성도 § 10.3 에서 제거 |
| § 3.3 | `src/styles/globals.css` ↔ `src/styles-v2/global.css` 통합 정책 | **결정**: § 9.1-4 의 "v2 가 기준" 을 따름 → v2 `global.css` 가 메인, v1 `globals.css` 의 reset / 폰트 / 전역 변수 중 v2 가 의존하는 부분만 흡수 후 v1 파일 삭제. 단복수 통일은 v2 (`global.css`) 측 표기로 |
| § 4.4 | `src/styles-v2/accent.ts` 의 이동 위치 | **결정**: TS 파일이지만 styles 의존성이라 `src/styles/accent.ts` 그대로 유지. 분리 비용 > 효용 |
| § 5.1 | `/` 를 Landing 으로, `/events` 를 EventList 로 분리 | **결정**: 현재 App.tsx 에서 이미 `/` → Landing, `/events` → EventList 로 분기되어 있음 (v2 측). 그대로 유지 — v1 시절 `/` = EventList 였으나 cutover 후 `/` = Landing 으로 이전. v1 사용자가 `/` 를 EventList 로 인지하던 이슈는 Landing 안의 "이벤트 보기" CTA 가 `/events` 로 보냄 → § 1.2 검증에서 동선 확인 |
| § 5.1 | `_dev` showcase 3개 라우트 (`TypedTerminalShowcase`, `HeroStatsShowcase`, `CategoriesFeaturedShowcase`) | **결정**: § 9.1-6 단일 PR 전제이므로 cutover 본체에서 함께 삭제 (Landing.plan §12 주석상 cutover/PR 4 cleanup 시 제거 명시) |
| § 5.2-(c) | `RequireAuth` 통일 (옵션 c-1 v2 승격 / c-2 v1 흡수) | **결정**: § 9.1-4 의 "v2 가 기준" 원칙 → **옵션 c-1 채택** (`RequireAuthV2` 가 메인 `RequireAuth` 가 됨, returnTo 기능 보존). v1 `RequireAuth` (App.tsx:67-72) 삭제 |
| § 5.4 | `docs/CLAUDE.md` 옵션 A 전체 삭제 vs B 일반 가이드 변환 | **결정**: § 9.1-5 (전체 보존 + archive 이동) 와 정합 → **옵션 B 채택**. v2 재구축 진행 중 표현은 제거하되, 새 경로(`docs/archive/v2-cutover/`) 참조 1줄 + 일반 규칙은 보존 |
| § 6.6 | `localStorage['ui.version']` cleanup | ✅ § 9.1-2 로 해소 — cleanup 코드 추가하지 않음 (옵션 a) |
| § 7.3 | docs/redesign 삭제 vs 보존 | ✅ § 9.1-5 로 해소 — (B) archive 이동 |
| § 7.4 | 코드 주석의 dangling reference (`docs/redesign/...` 30+ 곳) | **결정**: § 9.1-5 (B) 채택으로 경로가 `docs/archive/v2-cutover/...` 로 부분 유효. 단일 PR 전제(§ 9.1-6) → cutover 본체 안에서 sed 일괄 치환(`docs/redesign` → `docs/archive/v2-cutover`). 별도 사후 PR 분리 안 함 |
| § 8.4 | Sentry 등 모니터링 도입 | ✅ § 9.1-7 로 해소 — 도입하지 않음 |

### 9.3 결정 미정 / 추가 확인 필요

위 표에서 "결정 필요" 로 표시된 항목 잔존:

1. **v1 `Payment.tsx` 처리** — v2 `PaymentCallback` 이 결제 시작도 커버하는지 cutover PR 작업 중 코드 1차 확인. 커버 X → v1 유지(잠정).
2. **v1 `EventMap.tsx` 처리** — v2 EventDetail 의 지도 사용 여부 확인. 사용 X → 삭제 + 의존성 제거 후보.

위 둘은 cutover PR 본체 안에서 5분 내 확인 가능 → 본 plan 의 의사결정은 종료.

### 9.4 결정 요약 — § 10 입력값

다음을 § 10 의 전제로 둔다.

- 단일 PR 로 cutover 수행 (§ 9.1-6).
- 삭제 / 이동 / 라우터 재작성 / styles 통합 / docs archive 이동 / CLAUDE.md 갱신을 한 PR 안에서 **커밋 단위로 분할**.
- v2 가 기준 — 충돌 컴포넌트(Layout, PaymentModal) / styles / 가드(`RequireAuth`) 모두 v2 가 메인 자리 차지 (§ 9.1-4, § 9.2 RequireAuth 결정).
- 마이그레이션 코드 0, 모니터링 작업 0, 배포 시간대 / 공지는 머지 시점에 별도 결정 (§ 9.1-2, 7, 9, 10).
- 범위 밖 페이지(admin/signup/oauth/payment 결과/wallet/seller-apply/NotFound)는 cutover 본체 비범위, **별도 v2 마이그레이션 트랙**으로 후속 (§ 9.1-1).
- `docs/redesign/` 는 통째로 `docs/archive/v2-cutover/` 로 이동, 코드 주석의 경로 참조는 같은 PR 안에서 sed 치환 (§ 9.1-5, § 9.2 § 7.4 결정).

## 10. PR 분할 (골격만)
### 10.1 PR 1: 사전 정리 (선행 작업)

> **§ 9.1-6 결정**: cutover 는 단일 PR. 본 절의 작업은 **§ 10.2 PR 2 본체의 첫 커밋 묶음**으로 흡수.
> 아래는 "분리하지 않더라도 다른 작업과 섞이지 않도록 먼저 처리할 커밋 단위" 로 읽는다.

#### 10.1.1 포함 작업 (§ 9 결정 후 실제 남은 항목)

§ 9 의 결정으로 사전 정리 후보가 대부분 사라졌다. 실제로 본 단계에서 처리할 것:

| 작업 | 출처 | 비고 |
|------|------|------|
| (1) `docs/redesign/` → `docs/archive/v2-cutover/` 이동 | § 9.1-5, § 7.6 | 코드 동작 영향 0. `git mv` 디렉토리 단위 1회 |
| (2) 코드 주석의 경로 sed 치환 (`docs/redesign/` → `docs/archive/v2-cutover/`) | § 9.2 § 7.4 결정 | 30+ 파일의 inline 주석. 동작 영향 0 |
| (3) 본 plan 파일(`Cutover.plan.md`) 의 자기 참조 갱신 | § 7.2 | 본 파일도 archive 로 이동되므로 내부 경로 표기 점검 (또는 단일 PR 안에서 (1) 이전 시점에 본 파일 자체도 정리 / 삭제) |

§ 9 결정으로 **빠진 항목**:
- 데이터 마이그레이션 코드 추가 → § 9.1-2 (마이그레이션 0) → 작업 없음
- v1 / v2 컴포넌트 충돌 사전 rename → § 9.1-4 (v2 가 기준 → 충돌은 v1 삭제로 해결) → § 10.2 본체에서 처리
- 의존성 없는 v1 코드 사전 삭제 → § 3 의 v1 삭제 대상은 **모두** v1 잔존 페이지 또는 App.tsx 의 import 에 묶여있음 → 사전 단독 삭제 가능한 파일 0건

#### 10.1.2 포함 파일 / 변경 사항

```
변경:
  docs/redesign/**             → docs/archive/v2-cutover/** (16개 markdown + prototype/ 트리, git rename)
  src/components-v2/Icon/index.tsx                      (주석 1줄 sed)
  src/components-v2/Layout/*.tsx (10여 곳)               (주석 1줄씩 sed)
  src/components-v2/Layout/CommandPalette/*.tsx          (주석 sed)
  src/components-v2/Layout/Sidebar/*.tsx                 (주석 sed)
  src/components-v2/Layout/hooks/*.ts                    (주석 sed)
  src/components-v2/Layout/{LayoutChromeContext,Minimap,StatusBar,TabBar,TitleBar,types,utils,__preview}.tsx
  src/lib/format.ts                                      (주석 sed)
  src/pages-v2/Cart/{adapters,types}.ts                  (주석 sed)
  src/pages-v2/Landing/components/TypedTerminal.tsx      (주석 sed)
  src/pages-v2/PaymentCallback/types.ts                  (주석 sed)
  src/styles-v2/accent.ts                                (주석 sed)
  src/styles-v2/components/accent-media-box.css          (주석 sed)
```

#### 10.1.3 추정 LOC

| 변경 종류 | 라인 |
|-----------|------|
| `git mv` (rename only, diff 라인 0) | 0 |
| 주석 sed 치환 | ~30 라인 (각 파일에서 1~2줄, 같은 위치 치환) |
| **합계** | **~30 라인** |

#### 10.1.4 검증 방법

```bash
# 1) tsc / 빌드는 통과해야 함 (코드 동작 변경 0)
npx tsc --noEmit
npm run build

# 2) 새 경로로 정상 치환되었는지
git grep -nE "docs/redesign" src/                 # 0건이어야 함
git grep -nE "docs/archive/v2-cutover" src/ | wc -l   # 30+건

# 3) 이동된 문서가 새 위치에 있는지
ls docs/archive/v2-cutover/
```

#### 10.1.5 머지 후 모니터링

§ 9.1-7 결정으로 **모니터링 없음**. 이 커밋 묶음은 코드 동작 변경 0 이라 회귀 가능성 자체가 없음.

---

### 10.2 PR 2: Cutover (메인)

§ 9.1-6 결정으로 본 PR 이 **유일한 cutover PR**. § 10.1 의 사전 정리 + § 10.3 의 사후 정리도 모두 이 PR 안의 별도 커밋으로 흡수.

#### 10.2.1 핵심 작업 (§ 3 / § 4 / § 5 / § 7 의 종합)

| # | 작업 | 출처 | 영향 |
|---|------|------|------|
| 1 | v1 페이지 5개 + 결제 결과 3개 + Layout/PaymentModal 등 v1 컴포넌트 삭제 | § 3.1 / § 3.2 | 다수 파일 삭제 |
| 2 | v2 디렉토리 → 메인 위치로 `git mv` (`pages-v2`, `components-v2`, `styles-v2`, `types-v2`, `router-v2`) | § 4.1 / § 4.2 | rename 다수 |
| 3 | router-toggle 헬퍼 제거 (`VersionedRoute`, `useUiVersion`), `RequireAuthV2` → `RequireAuth` 승격 | § 5.2, § 9.2 c-1 | 4개 파일 처리 |
| 4 | App.tsx 의 v1/v2 분기 9건 + lazy import 두 벌 정리 | § 5.1 | App.tsx 본문 절반 재작성 |
| 5 | import 경로 sed 일괄 치환 (`-v2` 접미사 제거) | § 4.5 / § 4.6 / § 5.3 | 87 라인 / 88 파일 |
| 6 | styles 머지 (v1 `globals.css` 흡수 → v2 `global.css` 메인) | § 3.3 / § 4.4 / § 9.2 | 1~2 파일 |
| 7 | env / config 정리 (`VITE_UI_DEFAULT_VERSION` 제거) | § 5.5 | `.env.development`, `src/api/.env.example` 2건 |
| 8 | `docs/CLAUDE.md` 정리 (옵션 B, archive 경로 갱신) | § 5.4 / § 9.2 | 1 파일 |
| 9 | `_dev` showcase 라우트 / 컴포넌트 제거 | § 5.1 / § 9.2 | App.tsx 라인 33-37, 102-105 + `pages-v2/_dev/` 3 파일 |
| 10 | (PR 1 흡수) docs archive 이동 + 주석 sed | § 10.1 | (위 § 10.1) |

#### 10.2.2 추정 LOC

대략적인 규모 (각 plan / INVENTORY 기준 추정, 실제 PR 작성 시 git diff stat 으로 재측정):

| 영역 | -LOC (삭제) | +LOC (추가/수정) |
|------|-------------|--------------------|
| v1 페이지 5개 (EventList/EventDetail/Cart/MyPage/Login) + 결제 결과 3개 | ~2,500 | 0 |
| v1 컴포넌트 (EventCard, EventMap, Pagination, Modal, TicketDetailModal, PaymentModal, Layout, ThemeToggle, PaymentSuccess, PaymentFail) | ~1,000 | 0 |
| v1 styles `globals.css` | ~300 | ~50 (v2 global.css 흡수분) |
| router-toggle 헬퍼 (`VersionedRoute` 12 + `useUiVersion` 32 = 44) | ~44 | 0 |
| App.tsx 재작성 | ~80 (v1 import + 분기 라인) | ~30 (단일 분기로 축약) |
| import 경로 sed (87 라인) | 0 | ~87 (수정) |
| `docs/CLAUDE.md` 갱신 | ~10 | ~5 |
| env (`VITE_UI_DEFAULT_VERSION` 제거) | 2 | 0 |
| `_dev` showcase | ~150 (3 파일) | 0 |
| 주석 sed (PR 1 흡수) | 0 | ~30 (수정) |
| **합계** | **~4,100** | **~200** |

`git mv` 부분은 diff 통계상 라인이 잡히지 않음(rename detection). 실제로는 **rename 행수가 가장 큼** (`pages-v2/` 17 파일 + `components-v2/` 52 파일 + `styles-v2/` 13 파일 + `types-v2/` 5 파일 + `router-v2/` 4 파일 = **약 91 파일 rename**).

#### 10.2.3 파일 작업 순서 (커밋 단위)

리뷰어가 단계별로 따라갈 수 있게 **커밋을 작업 유형별로 분리**한다 (§ 9.1-6 의 "단일 PR + 잘게 분리된 커밋" 원칙).

```
커밋 1: chore(docs): archive docs/redesign → docs/archive/v2-cutover
        (§ 10.1 의 git mv + 주석 sed; 단일 commit)
        영향: 코드 동작 0

커밋 2: refactor(router): drop ?v= toggle, promote RequireAuthV2
        - src/router-v2/{VersionedRoute.tsx, useUiVersion.ts} 삭제
        - src/router-v2/RequireAuthV2.tsx → RequireAuth.tsx 로 rename, default export 정비
        - src/router-v2/index.ts 정리
        - src/App.tsx 의 VersionedRoute 분기 9건 → 단일 분기로 축약 (v2 컴포넌트 직접 매핑)
        - src/App.tsx 의 v1 RequireAuth (line 67-72) 삭제, RequireAuth 를 router-v2 import 로 교체
        - .env.development / src/api/.env.example 의 VITE_UI_DEFAULT_VERSION 제거
        영향: 토글 사라짐. ?v= 무시됨 (v2 만 노출)

커밋 3: chore(routes): remove _dev showcase routes
        - src/App.tsx 의 _dev lazy import + Route 3건 삭제
        - src/pages-v2/_dev/ 3 파일 삭제
        영향: /_dev/* 404

커밋 4: refactor(pages): delete v1 pages superseded by v2
        - git rm src/pages/{EventList,EventDetail,Cart,MyPage,Login,PaymentSuccess,PaymentFail,PaymentComplete}.tsx
        - src/App.tsx 의 v1 페이지 lazy import + 즉시 import 정리
        영향: 위 라우트는 다음 커밋의 v2 mv 후 정상화 (이 커밋 단독으론 빌드 깨짐 — 머지 직전까지 다음 커밋과 한 묶음으로 진행)

커밋 5: refactor(components): delete v1 components superseded by v2
        - git rm src/components/{EventCard,EventMap,Pagination,Modal,TicketDetailModal,PaymentModal,Layout,ThemeToggle,PaymentSuccess,PaymentFail}.tsx
        영향: 동일 (다음 커밋과 묶여야 빌드 통과)

커밋 6: refactor: move v2 dirs to main locations (pages-v2 → pages 등)
        - git mv src/pages-v2/{각 폴더} src/pages/{각 폴더}
        - git mv src/components-v2/{각 폴더} src/components/{각 폴더}
        - git mv src/types-v2 src/types
        - git mv src/router-v2 src/router
        - rmdir 빈 v2 폴더
        영향: 파일 위치만 변경. import 는 다음 커밋에서 정합

커밋 7: refactor(imports): drop -v2 suffix from all imports
        - § 4.6 의 sed 한 줄 적용 (pages|components|styles|types|router)-v2 → 그대로
        - src/App.tsx 의 LoginV2 / EventListV2 등 변수명도 `V2` 접미사 제거
        영향: tsc / build 통과 회복

커밋 8: refactor(styles): merge v1 globals.css into v2 global.css
        - v2 가 의존하는 reset / 폰트 / 전역 변수 흡수
        - git rm src/styles/globals.css (v1)
        - git mv src/styles-v2/{tokens.css,global.css,index.css,accent.ts,components,pages} src/styles/
        - rmdir src/styles-v2
        - main.tsx 의 css import 경로 갱신
        영향: 외관 회귀 가능 → § 1.1 / § 1.3 검증 강화

커밋 9: docs(claude): drop v2 active phrasing, point to archive
        - docs/CLAUDE.md 옵션 B 적용 (§ 5.4 / § 9.2)
        영향: 문서만

커밋 10: chore: final v2 vestige check
        - § 5.7 의 검증 grep 명령으로 잔재 확인
        - 단순 정리 / 주석 / 변수명 cleanup
```

권장: **커밋 4~7 은 같은 PR push 안에서 한 번에**. 4 / 5 단독 머지 시 빌드 깨짐 — 단일 PR 전제이므로 PR 머지 시점에는 7 까지 통과한 상태.

#### 10.2.4 검증 방법

§ 1 (사전 검증) + § 5.7 (라우터 잔재) 의 합집합:

```bash
# 1) 빌드 / 타입
npx tsc --noEmit
npm run build

# 2) v2 잔재 0건
git grep -nE "(pages|components|styles|types|router)-v2" src/ .env*
git grep -nE "VersionedRoute|useUiVersion|VITE_UI_DEFAULT_VERSION|ui\.version" src/ .env*
git grep -nE "\bV2\b" src/   # 변수명 잔재
git grep -nE "docs/redesign" .   # 본 PR 외부에서 0건 (이미 archive 로 이동)

# 3) 라우트 매트릭스 (§ 1.1 의 페이지×테마×뷰포트×인증×상태)
#    수동 (npm run dev → 9개 v2 라우트 + v1 잔존 라우트 sweep)

# 4) 머지 직전 dry-run revert (§ 8.5)
git revert --no-edit -m 1 HEAD --no-commit && git revert --abort
```

§ 1.5 의 번들 크기 비교: `npm run build` 후 `dist/assets/*.js` 의 raw size 합산을 머지 전 main 과 비교.

#### 10.2.5 의존 PR

§ 9.1-6 결정으로 **선행 PR 없음**. 본 PR 이 cutover 의 단일 진입점.

전제: 모든 v2 페이지 PR (Login, EventList, EventDetail, Cart, MyPage, Landing, PaymentCallback, layout, shared-components) 가 이미 main 에 머지된 상태. 머지 안 된 v2 페이지가 있으면 cutover 보류.

#### 10.2.6 머지 후 액션

§ 9.1-7 (모니터링 없음) / § 9.1-9 (배포 시간대 미정) / § 9.1-10 (공지 미정) 적용:
- 모니터링 절차 / 임계값 항목 **PR 본문에서 제외**
- 배포 일정 / 사용자 공지는 **TBD** 로 두고 머지 시점에 별도 결정
- § 8.1 의 revert 절차는 PR 본문에 그대로 박아 둠 (이슈 발생 시 어차피 사용)

#### 10.2.7 분할 어려움 / 단일 PR 정당화

이 PR 을 진정한 의미로 여러 PR 로 쪼개지 않는 이유:
- 커밋 4 / 5 (v1 삭제) 와 커밋 6 / 7 (v2 이동 + import 치환) 사이에 **빌드 깨짐 구간** 존재 → 별도 PR 로 쪼개면 main 머지 후 일시적으로 빌드 실패 노출
- 커밋 8 (styles 머지) 와 커밋 7 (import 치환) 도 서로의 결과물에 의존
- § 9.1-6 결정 그대로

대신 § 10.2.3 의 10개 커밋 분할로 **리뷰 단위는 보존**한다.
### 10.3 PR 3: 사후 정리 (후속 작업)

§ 9.1-6 결정으로 cutover 본체가 단일 PR 이지만, **사후 정리는 별도 PR 로 분리**.
이유: cutover 머지 직후 회귀가 발견될 수 있음 → 의존성 / 코드 추가 정리는 안정 확인 후에 진행해야 롤백 비용이 줄어듦.

#### 10.3.1 포함 작업 (§ 9 결정 후 실제 남은 항목)

| 작업 | 출처 | 비고 |
|------|------|------|
| (1) v1 만 쓰던 의존성 제거 — `react-type-animation` 후보 | § 2.4 / § 3.5 | cutover 후 grep 으로 v1 사용처가 모두 사라졌는지 재확인 후 제거 |
| (2) v1 만 쓰던 의존성 제거 — `react-kakao-maps-sdk` (EventMap 운명에 종속) | § 2.4 / § 3.5 / § 9.3 | § 9.3 의 EventMap 결정에 따라. v2 EventDetail 이 지도 사용 안 하면 제거 |
| (3) dead-code / 미사용 함수 정리 — `src/utils/index.ts`, `src/hooks/*` 중 v1 전용으로만 쓰이던 함수 | § 3.4 | cutover 직후 제거하지 않고 보류했던 항목 |
| (4) `docs/CLAUDE.md` 의 잔여 v2 흔적 / archive 경로 참조 미세 조정 | § 5.4 / § 9.2 | cutover PR 본체에서 1차 정리, 안정 확인 후 미세 조정 |
| (5) 임시 placeholder / `// TODO(cutover)` / `_dev` 잔재 검색 정리 | (전반) | cutover 본체 진행 중 발견된 임시 표시 제거 |
| (6) 번들 사이즈 / 코드 스플릿 후속 최적화 (필요 시) | § 1.5 | cutover 직후 측정한 번들 증가가 한계치 초과 시 진행 (§ 9.1-7 결정상 강제 아님) |

§ 9 결정으로 **빠진 항목** (사용자 요청 원문 대비):
- `docs/redesign/` 폴더 **삭제** → § 9.1-5 (전부 보존, archive 이동) 결정으로 **삭제 안 함**. cutover PR 본체에서 archive 이동만 수행했으므로 본 PR 에서 추가 정리 0
- 마이그레이션 코드 제거 → § 9.1-2 (마이그레이션 0) 결정으로 추가된 코드 자체가 없음 → 제거 대상 0

§ 7.4 의 코드 주석 dead reference 도 § 9.2 결정으로 cutover 본체 안에서 sed 치환 완료 → 본 PR 에서 추가 작업 0.

#### 10.3.2 포함 파일 / 변경 사항

```
변경 (예상):
  package.json                                          (의존성 제거 1~2개)
  package-lock.json (또는 lock 파일)                    (자동 갱신)
  src/utils/index.ts                                    (dead 함수 정리, 있다면)
  src/hooks/*.ts                                        (사용처 0인 export 정리, 있다면)
  src/components-v2/Layout/__preview.tsx                (dev-only 프리뷰 — § 9.3 따라 제거 검토)
  docs/CLAUDE.md                                        (미세 조정, 있다면)

조건부 (§ 9.3 결정에 따라):
  src/components/EventMap.tsx                           (cutover 본체에서 보류했다면 여기서 삭제)
```

#### 10.3.3 추정 LOC

| 변경 종류 | 라인 |
|-----------|------|
| package.json 의존성 제거 | -2 ~ -4 |
| lock 파일 갱신 | (자동, 다수) |
| dead-code 정리 | -50 ~ -200 (실측 후 갱신) |
| `__preview.tsx` 등 dev 잔재 | -50 ~ -100 |
| EventMap 조건부 | -150 |
| **합계** | **-250 ~ -450** (추가 라인 거의 없음) |

#### 10.3.4 머지 시점 (cutover 후)

§ 9.1-7 결정으로 공식 모니터링 지표 / 임계값은 없음.
대신 **자연 안정 확인 윈도우** 권장:

| 단계 | 시점 | 확인 |
|------|------|------|
| 머지 직후 | T+0 | 빌드 / 헬스체크 / 기본 동선 1회 sweep (§ 1.2) |
| 1차 확인 | T+1 ~ T+3 일 | 사용자 신고 / 슬랙 이슈 0건 |
| 2차 확인 | T+1 ~ T+2 주 | 결제 / 인증 / 마이페이지 등 저빈도 동선까지 1회 사용 확인 |
| **본 PR 머지 가능 시점** | **T+1 ~ T+2 주 후** | 위 확인 후 |

권장: **cutover 머지 후 최소 1주, 권장 2주**. 더 짧게 가져갈수록 의존성 제거 후 회귀 발견 시 두 PR 을 동시에 revert 해야 함 → 1주 미만 비권장.

#### 10.3.5 검증

```bash
# 1) 제거 대상 v1 흔적이 다시 그립지 않은지
git grep -nE "react-type-animation|react-kakao-maps-sdk" src/    # 제거 후 0건
git grep -nE "from .*pages/(EventList|EventDetail|Cart|MyPage|Login)" src/    # 0건 (cutover 이후 영구)
git grep -nE "TODO\(cutover\)|FIXME\(cutover\)|_dev/" src/      # 0건

# 2) 빌드 / 타입
npx tsc --noEmit
npm run build

# 3) 의존성 트리 확인
npm ls react-type-animation react-kakao-maps-sdk    # "(empty)" 또는 not installed

# 4) 번들 사이즈 비교 (cutover 머지 직후 vs 본 PR)
ls -la dist/assets/
```

회귀 신호: 위 grep 이 1건이라도 있으면 제거 보류, 해당 사용처를 v2 / 다른 코드로 옮긴 후 재시도.

#### 10.3.6 분할 가능성

본 PR 자체도 무리하면 더 잘게 쪼갤 수 있음 (의존성 제거 / dead-code 정리 / dev 잔재 제거). 단, 작업량이 작아 1개 PR 로 충분.

---

### 10.4 PR 간 의존성 / 머지 순서

#### 10.4.1 의존성 / 순서 (§ 9 반영)

§ 9.1-6 결정으로 PR 1 은 PR 2 본체에 흡수 → 실제 PR 흐름은 다음과 같이 압축:

```
[모든 v2 페이지 PR 머지 완료]
         |
         |  (v2 페이지 한 개라도 미머지면 cutover 보류)
         v
[ PR 2: Cutover 본체 ]   (§ 10.2; PR 1 작업 흡수)
         |
         |  T+1 ~ T+2 주 안정 확인 (§ 10.3.4)
         v
[ PR 3: 사후 정리 ]       (§ 10.3)
```

원래 사용자 흐름(`PR 1 → 1~3일 → PR 2 → 1~2주 → PR 3`)에서 PR 1 단계가 사라졌다는 점이 유일한 변화.

#### 10.4.2 머지 시 검증 시나리오 매트릭스

| 단계 | 검증 시나리오 | 통과 기준 | 출처 |
|------|---------------|-----------|------|
| **PR 2 머지 직전** | § 1.1 라우트 동작 (페이지 × 테마 × 뷰포트 × 인증 × 상태) | 콘솔 에러 / 레이아웃 깨짐 0 | § 1.1 |
| | § 1.2 v2 페이지 간 네비게이션 (Landing → EventList → EventDetail → Cart → 결제) | 끊김 / dead URL 없음 | § 1.2 |
| | § 1.3 v1 잔존 페이지 (signup/oauth/wallet/payment 결과/seller-apply/admin/seller/NotFound) | 기능 회귀 0 | § 1.3 |
| | § 1.4 기존 사용자 세션 / 데이터 호환 | 재로그인 강제 X, 카트 유지 | § 1.4 / § 6 |
| | § 1.5 빌드 / 타입 / 번들 | tsc 0, 빌드 0, 번들 +10% 이내 | § 1.5 |
| | § 5.7 v2 잔재 grep | (pages\|components\|styles\|types\|router)-v2 0건 | § 5.7 |
| | § 8.5 revert 시뮬레이션 | dry-run 충돌 0 | § 8.5 |
| **PR 2 머지 직후** | 빌드 / 헬스체크 (CD 워크플로우 자동) | 헬스체크 통과 | § 8.0 |
| | 기본 동선 1회 sweep (Landing → EventList → EventDetail → Cart → MyPage) | 콘솔 에러 0 | (수동) |
| **PR 3 머지 직전** | § 10.3.5 의 grep / tsc / build / 의존성 트리 | 모두 통과 | § 10.3.5 |
| | cutover 후 1~2주 동안 사용자 신고 / 슬랙 이슈 0 | (정성) | § 10.3.4 |
| **PR 3 머지 직후** | 번들 사이즈 추가 감소 확인 | dist/assets 합산 < cutover 직후 | § 10.3.5 |

§ 9.1-7 결정상 정량 모니터링은 없음. PR 머지 직후 항목은 "체크 항목" 으로만 남기고 임계값 / 에러율은 두지 않음.

#### 10.4.3 배포 일정 권장 (요일 / 시간대)

§ 9.1-9 결정으로 **현 시점 미정 (TBD)**. 머지 시점에 별도 결정.

cutover 머지 시점이 다가오면 § 8.6 의 권장(트래픽 최저 시간대 / 평일 월~목 / 백엔드 동시 배포 금지)을 가이드로 결정. 본 plan 에서는 권장만 제시하고 확정값은 비워둠.

| PR | 배포 일정 | 결정 시점 |
|----|-----------|-----------|
| PR 2 | TBD | 머지 직전 |
| PR 3 | TBD (PR 2 머지 후 1~2주) | PR 2 머지 후 |

#### 10.4.4 팀 커뮤니케이션

§ 9.1-10 결정으로 **사용자 공지 미정**. 팀 내 공지는 다음 권장 패턴을 따른다 (별도 결정 없이 진행 가능 수준).

| 시점 | 채널 | 내용 |
|------|------|------|
| PR 2 리뷰 시작 | 팀 슬랙 (개발 채널) | "cutover PR 리뷰 요청. v1 코드 일괄 삭제 + v2 승격. revert 절차는 PR 본문 § 8.1." |
| PR 2 머지 1~2시간 전 | 팀 슬랙 | "cutover 머지 예정 시각, 담당자 연락처, revert SHA. 머지 중 백엔드 배포 금지." |
| PR 2 머지 직후 | 팀 슬랙 | "cutover 머지 완료. main HEAD = `<SHA>`. revert SHA = `<직전 SHA>`. 이슈 발견 시 즉시 멘션." |
| PR 2 머지 후 1주차 | 팀 슬랙 | "안정 확인 1주차. 사용자 신고 / 슬랙 이슈 집계. PR 3 (사후 정리) 일정 공유." |
| PR 3 리뷰 시작 | 팀 슬랙 | "사후 정리 PR 리뷰 요청. v1 의존성 제거 / dead-code 정리. cutover 회귀 신호 없으면 머지." |
| PR 3 머지 직후 | 팀 슬랙 | "사후 정리 완료. 번들 사이즈 / 의존성 트리 변경 요약." |

**사용자 대상 공지** (배너 / 이메일 등): § 9.1-10 미정 → 별도 결정. v2 변화가 시각적으로 두드러지면 (Landing 신규, EventList 토큰 변경 등) 머지 직전 결정 권장.

#### 10.4.5 비상 시나리오

| 시나리오 | 액션 |
|----------|------|
| PR 2 머지 후 critical 이슈 | § 8.1 즉각 롤백. PR 3 는 revert 후 재공략까지 보류 |
| PR 2 후 마이너 이슈 (특정 페이지 깨짐) | § 8.2-(a) 전체 revert 또는 § 8.2-(b) 점검 페이지 → hotfix → 재머지. PR 3 는 자연스럽게 1~2주 뒤로 밀림 |
| PR 3 머지 후 의존성 제거로 회귀 | PR 3 단독 revert. cutover 본체는 유지 (PR 2 와 PR 3 가 분리되어 있어 독립 revert 가능 — § 10.3 분리의 핵심 효용) |
| v2 페이지 PR 중 하나라도 미머지 상태 | cutover 보류. PR 2 자체를 만들지 않음 (§ 10.2.5) |

#### 10.4.6 종합 일정 (가정 — 실제 날짜는 머지 시점에 확정)

| 일자 | 이벤트 |
|------|--------|
| D-7 ~ D-1 | PR 2 작성 / 리뷰 / § 1 검증 |
| D-day | PR 2 머지 + 배포 (트래픽 최저 시간대, 평일) |
| D+1 ~ D+3 | 1차 안정 확인 |
| D+7 ~ D+14 | 2차 안정 확인 (저빈도 동선까지) |
| D+14 이후 | PR 3 작성 / 머지 |
| (병행) D+0 이후 | § 9.1-1 의 범위 밖 페이지(admin/signup/oauth/wallet/payment 결과/seller-apply/NotFound) 마이그레이션 트랙 — 별도 PR 들로 진행, cutover 와 무관한 일정 |
