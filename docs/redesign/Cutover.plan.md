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
(작성 예정)

## 5. 수정 대상 (라우터 / 토글 / import)
(작성 예정)

## 6. v1 ↔ v2 호환성 / 마이그레이션
(작성 예정)

## 7. docs/redesign/ 정리
(작성 예정)

## 8. 롤백 계획
(작성 예정)

## 9. 의사결정 필요 지점
(작성 예정)

## 10. PR 분할 (골격만)
### 10.1 PR 1: 사전 정리 (선행 작업)
### 10.2 PR 2: Cutover (메인)
### 10.3 PR 3: 사후 정리 (후속 작업)
### 10.4 PR 간 의존성 / 머지 순서
