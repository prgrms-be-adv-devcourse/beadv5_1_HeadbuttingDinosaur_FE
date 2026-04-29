# DevTicket 프론트엔드 v2

기존 프론트를 프로토타입 기준으로 **재구축**.
UI는 전부 새로 작성하되, **API / 타입 / 인증 레이어는 기존 자산 그대로 활용**.

## 폴더 구조

```
docs/redesign/
├── README.md             ← 이 파일
├── SPEC.md               ← 페이지별 디자인 스펙 + API 매핑 가이드
├── WORKFLOW.md           ← 작업 프로세스 + 프롬프트 템플릿
├── pr-template.md        ← PR 본문 템플릿
├── prototype/            ← 프로토타입 원본 (시각 참고용)
│   ├── tokens.css
│   ├── ide-theme.css
│   ├── common.jsx        ← Icon, accent, fmtDate 등 헬퍼
│   ├── Layout.jsx
│   ├── Landing.jsx
│   ├── EventList.jsx
│   ├── EventDetail.jsx
│   ├── Login.jsx
│   ├── Cart.jsx
│   ├── MyPage.jsx
│   ├── App.jsx
│   ├── DevTicket_IDE.html  ← 통합 미리보기 진입점
│   └── logo-mark.svg
└── (작업 중 생성됨)
    ├── Login.plan.md
    ├── Login.pr.md
    └── ...
```

## 작업 위치 (소스 폴더)

기존 코드는 건드리지 않고 v2 폴더에 신규 작성. 페이지가 다 완성되면 마지막 cutover PR에서 v2를 메인으로 승격하고 기존 거 일괄 삭제.

```
src/
├── api/                  ← 기존. 그대로 재활용
├── types/                ← 기존. 그대로 재활용
├── lib/                  ← 기존. 인증/유틸 그대로 재활용
│
├── pages/                ← 기존. 작업하는 동안 그대로 둠
├── components/           ← 기존. 작업하는 동안 그대로 둠
│
├── pages-v2/             ← 신규 페이지. 여기에 작성
├── components-v2/        ← 신규 공용 컴포넌트
└── styles-v2/            ← 신규 토큰/글로벌 스타일
```

라우터에서 v2 토글 (예시):
```tsx
const useV2 = new URLSearchParams(location.search).get('v') === '2';
return useV2 ? <LoginV2 /> : <Login />;
```

## 이 폴더의 운명

전체 리뉴얼 머지 후 `chore/redesign-cleanup` PR에서 통째로 삭제:
- `docs/redesign/` 폴더 삭제
- `src/pages/`, `src/components/` 등 기존 UI 코드 삭제
- `pages-v2/` → `pages/`로 rename
- v2 라우터 토글 제거

## 프로토타입 미리보기

```bash
cd docs/redesign/prototype
python3 -m http.server 8080
# http://localhost:8080/DevTicket_IDE.html
```

## 작업 시작 전

1. `SPEC.md`의 **공통 규칙** + **API 재활용 가이드** 먼저 읽기
2. 작업할 페이지 섹션 + API 매핑 확인
3. `WORKFLOW.md`의 프롬프트 템플릿 복사
4. 새 세션마다 페이지 1개씩 (큰 페이지는 더 잘게)

## 절대 금지

- 프로토타입의 **인라인 style 객체 그대로 복붙**
- `window.X` 글로벌 패턴
- `useStateA`, `useStateE` 같은 별칭 (그냥 `useState`)
- mock 데이터를 v2 코드에 그대로 박기 (반드시 실제 API로)
- 한 PR에 여러 페이지 묶기
- 기존 `src/pages/`, `src/components/` 수정 (cutover PR 전까지)