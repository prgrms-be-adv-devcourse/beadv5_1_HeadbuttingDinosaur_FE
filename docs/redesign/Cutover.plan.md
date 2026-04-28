# Cutover 계획 (v2 → 메인 승격)

이 작업은 모든 v2 페이지 PR 머지 후 실행되는 마지막 단계.
v2 코드를 메인으로 승격하고 기존 코드를 일괄 삭제.

## 1. 사전 검증 (필수 체크리스트)

Cutover PR 머지 직전 통과해야 할 체크리스트. 하나라도 미통과 시 머지 보류.

### 1.1 v2 라우트 동작 검증

모든 v2 페이지를 `?v=2` 쿼리로 접속하여 정상 동작하는지 확인.

- **대상 페이지**: Landing, EventList, EventDetail, Cart, Login, MyPage (전체 탭), 결제 플로우
- **확인 방법**:
  - `npm run dev` 후 각 페이지를 `?v=2`로 접속하여 수동 QA
  - 라이트 / 다크 모드 토글 후 각각 확인 (테마 토글 UI에서 전환)
  - 디바이스 폭별로 확인: 모바일(375px), 태블릿(768px), 데스크탑(1280px) — DevTools 디바이스 모드
  - 인증 / 비인증 상태 각각 확인 (로그아웃 후 / 로그인 후)
  - 데이터 상태별 확인: 로딩 (네트워크 throttle Slow 3G), 에러 (API mock 실패), 빈 상태 (데이터 0건 계정)
- **통과 기준**:
  - 콘솔 에러 / 경고 없음
  - 레이아웃 깨짐 없음 (가로 스크롤 발생 X, 잘림 X)
  - 로딩 / 에러 / 빈 상태 UI가 SPEC.md 규격대로 노출
  - 라이트 / 다크 모드 모두에서 토큰이 정상 적용 (하드코딩 색상 없음)

### 1.2 v2 페이지 간 네비게이션

`?v=2`가 페이지 이동 시 유지되는지 확인. 한 번 v2로 진입하면 명시적 해제 전까지 v2가 유지되어야 함.

- **확인 방법**:
  - Landing(`?v=2`) → EventList → EventDetail → Cart → 결제 플로우를 끝까지 클릭으로만 진행
  - MyPage 진입 후 모든 탭 간 이동
  - 브라우저 뒤로/앞으로 버튼 동작 확인
- **통과 기준**:
  - 모든 이동 후 URL에 `?v=2`가 유지됨 (router-toggle.plan.md 규격)
  - 페이지 이동 중 v1 페이지로 빠지는 경우 없음
  - 새로고침 후에도 v2 유지

### 1.3 v1 잔존 페이지 동작

INVENTORY.md § 6, § 7 기준 v2 범위 밖 페이지(admin, signup 등)가 새 토큰 적용 상태에서 깨지지 않는지 확인.

- **확인 방법**:
  - INVENTORY.md § 7 "기존에만 있는 것" 목록의 페이지를 모두 접속
  - `?v=2` / 기본 모두에서 외관 확인
  - 라이트 / 다크 모드 둘 다
- **통과 기준**:
  - 기능 회귀 없음 (폼 제출, 라우팅, 상태 변경 정상)
  - 새 토큰이 v1 페이지에 의도치 않게 적용되어 외관이 깨지는 경우 없음
    (필요 시 v1 페이지는 v1 토큰 스코프로 격리 — § 5에서 결정)

### 1.4 기존 사용자 세션 / 데이터 호환

배포 시점에 활성 세션을 가진 사용자가 cutover로 인해 로그아웃되거나 데이터를 잃지 않아야 함.

- **확인 방법**:
  - v1 빌드에서 로그인 + 장바구니에 아이템 담기 → v2 빌드로 교체 후 동일 브라우저 재진입
  - localStorage / sessionStorage / 쿠키 키 diff 확인 (v1 ↔ v2)
  - 토큰 / 인증 헤더 형식 변경 여부 확인
- **통과 기준**:
  - 로그인 상태 유지 (재로그인 강제 X) — 강제 필요 시 § 6 마이그레이션에 명시
  - 장바구니 데이터 유지, 또는 명시적 마이그레이션 스크립트 실행
  - 캐시 무효화가 필요한 키 (예: react-query 키, SW 캐시)는 § 6 에 목록화

### 1.5 빌드 / 테스트

- **확인 방법 / 통과 기준**:
  - `npm run typecheck` (또는 `tsc --noEmit`) — 에러 0
  - `npm run lint` — 에러 0, 신규 경고 0
  - `npm test` (단위 / 통합) — 전 테스트 통과
  - `npm run build` 성공
  - 번들 사이즈 비교: cutover 전(main) vs cutover 후 빌드 결과
    - 측정: `dist/` gzip 사이즈, 주요 청크별 사이즈
    - 기준: 초기 진입 번들이 v1 대비 +20% 초과 시 사유 PR 설명에 명시
    - 초과 시 의사결정 필요 → § 9 에 기록

## 2. 영향 범위 매핑

Cutover 가 영향 미치는 모든 영역. 영향 정도는 **대 / 중 / 소** 로 표기.
- 대: 다수 파일 변경 + 사용자 동작 직접 영향 + 롤백 어려움
- 중: 다수 파일 변경 또는 동작 영향 중 하나
- 소: 변경 범위 좁고 회귀 위험 낮음

### 2.1 라우트 — 영향: 대

`?v=2` 쿼리 분기를 제거하고 v2 라우트를 기본으로 승격.

- **변경 (v1 → v2 로 전환)**: INVENTORY § 1 매칭 표 기준 v2 가 존재하는 모든 라우트
  - `/` (Landing), `/events`, `/events/:id`, `/cart`, `/login`, `/mypage` (전 탭), 결제 플로우
- **변경 없음**: INVENTORY § 7 "기존에만 있는 것" — admin, signup 등
  - 이 라우트는 cutover 후에도 v1 컴포넌트가 그대로 매핑됨

### 2.2 디렉토리 — 영향: 대

- **삭제**: `src/pages/`, `src/components/` 중 v2 로 대체된 파일
  - § 7 "기존에만 있는 것" 에 해당하는 파일은 보존 (admin/signup 등)
- **이동 (rename)**: `src/pages-v2/` → `src/pages/`, `src/components-v2/` → `src/components/`
  - 기존 보존 파일과 충돌 시 § 4 / § 9 에서 결정
- **통합**: `src/styles-v2/` → `src/styles/`
  - 기존 `src/styles/` 잔존 파일과 토큰 충돌 가능 → § 5 에서 처리

### 2.3 라우터 — 영향: 중

- Phase 0 의 router-toggle 헬퍼 (`?v=2` 분기 로직) 제거
- v1 / v2 분기 라우트 정의 → 단일 정의로 단순화
- 영향: `src/router/` (또는 동등 위치) 일부 파일 + 헬퍼를 import 하던 모든 호출처

### 2.4 의존성 — 영향: 중

- **제거 후보**: v1 만 사용하던 라이브러리 (예: 구 UI 라이브러리, 구 form lib 등)
  - 실제 후보는 § 3 작성 시 코드 grep 으로 확정
- **영구화**: v2 도입 시 추가된 의존성은 cutover 후에도 유지
  - `package.json` / lockfile 정리 필요
- 주의: 의존성 제거는 lockfile diff 가 커지므로 별도 PR 권장 (§ 10)

### 2.5 CLAUDE.md — 영향: 소

`docs/CLAUDE.md` 의 "프론트엔드 v2 재구축 (진행 중)" 섹션 갱신.

- 제거: "src/pages-v2/, src/components-v2/, src/styles-v2/ 만 사용" 절대 규칙
- 제거: "기존 src/pages/, src/components/는 cutover PR 전까지 절대 수정 금지"
- 갱신: 진행 중 → 완료 상태로 표기, 또는 섹션 자체 삭제

### 2.6 테스트 — 영향: 중

- 삭제: v1 페이지 단위 / 통합 테스트 (해당 페이지가 v2 로 대체된 경우)
- 이동: `src/pages-v2/**/*.test.*` → 메인 위치로 함께 rename
- 보존: § 7 "기존에만 있는 것" 페이지의 테스트는 그대로 유지
- snapshot 테스트가 있다면 토큰 변경으로 대량 갱신 필요 가능 — § 9

### 2.7 CI / CD — 영향: 소

- 빌드 스크립트(`package.json` scripts), lint / tsconfig path alias 영향 점검
- `pages-v2`, `components-v2` 등을 path alias 또는 lint 규칙에서 명시적으로 참조하는 부분 제거
- GitHub Actions 워크플로우 / Vercel·Netlify 등 배포 설정에서 v2 관련 분기가 있다면 제거

## 3. 삭제 대상 (기존 코드)

INVENTORY § 1 (페이지 매핑) 기준으로 v2 가 대체한 기존 페이지 / 컴포넌트 / 스타일 / 기타.
경로는 cutover 시점에 실제 코드로 재확인 필요 (현재 표는 INVENTORY 기준 잠정안).

### 3.1 페이지

| 경로 | 대체된 v2 위치 | 처리 | 비고 |
| --- | --- | --- | --- |
| `src/pages/Home` (Landing) | `src/pages-v2/Landing` | 삭제 | INVENTORY § 1 |
| `src/pages/Events/List` | `src/pages-v2/EventList` | 삭제 | |
| `src/pages/Events/Detail` | `src/pages-v2/EventDetail` | 삭제 | |
| `src/pages/Cart` | `src/pages-v2/Cart` | 삭제 | |
| `src/pages/Login` | `src/pages-v2/Login` | 삭제 | |
| `src/pages/MyPage` | `src/pages-v2/MyPage` | 삭제 | 모든 탭 포함 |
| `src/pages/Admin` | (대체 없음) | **유지** | INVENTORY § 7, 범위 밖 |
| `src/pages/Signup` | (미정) | **결정 필요** | § 9, INVENTORY § 7 |

### 3.2 컴포넌트

`src/components/` 중 v2 로 대체된 것들 삭제. v1 페이지(admin / signup 등)에서만 사용되는 컴포넌트는 유지.

- 삭제 후보 식별 절차:
  1. `src/components/` 하위 모든 파일 나열
  2. 각 파일에 대해 `git grep "from .*components/<Name>"` 로 import 추적
  3. import 처가 모두 `src/pages/` 중 § 3.1 의 "삭제" 페이지 → 함께 삭제
  4. import 처에 § 3.1 의 "유지 / 결정 필요" 페이지가 하나라도 포함 → 유지
  5. v2 코드(`pages-v2`, `components-v2`)에서만 import 됨 → § 4 의 v2 컴포넌트가 대체했을 것이므로 검토 후 삭제
- 공통 컴포넌트 (Button / Input 등): v2 가 자체 버전을 가지면 v1 버전 삭제, 아니면 § 9 에서 통합 정책 결정

### 3.3 스타일

`src/styles/` 중 v1 만 사용하던 파일 삭제. v2 는 `src/styles-v2/` 로 분리되어 있으므로 충돌 없이 식별 가능.

- 삭제 후보:
  - v1 토큰 / variables 파일
  - v1 페이지 전용 스타일시트 (페이지가 삭제되면 같이 삭제)
- 보존:
  - v1 잔존 페이지(admin / signup 등)에서 import 하는 스타일
  - reset / normalize 등 글로벌 스타일은 § 4 의 styles-v2 통합 시점에서 일원화

### 3.4 hooks / utils / contexts

`src/hooks/`, `src/utils/`, `src/contexts/` (또는 동등 위치) 중 v1 페이지에서만 쓰이던 것.

- 식별 절차:
  1. 각 모듈에 대해 `git grep "from .*<modulePath>"` 로 import 추적
  2. v2 코드에서만 import → 보존 (v2 가 재사용 중)
  3. v1 페이지(§ 3.1 삭제 대상)에서만 import → 함께 삭제
  4. 양쪽에서 import → 보존, § 5 에서 v2 가 계속 쓰는 형태로 정리

### 3.5 삭제 안전성 확인 (공통 절차)

각 삭제 항목에 대해 머지 직전 다음 단계로 import 잔존 여부 확인.

```sh
# 1) 파일 단위 import 추적
git grep -n "from ['\"].*<파일경로 또는 심볼>['\"]"

# 2) dynamic import / require 형태도 확인
git grep -nE "import\(.*<파일경로>.*\)|require\(.*<파일경로>.*\)"

# 3) 문자열 경로 참조 (라우터 path 등)
git grep -n "<라우트 경로 또는 컴포넌트 이름>"
```

- 통과 기준:
  - 1) ~ 3) 결과가 모두 비어 있거나, 남은 참조가 § 3.1 의 "유지" 항목에서만 발생
  - tsc / eslint / 빌드 통과 (§ 1.5 와 동일)
- 위 grep 만으로 잡히지 않는 케이스: lazy / 문자열 조립 import, 테스트 fixture, public/ 정적 자산 → § 9 에 위험 항목으로 기록

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
