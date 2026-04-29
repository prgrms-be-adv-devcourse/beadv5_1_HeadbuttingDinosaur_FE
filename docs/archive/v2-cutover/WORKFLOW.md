# 리뉴얼 작업 워크플로우 (v2 재구축)

기존 UI 코드는 건드리지 않고 `pages-v2/`에 신규 작성. 페이지 단위로 점진 머지.

---

## 작업 순서 (Phase)

### Phase 0: 기반 (반드시 먼저)
브랜치별로 분리된 PR들. 다른 페이지들이 이걸 의존하니까 가장 먼저 머지.

- `feat/v2-tokens` — 토큰, 폰트, 글로벌 스타일 (`src/styles-v2/`)
- `feat/v2-router-toggle` — v2 토글 메커니즘 (쿼리스트링 또는 feature flag)
- `feat/v2-layout` — Layout chrome (`src/components-v2/Layout/`)
- `feat/v2-shared-components` — 공용 컴포넌트들 (Button, Input, Chip, StatusChip, Eyebrow, Kbd, SectionHead, Icon, Card)

각 PR 사이즈 200~400줄 유지. 더 크면 더 분할.

### Phase 1: 인증 (가장 단순, 패턴 검증)
- `feat/v2-login` — Login 페이지 + 라우터 등록

### Phase 2: 핵심 커머스 (사용자 동선 순)
- `feat/v2-eventlist`
- `feat/v2-eventdetail`
- `feat/v2-cart`

### Phase 3: 마이페이지
- `feat/v2-mypage-shell` — 프로필 헤더 + 탭 + 라우팅
- `feat/v2-mypage-tickets`
- `feat/v2-mypage-orders`
- `feat/v2-mypage-wallet`
- `feat/v2-mypage-refund`

### Phase 4: 랜딩 (가장 무거움)
- `feat/v2-landing-base` — Hero (TypedTerminal 제외) + Stats + CTA
- `feat/v2-landing-terminal` — TypedTerminal 컴포넌트
- `feat/v2-landing-categories-featured` — Categories + Featured

### Phase 5: Cutover (마지막)
- `chore/v2-promote` — v2 → 메인 승격, 기존 코드 일괄 삭제, 토글 제거, `docs/redesign/` 삭제

---

## 페이지 작업 표준 프로세스

### 1단계: 계획만 받기

새 세션에서 (완전 초기 상태):

```
@docs/redesign/SPEC.md 의 ## {SECTION} 섹션 기준으로
src/pages-v2/{Page} 를 신규 작성한다.

베이스 (시각적 정답): @docs/redesign/prototype/{Page}.jsx
재활용 자산:
- API: @src/api (실제 사용 파일은 plan에서 식별)
- 타입: @src/types
- 인증: @src/lib/auth

규칙 (@docs/redesign/SPEC.md ## 0 공통 규칙 준수):
- 프로토타입의 마크업/UX는 충실히 재현
- 단, 인라인 style 객체 / window.* / 별칭은 가져오지 않음
- mock 데이터는 모두 실제 API로 교체 (어댑터 거쳐서)
- 프로토타입에 없는 상태(로딩/에러/empty/권한없음)도 모두 구현
- 프로젝트 CSS 솔루션 ({실제 솔루션 명시}) 사용
- TypeScript

먼저 plan만 docs/redesign/{Page}.plan.md 에 작성. 코드 변경 금지.

plan에 반드시 포함:
1. 페이지 디렉토리 구조 (어떤 파일들로 나눌지)
2. 컴포넌트 분해 표 (이름 / 역할 / props 시그니처 / 위치)
3. API 매핑 테이블 (mock 필드 → 실제 API 필드, 변환 로직 필요한 항목)
4. 데이터 페칭 전략 (사용할 훅, 캐싱, 에러 처리)
5. 신규 상태 처리 (로딩/에러/empty/권한없음 각각 어떻게)
6. 라우터 등록 방법
7. 의사결정 필요 지점 (예: 장바구니 서버 저장 여부)
8. 예상 PR 분할 (한 PR이 너무 커지면 어떻게 나눌지)
```

### 2단계: plan 검토 (사람이 10분)

읽고 체크:
- API 매핑 테이블이 빠짐없는가
- 어댑터 격리되어 있는가 (컴포넌트가 API 형태에 직접 의존하지 않는가)
- 신규 상태 (로딩/에러/empty) 모두 처리됐는가
- 디렉토리 구조가 SPEC § 0의 표준 따르는가
- 의사결정 필요 지점이 명확히 표시됐는가
- PR 분할 단위가 합리적인가 (한 PR 200~400줄 목표)

부족하면 plan 수정 요청. 이게 가장 중요한 게이트.

### 3단계: 구현 (PR 단위로 끊어서)

Plan에서 나눈 PR 단위로 작업. 각 PR 안에서도 컴포넌트 1개씩.

```
ok, plan 승인. PR 1 (Login 베이스 - 시각만, API 연동 X) 시작.

규칙:
- adapters.ts, types.ts, hooks.ts 먼저 만들고 멈춤 (확인 후 진행)
- 그 다음 컴포넌트 1개씩
- 각 컴포넌트 끝낼 때마다 멈추고 보고
- 통째로 다시 쓰지 말고 정확한 부분만 Edit
- 다음 진행 여부는 내가 결정

먼저 types.ts, adapters.ts 부터 시작.
```

각 단위 끝날 때마다:
- diff 확인
- **즉시 commit** (`git commit -m "feat(v2): EventList types and adapters"`)

이렇게 하면 중간에 클로드코드 터져도 작업이 살아남음.

### 4단계: API 통합 (별도 PR 또는 같은 PR 후반부)

```
이제 hooks.ts 작성 + 컴포넌트에 데이터 연결.

- 실제 API 호출 (mock 제거)
- 로딩 상태: 스켈레톤 컴포넌트 작성
- 에러 상태: 재시도 버튼 포함
- 빈 상태: 프로토타입의 stack-trace 박스 활용
- 401 발생 시 로그인 페이지로 (returnTo 파라미터 포함)

먼저 hooks.ts 부터.
```

### 5단계: 라우터 등록

```
이 페이지를 라우터에 v2 토글로 등록.
@src/routes/... 파일 확인 후 plan에 명시한 방식대로 추가.

기존 페이지는 건드리지 마. v2 토글 분기만 추가.
```

### 6단계: 검증

- 로컬에서 동작 확인 (`?v=2` 쿼리스트링 또는 flag로)
- 라이트/다크 모드
- 모바일/태블릿/데스크탑
- 키보드 접근성
- 로딩/에러/empty 각 상태 강제 발생시켜 확인

### 7단계: PR 본문 받기

```
지금까지 작업 내용을 정리해서 docs/redesign/{Page}.{N}.pr.md 에 PR 본문 작성.
@docs/redesign/pr-template.md 형식 따라.
```

### 8단계: 푸시 + PR (직접)

클로드코드한테 시키지 말고 **직접 터미널에서**:

```bash
git push origin feat/v2-{page}
gh pr create \
  --title "feat(v2): {Page} {N}/{Total}" \
  --body-file docs/redesign/{Page}.{N}.pr.md \
  --base develop
```

### 9단계: 세션 종료

```
/clear
```

다음 PR은 완전히 새 세션에서.

---

## PR 사이즈 분할 가이드

페이지 1개를 한 PR에 다 넣으면 200~400줄 초과 + 클로드코드 한 세션 안에 못 끝남. 다음 단위로 분할 권장:

### 작은 페이지 (Login, Cart 빈상태)
- PR 1: 페이지 베이스 + 시각만 (mock 데이터로 렌더)
- PR 2: API 통합 + 라우터 등록

### 중간 페이지 (EventDetail, MyPage 단일 탭)
- PR 1: types/adapters/hooks
- PR 2: 시각 컴포넌트들 (mock으로)
- PR 3: API 통합 + 상태 처리 + 라우터

### 큰 페이지 (EventList, Landing)
- PR 1: types/adapters/hooks + 핵심 카드 컴포넌트
- PR 2: 검색/필터/Hero
- PR 3: API 통합 + 페이지네이션
- PR 4: 키보드 네비, 스켈레톤, 빈/에러 상태
- PR 5: 라우터 등록 + 최종 통합

각 PR 머지되어도 메인 동작에 영향 없게 v2 토글 안에서만 작동. `?v=2`로 점진 검증.

---

## 자주 막히는 상황

### "통째로 새 파일 다 만듦"
즉시 멈추고:
```
잠깐. 한 번에 컴포넌트 1개씩만. 지금 만든 거 중에 첫 번째만 남기고
나머지는 되돌려. 첫 번째 검토 후 진행.
```

### "API 호출을 컴포넌트 안에 직접 박음"
```
adapters.ts / hooks.ts로 격리. 컴포넌트는 VM과 hook 결과만 알아야 함.
@docs/redesign/SPEC.md ## 10 어댑터 규칙 다시 확인.
```

### "mock 데이터를 v2 코드에 그대로 둠"
```
프로토타입의 MOCK_EVENTS는 시각 참고용일 뿐. v2 코드에 들어가면 안 됨.
실제 API 호출로 교체. 어떤 엔드포인트 쓸지 plan의 API 매핑 다시 확인.
```

### "인라인 style 그대로 박음"
```
인라인 style 객체 사용 금지. 우리 프로젝트 CSS 솔루션 ({솔루션}) 사용.
동적 값 (accent color 등 props에 따라 변하는 값)만 인라인 허용.
이미 박힌 거 있으면 빼.
```

### "TypedTerminal처럼 한 컴포넌트가 너무 큼"
```
이 컴포넌트는 별도 파일로 분리. components/{Name}.tsx 만들고 옮긴 후 import.
분리부터 끝내고 멈춰. 스타일/로직은 다음 턴에.
```

### "기존 src/pages/, src/components/ 건드리려 함"
```
기존 코드는 절대 수정 금지. v2는 src/pages-v2/, src/components-v2/에만.
cutover PR 전까지 기존 코드는 그대로 둠.
```

### "Stream idle timeout 발생"
- 작업 더 잘게. 컴포넌트 1개 → 섹션 1개로
- 시간 두고 재시도. status.anthropic.com 확인
- 그래도 반복되면 그날은 무거운 작업 미루기

### "PR 안 올라감"
직접 `gh pr create` 쓰는 패턴으로. 클로드코드한테 push/pr 시키지 마.

---

## CLAUDE.md 추가 스니펫

레포 루트 `CLAUDE.md`에 추가:

```markdown
## 프론트엔드 v2 재구축 (진행 중)

기존 프론트를 프로토타입 기준으로 재구축 중. API/타입/인증 레이어는 재활용.

- 디자인 & API 스펙: @docs/redesign/SPEC.md
- 작업 가이드: @docs/redesign/WORKFLOW.md
- 시각 참고 프로토타입: @docs/redesign/prototype/

### 절대 규칙
- 신규 코드: src/pages-v2/, src/components-v2/, src/styles-v2/
- 기존 src/pages/, src/components/는 cutover PR 전까지 절대 수정 금지
- 모든 API 응답은 페이지별 adapters.ts 거쳐서 VM으로 변환
- 프로토타입의 인라인 style, window.*, useStateA 별칭은 가져오지 않음
- 프로토타입의 mock 데이터는 v2 코드에 들어가면 안 됨 (반드시 실제 API)
- 페이지 1개 작업 = plan 먼저 + PR 단위로 분할 + 컴포넌트 1개씩

작업 시작 전 항상 SPEC.md의 § 0 공통 규칙과 § 10 API 가이드 확인.
```

---

## 페이지 작업 완료 체크리스트

PR 머지 직전 확인:

### 코드
- [ ] `src/pages-v2/`, `src/components-v2/`, `src/styles-v2/`에만 작성됨
- [ ] 기존 `src/pages/`, `src/components/` 변경 없음
- [ ] 인라인 style 객체 없음 (동적 값 제외)
- [ ] `window.*` 글로벌 없음
- [ ] mock 데이터 v2 코드에 박혀있지 않음
- [ ] adapters.ts에 API ↔ VM 변환 격리됨
- [ ] 컴포넌트가 API 형태에 직접 의존하지 않음
- [ ] TypeScript 컴파일 에러 없음
- [ ] ESLint / Prettier 통과

### 기능
- [ ] mock 모두 실제 API로 교체됨
- [ ] 로딩 상태 구현 (스켈레톤 또는 스피너)
- [ ] 에러 상태 구현 (재시도 가능)
- [ ] 빈 상태 구현 (검색어 유무 등 컨텍스트 반영)
- [ ] 인증 필요 페이지: 401 시 로그인 리다이렉트
- [ ] 권한 필요 페이지: 403 처리

### 디자인
- [ ] SPEC § 해당 섹션의 모든 항목 반영
- [ ] 라이트/다크 모드 동작
- [ ] 반응형 (모바일/태블릿/데스크탑)
- [ ] 키보드 포커스 / hover 상태 자연스러움

### 통합
- [ ] v2 라우터 토글에 등록됨 (`?v=2` 또는 flag)
- [ ] 기존 페이지 동작 영향 없음 (회귀 없음)
- [ ] PR 본문 작성됨 (`{Page}.{N}.pr.md`)