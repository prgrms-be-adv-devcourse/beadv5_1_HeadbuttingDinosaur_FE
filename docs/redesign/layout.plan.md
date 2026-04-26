# Layout Chrome 계획

## 1. 프로토타입 분석 (Layout.jsx + ide-theme.css)

기준: SPEC.md § 9 — **Option A 확정** (IDE chrome 충실 재현). 프로토타입의 mock 데이터 / `window.*` 전역 / 인라인 스타일은 v2 코드에 반입 금지.

### 1-1. 영역별 구성 (CSS Grid 기반)

`.ide` 그리드 정의 (ide-theme.css:98-110):
- `grid-template-rows: 36px 34px 1fr 24px` → 타이틀 / 탭 / 본문 / 상태
- `grid-template-columns: 48px 220px 1fr 60px` → 액티비티 / 사이드바 / 에디터 / 미니맵
- `grid-template-areas`: `title` 행은 4열 모두 차지, `act` 열은 탭/사이드바/본문/미니맵 행 모두 차지(왼쪽 끝까지), `status` 행은 4열 모두 차지

| 위치 | 컴포넌트 (Layout.jsx) | grid-area | 크기 |
|---|---|---|---|
| 상단 | `TitleBar` (L6-24) | `title` | 36px |
| 상단 | `TabBar` (L154-171) | `tabs` | 34px (`act` 옆부터 우측 끝까지) |
| 좌측 | `ActivityBar` (L26-56) | `act` | 48px (title 아래부터 status 위까지 세로) |
| 좌측 | `Sidebar` (L58-152) | `side` | 220px |
| 본문 | `<div className="ide-editor">` (L332-334) | `editor` | 1fr (children 렌더 영역) |
| 우측 | `Minimap` (L173-192) | `mini` | 60px |
| 하단 | `StatusBar` (L194-213) | `status` | 24px |
| 오버레이 | `CommandPalette` (L215-278) | fixed 오버레이 | 560px / pad-top 120px |

### 1-2. 영역별 시각 요소

**TitleBar** (`.ide-title` ide-theme.css:120-171)
- 36px 높이, `bg=var(--chrome)`, 하단 1px `var(--chrome-2)` 보더, 좌우 12px 패딩, gap 12px, font 12px `var(--text-3)`
- `.traffic` (L132-139): 12px 원 3개 (`#FF5F57` / `#FEBC2E` / `#28C840`) — macOS 트래픽 라이트
- `.title-text` (L140-147): flex:1 중앙 정렬, sans 폰트, "DevTicket · 개발자를 위한 이벤트 티켓"
- `.title-cmd` (L148-171): min-width 260px, 4px radius, 1px `var(--border)` 보더, ⌘K kbd 표시. hover 시 `var(--surface)` 배경
- 우측 끝 테마 토글 버튼 (`.act-btn` 30×26 width override, sun/moon 아이콘)

**ActivityBar** (`.ide-activity` ide-theme.css:174-210)
- 48px 폭, `bg=var(--sidebar-bg)`, 우측 1px `var(--border)` 보더, 세로 flex, gap 2px, padding 6px 0
- `.act-btn` (L183-196): 40×40, 색 `var(--text-4)`, hover `var(--text-2)`, **active 시 좌측 2px `var(--brand)` 보더 + 색 `var(--text)`**
- `.act-badge` (L197-209): 우상단 16px 원형, `bg=var(--brand)` 흰 텍스트 — 장바구니 카운트
- `.act-spacer` (L210): flex:1 — 설정 버튼 하단 푸시
- 항목 (Layout.jsx:28-34): home / events / search(palette) / cart(badge) / mypage / [spacer] / settings

**Sidebar** (`.ide-sidebar` ide-theme.css:213-264)
- 220px 폭, `bg=var(--sidebar-bg)`, 우측 1px `var(--border)` 보더, overflow-y auto, font 13px
- `.side-header` (L219-228): 8/14/6 padding, sans 11px 600w uppercase letter-spacing 0.06em `var(--text-3)`, 우측 chevron 토글
- `.side-group` (L229): padding 0 0 8px
- `.side-item` (L230-245): mono 12.5px `var(--text-2)`, padding 3px 12px 3px 18px, gap 6px, **active 시 `bg=var(--editor-line)` + 좌측 2px `var(--brand)`**, hover `bg=var(--surface-2)`
- `.side-count` (L255-263): 우측 정렬 카운트 배지, 10px 600w, `bg=var(--surface-2)` 8px radius
- 섹션 (Layout.jsx:71-150): 메뉴(홈/이벤트+카테고리 6개/장바구니/마이페이지/[로그인]) / 다가오는 이벤트(상위 4개) / 세션(로그인 시)

**TabBar** (`.ide-tabs` ide-theme.css:267-318)
- 34px 높이, `bg=var(--chrome)`, 하단 1px `var(--border)` 보더, 가로 스크롤 (스크롤바 숨김)
- `.tab` (L276-294): mono 12.5px `var(--text-3)`, padding 0 12px, 우측 1px `var(--border)` 분리선, hover `bg=var(--chrome-2)`
- `.tab.active` (L291-301): `bg=var(--editor-bg)` + 색 `var(--text)` + **상단 2px `var(--brand)` 인디케이터** (`::before`)
- `.tab .close` (L303-312): 16×16 hover 시 `bg=var(--surface-2)`
- 탭 (Layout.jsx:294-302): home / events / detail / cart / mypage / login (라우트 1:1)

**Editor 본문** (`.ide-editor` ide-theme.css:115, 321)
- 1fr 영역, overflow auto, position relative — children 렌더만 담당 (Layout.jsx:332-334)
- 페이지 콘텐츠가 사용하는 `.editor-scroll` / `.gutter` / `.editor-body` 클래스(L322-347)는 페이지 측 책임 (Layout 자체는 wrapper만 제공)

**Minimap** (`.ide-minimap` ide-theme.css:374-401)
- 60px 폭, `bg=var(--minimap-bg)`, 좌측 1px `var(--border)` 보더, padding 6px 6px 0
- `.mini-line` (L381-391): 3px 높이, 80개 라인 (Layout.jsx:182), 4가지 클래스 — `.kw`/`.fn`/`.str`/`.cmt`로 syntax 색 흉내
- `.mini-window` (L392-401): 절대 위치 120px 높이, `rgba(79,70,229,0.12)` 박스 — viewport 표시
- 라우트별 패턴(Layout.jsx:174-180)은 시각 장식만 — 인터랙션 없음

**StatusBar** (`.ide-status` ide-theme.css:404-425)
- 24px 높이, `bg=var(--status-bg)` (라이트=`#4F46E5`, 다크=`#007ACC`), 흰 텍스트, mono 11.5px, padding 0 10px
- `.status-item` (L414-422): gap 5px, padding 0 10px, `.clickable` hover `rgba(255,255,255,0.1)`
- `.status-spacer` (L424): flex:1 — 좌측(브랜치/상태/라벨) ↔ 우측(언어/사용자/⌘K) 분리
- `.term-ok` (L425): `var(--term-green)` — "● 정상" 인디케이터
- 항목 (Layout.jsx:198-211): git+DevTicket / 정상 / 라우트 라벨 / [spacer] / 한국어 / 사용자 닉네임 / ⌘K

**CommandPalette** (`.palette-backdrop` ide-theme.css:648-713)
- fixed inset 0, `rgba(15,23,42,0.55)` + 4px blur, z-index 1000, padding-top 120px
- `.palette` (L658-667): 560px width, `bg=var(--surface)`, 8px radius, 1px `var(--border)` 보더, 큰 그림자
- `.palette-input` (L668-676): 14px 16px padding, 14px 폰트
- `.palette-list` (L677): max-height 340px overflow auto
- `.palette-item` (L678-692): 9px 12px, sel/hover 시 `bg=var(--brand-light)` + 색 `var(--brand)`
- `.palette-hint` (L699-713): 10.5px 푸터, ↑↓/↵/esc kbd 가이드 + 결과 카운트

### 1-3. 인터랙티브 요소

**클릭 / 호버 / 토글**
- TitleBar: `title-cmd` 클릭 → palette open / 테마 토글 버튼 → `onToggleTheme`
- ActivityBar: 항목 클릭 → `nav(key)`. `search` → palette, `cart`/`mypage` 미인증 시 `nav('login')`으로 가드 (Layout.jsx:42-44)
- Sidebar: `side-header` 클릭 → 섹션 접기/펴기 (`openExp`, `openUp` state), 카테고리 클릭 → `nav('events')` + `window.__setCat`(v2에서는 prop/store로 대체 필요), upcoming event 클릭 → `nav('detail', { id })`
- TabBar: 탭 클릭 → `onSelect(key)`, x 버튼 → `onClose(key)` (탭이 1개일 땐 close 미표시)
- StatusBar: ⌘K 영역 → palette open
- CommandPalette: backdrop 클릭 → close, 항목 hover → `setSel(i)`, 항목 클릭 → `run(i)` 후 close

**키보드 단축키** (Layout.jsx:304-324)
- `⌘K` / `Ctrl+K` → palette open
- `Escape` → palette close
- `/` → `window.__focusSearch` (v2에선 검색 입력 ref로 대체)
- `g` 후 `h`/`e`/`c`/`m` → 라우트 이동 (cart/mypage는 인증 가드)
- `j` / `k` → `window.__cardNav(±1)` (페이지 측 카드 포커스 이동)
- `Enter` → `window.__cardOpen` (현재 카드 열기)
- 팔레트 내부: `↑`/`↓` 항목 이동, `Enter` 실행, `Escape` 닫기
- 입력 필드 안에서는 단축키(/ , g, j, k 등) 무시 (Layout.jsx:308 `inInput`)

### 1-4. 클래스 → 영역 매핑

| 영역 | 핵심 클래스 |
|---|---|
| 그리드 컨테이너 | `.ide` |
| 타이틀 | `.ide-title`, `.traffic`, `.tc-red`, `.tc-yellow`, `.tc-green`, `.title-text`, `.title-cmd` (+ `kbd`) |
| 액티비티 | `.ide-activity`, `.act-btn`, `.act-btn.active`, `.act-badge`, `.act-spacer` |
| 사이드바 | `.ide-sidebar`, `.side-header`, `.side-group`, `.side-item`, `.side-item.active`, `.tri`, `.side-count`, `.side-nested` |
| 탭 | `.ide-tabs`, `.tab`, `.tab.active`, `.tab .close`, `.tab .dot`, `.tab .dot.modified` |
| 본문 | `.ide-editor` (Layout 책임). `.editor-scroll`, `.gutter`, `.editor-body`, `.sk/.ss/.sn/.sf/.sp/.sc/.spu/.st/.stg`, `.caret`는 페이지 책임 |
| 미니맵 | `.ide-minimap`, `.mini-line`, `.mini-line.kw`, `.mini-line.fn`, `.mini-line.str`, `.mini-line.cmt`, `.mini-window` |
| 상태 | `.ide-status`, `.status-item`, `.status-item.clickable`, `.status-spacer`, `.term-ok` |
| 팔레트 | `.palette-backdrop`, `.palette`, `.palette-input`, `.palette-list`, `.palette-item`, `.palette-item.sel`, `.palette-item .shortcut`, `.palette-hint` |
| 스크롤바 | `.ide-editor::-webkit-scrollbar`, `.ide-sidebar::-webkit-scrollbar` (+ track/thumb) |
| 반응형 | `@media (max-width: 960px)` — 사이드바/미니맵 숨김 |

### 1-5. Option A 범위 결정

**포함 (Phase 0 Layout chrome 책임)**
- TitleBar (트래픽 라이트 + 서비스명 + ⌘K 검색 박스 + 테마 토글)
- ActivityBar (홈/이벤트/검색/장바구니/마이페이지/설정 + 카운트 배지 + 인증 가드)
- Sidebar (메뉴 트리 + 카테고리 카운트 + 다가오는 이벤트 + 세션 정보)
- TabBar (라우트 ↔ 탭 동기화, active 인디케이터, close 버튼)
- Editor wrapper (`.ide-editor` children 슬롯만)
- Minimap (라우트별 패턴 — 시각 장식)
- StatusBar (브랜치/상태/라우트 라벨/언어/세션/⌘K)
- CommandPalette (오버레이, 키보드 네비게이션, 라우트/이벤트 검색)
- 전역 키보드 핸들러 (⌘K, Escape, g+x 시퀀스, j/k, Enter)
- 반응형 폴백 (960px 이하 사이드바/미니맵 숨김)

**제외 / v2 변환 시 대체**
- `window.MOCK_EVENTS` 의존 (Layout.jsx:62, 230) → 실제 API + adapter VM (다가오는 이벤트, 카테고리 카운트, 팔레트 이벤트 검색 모두 동일)
- `window.__openPalette` / `__toggleTheme` / `__logout` / `__setCat` / `__focusSearch` / `__cardNav` / `__cardOpen` / `__seqG` 전역 (Layout.jsx:42, 93, 228, 283-292, 310-320) → React context / props / store 로 대체
- `React.useState` 비구조화 (Layout.jsx:4) → 일반 import
- 인라인 `style={{...}}` (Layout.jsx 곳곳) → `ide-chrome.css` 클래스로 이전
- 카테고리 하드코딩 배열 (Layout.jsx:63) → API 또는 상수 모듈
- `Icon` / `fmtDate` 가 `window.*` 인 부분 → 모듈 import


## 2. 컴포넌트 분해
(작성 예정)

## 3. 각 서브 컴포넌트 props 시그니처
(작성 예정)

## 4. 데이터 의존성 (라우터, 인증, 테마)
(작성 예정)

## 5. ide-chrome.css 토큰 및 클래스 목록
(작성 예정)

## 6. 반응형 / 다크모드 / 접근성
(작성 예정)

## 7. 파일 생성 순서
(작성 예정)
