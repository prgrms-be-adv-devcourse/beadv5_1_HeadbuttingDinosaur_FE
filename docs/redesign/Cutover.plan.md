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
(작성 예정)

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
