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

### 2-1. 파일 트리 (`src/components-v2/Layout/`)

```
src/components-v2/Layout/
├── index.tsx                         # 메인 컨테이너 (그리드 셸 + palette 상태)
├── TitleBar.tsx                      # 상단 타이틀바
├── ActivityBar.tsx                   # 좌측 아이콘 레일
├── Sidebar/
│   ├── index.tsx                     # 사이드바 컨테이너 (섹션 접기/펴기)
│   ├── SidebarMenu.tsx               # 메뉴 트리 (홈/이벤트+카테고리/장바구니/마이페이지/로그인)
│   ├── SidebarUpcoming.tsx           # 다가오는 이벤트 섹션
│   └── SidebarSession.tsx            # 세션 정보 (로그인 시)
├── TabBar.tsx                        # 라우트 ↔ 탭 동기화
├── Minimap.tsx                       # 우측 미니맵 (장식)
├── StatusBar.tsx                     # 하단 상태바
├── CommandPalette/
│   ├── index.tsx                     # 오버레이 + 검색/선택 상태
│   ├── PaletteList.tsx               # 필터된 항목 리스트
│   └── usePaletteCommands.ts         # 명령 + 이벤트 검색 항목 빌드
├── hooks/
│   └── useGlobalShortcuts.ts         # ⌘K / Esc / g+x / j/k / Enter
├── LayoutChromeContext.tsx           # palette open / theme / logout 공유
└── types.ts                          # RouteKey, ActivityItem, TabDef, PaletteItem
```

분해 기준: 프로토타입 단일 파일(343줄)을 영역별로 나누고, **Sidebar(95줄 → TS 변환 시 150~180줄 예상)** 과 **CommandPalette(64줄 + 명령 빌드 로직)** 만 추가 분해. 나머지 영역은 단일 파일로 유지(모두 변환 후 100줄 이하 추정).

### 2-2. 컴포넌트 표

| 파일 | 컴포넌트 | 위치 | 역할 (1줄) | 의존 |
|---|---|---|---|---|
| `index.tsx` | `Layout` | 전체 | `.ide` 그리드 셸 + 자식 슬롯(`<Outlet/>`) + palette 상태 보유 | `TitleBar`, `ActivityBar`, `Sidebar`, `TabBar`, `Minimap`, `StatusBar`, `CommandPalette`, `LayoutChromeProvider`, `useGlobalShortcuts` |
| `TitleBar.tsx` | `TitleBar` | 상단 (36px) | 트래픽 라이트 + 서비스명 + ⌘K 검색 박스 + 테마 토글 버튼 | `Icon` |
| `ActivityBar.tsx` | `ActivityBar` | 좌측 (48px) | 라우트별 아이콘 버튼 + 카트 카운트 배지 + 인증 가드 | `Icon`, `useChrome` |
| `Sidebar/index.tsx` | `Sidebar` | 좌측 (220px) | 3개 섹션 컨테이너 + 헤더 접기/펴기 상태 관리 | `SidebarMenu`, `SidebarUpcoming`, `SidebarSession` |
| `Sidebar/SidebarMenu.tsx` | `SidebarMenu` | 사이드바 1번째 섹션 | 메뉴 트리(홈/이벤트+카테고리 6개/장바구니/마이페이지/로그인) + 카테고리 카운트 | `Icon` |
| `Sidebar/SidebarUpcoming.tsx` | `SidebarUpcoming` | 사이드바 2번째 섹션 | 판매중 이벤트 상위 4개 리스트 → detail 라우트 이동 | (api adapter VM) |
| `Sidebar/SidebarSession.tsx` | `SidebarSession` | 사이드바 3번째 섹션 | 로그인 시 닉네임 + 온라인 인디케이터 | — |
| `TabBar.tsx` | `TabBar` | 상단 2행 (34px) | 라우트별 탭 표시 + active 인디케이터 + close 버튼 | `Icon` |
| `Minimap.tsx` | `Minimap` | 우측 (60px) | 라우트별 syntax 라인 패턴 + viewport 윈도우 (장식) | — |
| `StatusBar.tsx` | `StatusBar` | 하단 (24px) | 브랜치 / 상태 / 라우트 라벨 / 언어 / 세션 / ⌘K 트리거 | `Icon`, `useChrome` |
| `CommandPalette/index.tsx` | `CommandPalette` | fixed 오버레이 | 백드롭 + 입력 + 키보드 네비 + 힌트 푸터 | `PaletteList`, `usePaletteCommands` |
| `CommandPalette/PaletteList.tsx` | `PaletteList` | 팔레트 내부 | 필터 결과 항목 렌더 + hover/sel 하이라이트 | `Icon` |
| `CommandPalette/usePaletteCommands.ts` | `usePaletteCommands` | hook | 정적 명령(라우트/테마/로그인) + 이벤트 검색 항목 빌드 | (api adapter VM) |
| `hooks/useGlobalShortcuts.ts` | `useGlobalShortcuts` | hook | ⌘K / Esc / `/` / g+h·e·c·m / j·k / Enter 키 핸들러 | `useChrome` |
| `LayoutChromeContext.tsx` | `LayoutChromeProvider` / `useChrome` | context | `openPalette` / `toggleTheme` / `logout` / `focusSearch` 공유 (`window.*` 대체) | — |
| `types.ts` | (타입만) | — | `RouteKey`, `ActivityItem`, `TabDef`, `PaletteItem`, `ChromeContextValue` | — |

### 2-3. 분해 근거 (200줄 가드)

| 컴포넌트 | 프로토타입 라인 | TS 변환 후 예상 | 분해? |
|---|---|---|---|
| TitleBar | 19 | ~50 | 아니오 |
| ActivityBar | 31 | ~80 (items 정의 + 가드) | 아니오 |
| **Sidebar** | **95** | **170~200 (위험)** | **예 → 3 sub** |
| TabBar | 18 | ~50 | 아니오 |
| Minimap | 20 | ~60 (패턴 상수 포함) | 아니오 |
| StatusBar | 20 | ~70 | 아니오 |
| **CommandPalette** | **64** | **180~220 (위험)** | **예 → list + hook 분리** |
| Layout (index) | 61 | ~120 (context provider + shortcuts hook 호출) | 아니오 |

`Sidebar/`는 섹션이 3개로 명확히 분리되고 각각 독립적인 데이터/상태를 가지므로 폴더 분해. `CommandPalette/`는 항목 빌드 로직(이벤트 API 호출 포함)을 hook으로 빼고, 리스트 렌더만 별도 파일로.

### 2-4. 제외 — 별도 파일로 만들지 않는 것

- `TrafficLights` — 6줄짜리 마크업, `TitleBar` 내부에 인라인
- `SidebarSectionHeader` — 헤더는 패턴이 단순(제목 + chevron)해서 각 섹션에서 직접 작성
- `Tab` 단일 항목 — 18줄 안쪽이라 `TabBar` 내부 map으로 충분
- `PaletteInput` / `PaletteHint` — 각각 5~10줄, `CommandPalette/index.tsx` 내부에 인라인


## 3. 각 서브 컴포넌트 props 시그니처

원칙:
- 라우트/인증/테마/카트는 컨테이너(`Layout`) 또는 `useChrome`/router/auth/cart 훅에서 끌어 쓰고, 서브 컴포넌트는 **prop 주입** 받음 (테스트 용이성 + `window.*` 제거 — § 2-4 결정).
- 모든 컴포넌트는 `className?: string` 받음 (외부에서 spacing/override 가능). 다만 `Layout` 자체는 grid 셸이라 받지 않음.
- 콜백은 `onX` 네이밍, 동기 함수 시그니처. 비동기는 hook 안에서 처리.

### 3-1. 공통 타입 (`types.ts`)

```ts
export type RouteKey =
  | 'home'
  | 'events'
  | 'detail'
  | 'cart'
  | 'mypage'
  | 'login';

export type ActivityKey = RouteKey | 'search' | 'settings';

export interface ActivityItem {
  key: ActivityKey;
  icon: string;          // Icon 이름 (예: 'terminal', 'folder', 'cart')
  label: string;         // tooltip + 접근성 라벨
  badge?: number;        // 0 이상이면 표시
  action?: 'palette';    // 'palette' 면 nav 대신 팔레트 오픈
}

export interface TabDef {
  key: RouteKey;
  label: string;
  icon: string;
}

export interface PaletteItem {
  key: string;
  label: string;
  hint: string;
  icon: string;
  shortcut?: string;     // 'g h' 같은 표시용 — 동작은 useGlobalShortcuts 가 담당
  action: () => void;
}

export interface UpcomingEventVM {
  eventId: string;
  title: string;
  dateText: string;      // 사전 포맷 ("2026-05-12")
  priceText: string;     // "무료" | "49,000원"
}

export interface CategoryCount {
  name: string;
  count: number;
}

export interface SessionUser {
  nickname: string;
}

export type ThemeMode = 'light' | 'dark';

export type NavParams = { id?: string; category?: string };
export type NavigateFn = (key: RouteKey, params?: NavParams) => void;
```

### 3-2. `LayoutChromeContext.tsx`

```ts
export interface ChromeContextValue {
  openPalette: () => void;
  closePalette: () => void;
  toggleTheme: () => void;
  logout: () => void;
  focusSearch: () => void;
  registerSearchInput: (el: HTMLInputElement | null) => void;
}

export interface LayoutChromeProviderProps {
  children: React.ReactNode;
  onToggleTheme: () => void;          // App-level 테마 store 의 토글
  onLogout: () => void;               // auth context 의 logout
}

export function LayoutChromeProvider(
  props: LayoutChromeProviderProps,
): JSX.Element;

// throw 시 Provider 누락 — 명시적 에러
export function useChrome(): ChromeContextValue;
```

### 3-3. `index.tsx` — `Layout`

```ts
export interface LayoutProps {
  /** 미지정 시 React Router <Outlet/> 렌더 */
  children?: React.ReactNode;
}

export default function Layout(props: LayoutProps): JSX.Element;
```

내부에서 끌어 쓰는 것: `useLocation` (현재 라우트), `useNavigate`, `useAuth`(isLoggedIn/user/logout), `useTheme`, `useCart`(count), `useGlobalShortcuts`. props 는 `children` 하나뿐.

### 3-4. `TitleBar.tsx`

```ts
export interface TitleBarProps {
  theme: ThemeMode;
  onToggleTheme: () => void;
  onOpenPalette: () => void;
  className?: string;
}

export function TitleBar(props: TitleBarProps): JSX.Element;
```

기본값 없음 — 모두 필수. `traffic` 마크업은 내부 인라인.

### 3-5. `ActivityBar.tsx`

```ts
export interface ActivityBarProps {
  currentRoute: RouteKey;
  cartCount: number;          // 0 이면 배지 미표시
  isLoggedIn: boolean;
  onNavigate: NavigateFn;     // cart/mypage 미인증 시 내부에서 'login' 으로 가드
  onOpenPalette: () => void;  // search 항목 클릭 시
  className?: string;
}

export function ActivityBar(props: ActivityBarProps): JSX.Element;
```

`items: ActivityItem[]` 은 컴포넌트 내부 상수. settings 버튼은 현재 클릭 동작 미정 — onClick 미연결.

### 3-6. `Sidebar/index.tsx`

```ts
export interface SidebarProps {
  currentRoute: RouteKey;
  isLoggedIn: boolean;
  user: SessionUser | null;
  totalEventCount: number;
  categories: CategoryCount[];   // adapter 에서 계산해서 주입
  upcoming: UpcomingEventVM[];   // 상위 4개 (slice 는 호출자 책임)
  onNavigate: NavigateFn;
  className?: string;
}

export function Sidebar(props: SidebarProps): JSX.Element;
```

내부 상태: `[menuOpen, setMenuOpen]`, `[upcomingOpen, setUpcomingOpen]` (둘 다 `useState(true)`). 세션 섹션은 항상 펼침 (토글 없음 — 프로토타입 동일).

### 3-7. `Sidebar/SidebarMenu.tsx`

```ts
export interface SidebarMenuProps {
  currentRoute: RouteKey;
  isLoggedIn: boolean;
  open: boolean;
  onToggle: () => void;
  totalEventCount: number;
  categories: CategoryCount[];
  onNavigate: NavigateFn;        // events + category 클릭 시 { category } 전달
}

export function SidebarMenu(props: SidebarMenuProps): JSX.Element;
```

### 3-8. `Sidebar/SidebarUpcoming.tsx`

```ts
export interface SidebarUpcomingProps {
  open: boolean;
  onToggle: () => void;
  events: UpcomingEventVM[];
  onSelectEvent: (eventId: string) => void;
}

export function SidebarUpcoming(props: SidebarUpcomingProps): JSX.Element;
```

### 3-9. `Sidebar/SidebarSession.tsx`

```ts
export interface SidebarSessionProps {
  user: SessionUser;            // null 체크는 부모(Sidebar) 책임 — 비로그인이면 렌더 안 함
}

export function SidebarSession(props: SidebarSessionProps): JSX.Element;
```

### 3-10. `TabBar.tsx`

```ts
export interface TabBarProps {
  tabs: TabDef[];
  activeKey: RouteKey;
  onSelect: (key: RouteKey) => void;
  /** 미지정 또는 tabs.length === 1 이면 close 버튼 미표시 */
  onClose?: (key: RouteKey) => void;
  className?: string;
}

export function TabBar(props: TabBarProps): JSX.Element;
```

### 3-11. `Minimap.tsx`

```ts
export interface MinimapProps {
  route: RouteKey;
  className?: string;
}

export function Minimap(props: MinimapProps): JSX.Element;
```

라인 패턴(`Record<RouteKey, string[]>`)은 내부 상수. 인터랙션 없음.

### 3-12. `StatusBar.tsx`

```ts
export interface StatusBarProps {
  currentRoute: RouteKey;
  isLoggedIn: boolean;
  user: SessionUser | null;
  onOpenPalette: () => void;
  className?: string;
}

export function StatusBar(props: StatusBarProps): JSX.Element;
```

라우트 → 라벨 매핑(`Record<RouteKey, string>`)과 "한국어"·"정상" 등은 내부 상수.

### 3-13. `CommandPalette/index.tsx`

```ts
export interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette(props: CommandPaletteProps): JSX.Element | null;
```

내부에서 `usePaletteCommands(query)`로 항목 빌드. `open=false` 면 `null` 반환(프로토타입과 동일).

### 3-14. `CommandPalette/PaletteList.tsx`

```ts
export interface PaletteListProps {
  items: PaletteItem[];
  selectedIndex: number;
  onHover: (index: number) => void;
  onRun: (index: number) => void;
}

export function PaletteList(props: PaletteListProps): JSX.Element;
```

빈 결과("검색 결과가 없습니다") 처리는 이 컴포넌트 책임.

### 3-15. `CommandPalette/usePaletteCommands.ts`

```ts
export interface UsePaletteCommandsResult {
  items: PaletteItem[];
  loading: boolean;
}

/**
 * 정적 명령(라우트 6개 + 테마 + 로그인/로그아웃) + 이벤트 검색 결과를 합쳐 반환.
 * query 가 비면 정적 명령만, 비어 있지 않으면 이벤트 API 검색 결과 머지.
 */
export function usePaletteCommands(query: string): UsePaletteCommandsResult;
```

### 3-16. `hooks/useGlobalShortcuts.ts`

```ts
export interface UseGlobalShortcutsOptions {
  isLoggedIn: boolean;
  onOpenPalette: () => void;
  onClosePalette: () => void;
  onFocusSearch: () => void;
  onNavigate: NavigateFn;
  /** 페이지에서 카드 포커스 이동(j/k) 을 지원할 때만 주입 */
  onCardNav?: (delta: 1 | -1) => void;
  /** 현재 포커스된 카드 열기(Enter) — 미지정 시 무동작 */
  onCardOpen?: () => void;
}

export function useGlobalShortcuts(opts: UseGlobalShortcutsOptions): void;
```

`document.addEventListener('keydown', ...)` 를 `useEffect`로 등록/해제. 입력 필드(`INPUT`/`TEXTAREA`/`contentEditable`) 안에서는 ⌘K/Esc 만 처리.

### 3-17. props 패턴 요약

| 카테고리 | prop 패턴 |
|---|---|
| 라우트 | `currentRoute: RouteKey` (읽기) / `onNavigate: NavigateFn` (쓰기) |
| 인증 | `isLoggedIn: boolean` + `user: SessionUser \| null` |
| 토글 상태 | `open: boolean` + `onToggle: () => void` (controlled) |
| 카운트/배지 | `cartCount: number`, `totalEventCount: number`, `categories: CategoryCount[]` |
| 콜백 | `onSelect`, `onClose`, `onOpenPalette`, `onToggleTheme`, `onSelectEvent`, `onRun`, `onHover` |
| 표준 | `className?: string` (Layout 제외 전 컴포넌트). `children` 은 `Layout` 만 받음 |
| 기본값 | 없음(모두 필수) — 옵셔널은 `onClose`(TabBar), `onCardNav`/`onCardOpen`(shortcuts), `badge`(ActivityItem), `shortcut`(PaletteItem), `className` 만 |


## 4. 데이터 의존성 (라우터, 인증, 테마)

INVENTORY.md §4·§5 와 `src/contexts/` 실제 파일 기준. 기존 자산(✅ 재사용) / 신규 작성(🆕) 표기.

### 4-1. 라우터

**자산** — INVENTORY §5 라우팅: `react-router-dom` v6.22.3, 라우트 정의는 `src/App.tsx`.

| 용도 | API | 위치 | 비고 |
|---|---|---|---|
| ✅ 현재 경로 인지 | `useLocation()` → `pathname` | `react-router-dom` | Layout 내부에서 `pathname` → `RouteKey` 매핑 |
| ✅ 라우트 이동 | `useNavigate()` | `react-router-dom` | `NavigateFn` 어댑터로 래핑하여 sub 컴포넌트에 주입 |
| ✅ children 슬롯 | `<Outlet />` | `react-router-dom` | `Layout` 의 `editor` grid-area 내부 |
| 🆕 pathname → RouteKey 매핑 | `routeFromPath(pathname): RouteKey` | `Layout/utils.ts` (신규) | `/` → `home` (Landing 도입 후) 또는 `events`, `/events/:id` → `detail`, `/cart` → `cart`, `/mypage` → `mypage`, `/login` → `login`. 미매칭은 `home`. **Landing 라우트 정책 의존** (SPEC §9 보류) |
| 🆕 RouteKey + params → path | `pathFromRoute(key, params): string` | `Layout/utils.ts` (신규) | `nav('detail', { id })` → `/events/${id}`, `nav('events', { category })` → `/events?category=${category}` 등 |

**라우트 정보가 필요한 컴포넌트** (§3 props 기준):

| 컴포넌트 | 사용 |
|---|---|
| `ActivityBar` | `currentRoute` 로 active 아이콘 표시. `events` ↔ `detail` 은 같은 묶음으로 active |
| `Sidebar` / `SidebarMenu` | `currentRoute` active 표시 (좌측 보더 + bg). 메뉴 트리 항목별 비교 |
| `TabBar` | `activeKey` 로 상단 인디케이터 |
| `Minimap` | `route` 로 syntax 패턴 선택 |
| `StatusBar` | `currentRoute` 로 라벨 표시 ("이벤트 목록", "장바구니" 등) |
| `useGlobalShortcuts` | `g h/e/c/m` 시퀀스로 `onNavigate` 호출 |
| `usePaletteCommands` | 정적 명령의 `action: () => navigate(...)` |

**Active 표시 로직**:
- `ActivityBar`: `events` 항목은 `currentRoute ∈ {'events','detail'}` 일 때 active (Layout.jsx:30 동일)
- `Sidebar`: 단순 1:1 비교. 카테고리 클릭(`onNavigate('events', { category })`)은 active 판정에 영향 없음(`events` active 만 유지)
- `TabBar`: `activeKey === t.key` 단순 비교. 6개 탭 항상 표시 (프로토타입과 동일 — 고정 라우트 셋)

### 4-2. 인증

**자산** — INVENTORY §4 + 실제 파일(`src/contexts/AuthContext.tsx`).

| 용도 | API | 위치 | 형태 |
|---|---|---|---|
| ✅ 로그인 상태 | `useAuth()` → `isLoggedIn: boolean` | `src/contexts/AuthContext.tsx` | Provider 는 `src/main.tsx` 에 마운트됨 |
| ✅ 사용자 정보 | `useAuth()` → `user: GetProfileResponse \| null` | 동일 | 닉네임은 `user.nickname` 사용 (SidebarSession, StatusBar) |
| ✅ 로딩 상태 | `useAuth()` → `isLoading: boolean` | 동일 | 초기 마운트 동안 `<Loading fullscreen />` 처리는 라우트 가드 책임 — Layout 은 이미 가드 통과 후 렌더되므로 별도 처리 불필요 |
| ✅ 로그아웃 | `useAuth()` → `logout(): void` | 동일 | 토큰 3종 제거 + 상태 초기화. CommandPalette "로그아웃" 항목에서 호출 |
| ✅ 로그인 가드 | `<RequireAuth>` (`src/App.tsx:48`) | 라우트 단 | Layout 내부에서 가드 다시 작성하지 않음. Layout 은 비인증 라우트(`/`, `/events/:id`, `/login`)에서도 렌더되므로 `isLoggedIn=false` 케이스를 항상 지원해야 함 |

**로그인 / 비로그인 표시 차이**:

| 컴포넌트 | 비로그인 | 로그인 |
|---|---|---|
| `ActivityBar` | `cart` / `mypage` 클릭 → `nav('login')` 가드. 카트 배지 미표시(카운트=0) | 정상 nav. 카트 배지 표시 |
| `SidebarMenu` | 메뉴 트리에 "로그인" 항목 추가(맨 아래). `cart`/`mypage` 클릭 → `nav('login')` | "로그인" 항목 숨김. `cart`/`mypage` 정상 nav |
| `SidebarSession` | 섹션 자체 미렌더 | 닉네임 + ● 온라인 표시 |
| `StatusBar` | 우측에 "비회원" 텍스트 | "${nickname} 님" 표시 |
| `CommandPalette` | "로그인" 항목 표시. `cart`/`mypage` 검색 → 클릭 시 login 으로 가드 | "로그아웃" 항목 표시. `cart`/`mypage` 정상 이동 |

**isLoggedIn 이 필요한 컴포넌트**: `Layout`(prop drilling 진원지), `ActivityBar`, `Sidebar`, `SidebarMenu`, `SidebarSession`(렌더 게이트), `StatusBar`, `CommandPalette`/`usePaletteCommands`, `useGlobalShortcuts` (g c / g m 시퀀스 가드).

### 4-3. 테마

**자산** — `src/contexts/ThemeContext.tsx` 실제 시그니처:

```ts
type Theme = 'light' | 'dark' | 'system';
interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';   // 'system' 해석 결과
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
}
export function useTheme(): ThemeContextValue;
```

- Provider 는 `src/main.tsx` 에서 앱 루트에 마운트(예상). `data-theme` 속성을 `document.documentElement` 에 자동 부착(L21) → `ide-theme.css`의 `[data-theme="dark"]` 셀렉터가 자동 동작.
- 영속화 키: `'devticket-theme'` (`STORAGE_KEY`).

**Layout 에서의 사용**:

| 위치 | 사용 |
|---|---|
| `Layout` (index.tsx) | `useTheme()` → `resolvedTheme` 을 `TitleBar` 에 prop 전달 (sun/moon 아이콘 분기). `toggleTheme` 은 `LayoutChromeProvider` 의 `onToggleTheme` 으로 주입 |
| `TitleBar` | `theme: ThemeMode` prop (`'light'\|'dark'`) — 아이콘 분기. **`'system'`은 도달하지 않음** (`resolvedTheme` 만 받기 때문) |
| `LayoutChromeContext` | `toggleTheme()` 을 `ChromeContextValue.toggleTheme` 으로 노출 → `CommandPalette` "테마 전환" 명령에서 호출 |

**테마 토글 버튼 위치** — 프로토타입과 동일하게 **TitleBar 우측 끝** 1곳. 추가 토글 버튼은 두지 않음 (ActivityBar/StatusBar 에는 없음). CommandPalette 의 "테마 전환" 명령이 두 번째 진입점.

**3-state(`'system'`) 처리**:
- `TitleBar` 는 `resolvedTheme` 만 받으므로 `'light'\|'dark'` 만 보임 — 아이콘 표시 일관성 확보.
- `setTheme('system')` UI는 Layout 책임 아님 (마이페이지 설정 등에 위임). Layout 의 토글 버튼은 `toggleTheme()` 만 호출.

### 4-4. 기타

**카트 카운트** — 🆕 **신규 컨텍스트 필요**.

INVENTORY §5: 기존 코드에 `CartContext` / `CartProvider` / `useCart` **없음**(grep 결과 0건). 카트는 페이지(`Cart.tsx`) 안에서만 `getCart()` 호출. ActivityBar 배지를 위해 전역 카트 카운트가 필요하므로 신규 작성.

| 항목 | 설계 | 위치 |
|---|---|---|
| 🆕 `CartContext` | `{ count: number, refresh: () => Promise<void>, isLoading: boolean }` | `src/contexts/CartContext.tsx` (v2 규칙: 재사용 가능한 전역 상태이므로 `contexts-v2/` 가 아닌 `contexts/` 가 자연스럽지만, **기존 폴더 수정 금지 절대 규칙**(CLAUDE.md)에 따라 `src/contexts-v2/CartContext.tsx` 로 신설 — Layout 작업과 분리된 별도 PR 권장) |
| 🆕 `useCart()` | `useContext(CartContext)` | 동일 |
| `CartProvider` 위치 | `<AuthProvider>` 내부, `<ThemeProvider>` 와 형제 (또는 안쪽) | `src/main.tsx` 추가 마운트 |
| 데이터 소스 | `cart.api` `getCart()` → `response.items.length` (또는 `quantity` 합) | INVENTORY §2 |
| 갱신 트리거 | (a) `isLoggedIn` true 전이 시 1회 (b) Cart 페이지에서 `addCartItem`/`clearCart` 후 명시적 `refresh()` (c) 페이지 라우트 진입 시 옵션 |
| 비로그인 시 | `count = 0`, API 호출 안 함 |  |

**대안** (Layout PR 단독으로 진행하고 싶을 때): Layout 안에서 직접 `getCart()` 호출하는 `useCartCount()` 훅을 `Layout/hooks/useCartCount.ts` 로 작성. 단점은 카트 페이지에서 추가/비우기 직후 카운트가 즉시 반영되지 않음(라우트 변경 시점에만 갱신). 1차에는 이 방식으로 가고, 후속 PR에서 `CartContext` 로 격상 권장.

**알림 / Toast** — INVENTORY §5 에 `ToastContext` 존재 명시.

| 항목 | 위치 | Layout 사용 |
|---|---|---|
| ✅ `useToast()` | `src/contexts/ToastContext.tsx` | Layout 본체는 직접 사용하지 않음. 단 `LayoutChromeContext.logout()` 후 안내 토스트, CommandPalette "테마 전환" 후 안내 토스트 등 향후 hook 내부에서 호출할 여지만 명시 |

**Icon / fmtDate** — 프로토타입의 `window.Icon` / `window.fmtDate` 대체.

| 항목 | 처리 |
|---|---|
| 🆕 `Icon` 컴포넌트 | `src/components-v2/Icon/index.tsx` (이 plan 의 §7 `prerequisite`. Layout 작업 직전 PR로 분리). 프로토타입 `common.jsx` 의 Icon 셋을 SVG 컴포넌트로 이식 |
| 🆕 `fmtDate(iso): string` | `src/utils-v2/format.ts` (단일 함수). `SidebarUpcoming` 의 `dateText` 는 어댑터 단에서 미리 포맷하여 VM에 박는 것이 §0 규칙(adapters → VM)에 부합 — Layout 안에서 fmtDate 직접 호출 안 함 |

### 4-5. 의존성 요약

| 자원 | 종류 | 위치 | Layout 사용처 |
|---|---|---|---|
| ✅ `useLocation` / `useNavigate` / `Outlet` | 라이브러리 | `react-router-dom` | `Layout` |
| ✅ `useAuth` | 기존 컨텍스트 | `src/contexts/AuthContext.tsx` | `Layout` (→ sub 에 prop 주입) |
| ✅ `useTheme` | 기존 컨텍스트 | `src/contexts/ThemeContext.tsx` | `Layout` |
| ✅ `useToast` | 기존 컨텍스트 | `src/contexts/ToastContext.tsx` | (선택) `LayoutChromeProvider` 내부 |
| 🆕 `LayoutChromeContext` / `useChrome` | 신규 컨텍스트 | `src/components-v2/Layout/LayoutChromeContext.tsx` | `Layout` 내부에 한정 — 외부 페이지 노출 X |
| 🆕 `useCartCount` (1차) → `CartContext` (후속) | 신규 훅/컨텍스트 | `Layout/hooks/useCartCount.ts` → `src/contexts-v2/CartContext.tsx` | `Layout` |
| 🆕 `routeFromPath` / `pathFromRoute` | 신규 유틸 | `Layout/utils.ts` | `Layout` |
| 🆕 `Icon` | 신규 공용 컴포넌트 | `src/components-v2/Icon/` | 거의 모든 sub 컴포넌트 (사전 PR로 분리) |
| 🆕 어댑터 (categories, upcoming) | 신규 | `Layout/adapters.ts` 또는 페이지 어댑터 | `Sidebar` 입력 — `getEvents()` → `CategoryCount[]` + `UpcomingEventVM[]` |


## 5. ide-chrome.css 토큰 및 클래스 목록

기준: tokens.plan.md §4 에서 결정된 **시나리오 A — 단일 tokens.css 에 IDE 전용 토큰 22개 포함**. `ide-chrome.css` 는 토큰 소비자이며, Layout chrome 전용 클래스만 정의.

위치: `src/styles-v2/components/ide-chrome.css`. 앱 진입에서 `tokens.css → global.css → ide-chrome.css` 순서로 import.

### 5-1. 토큰

**ide-chrome.css 에 들어가는 글로벌 토큰: 없음.** (모든 IDE 토큰은 tokens.css — tokens.plan §4-4 결정)

다만 Layout chrome 내부에서만 의미 있는 **로컬 사이즈 변수**는 `.ide` 룰에 스코프 한정으로 둔다(전역 토큰으로 승격하지 않음 — 다른 페이지에서 참조할 일 없음).

| 로컬 변수 | 값 | 용도 |
|---|---|---|
| `--ide-titlebar-h` | `36px` | grid-template-rows 1행 |
| `--ide-tabs-h` | `34px` | grid-template-rows 2행 |
| `--ide-status-h` | `24px` | grid-template-rows 4행 |
| `--ide-activity-w` | `48px` | grid-template-columns 1열 |
| `--ide-sidebar-w` | `220px` | grid-template-columns 2열 |
| `--ide-minimap-w` | `60px` | grid-template-columns 4열 |

```css
.ide {
  --ide-titlebar-h: 36px;
  --ide-tabs-h: 34px;
  --ide-status-h: 24px;
  --ide-activity-w: 48px;
  --ide-sidebar-w: 220px;
  --ide-minimap-w: 60px;
  grid-template-rows: var(--ide-titlebar-h) var(--ide-tabs-h) 1fr var(--ide-status-h);
  grid-template-columns: var(--ide-activity-w) var(--ide-sidebar-w) 1fr var(--ide-minimap-w);
  /* ... */
}
```

ide-chrome.css 가 **소비**하는 tokens.css 토큰(요약):
- IDE 전용: `--chrome`, `--chrome-2`, `--editor-bg`, `--editor-line`, `--sidebar-bg`, `--minimap-bg`, `--status-bg`, `--status-text`, `--term-green`, `--syn-keyword`, `--syn-string`, `--syn-fn`, `--syn-comment`
- 공통: `--brand`, `--brand-light`, `--border`, `--surface`, `--surface-2`, `--surface-3`, `--text`, `--text-2`, `--text-3`, `--text-4`, `--font`, `--font-mono`

### 5-2. 컴포넌트 클래스

§2 의 컴포넌트 ↔ §1-4 의 클래스 맵을 1:1 매핑.

| 클래스 | 사용 컴포넌트 | 출처 (ide-theme.css) | 비고 |
|---|---|---|---|
| `.ide` | `Layout` (index.tsx) | L98-117 | 그리드 컨테이너. grid-template-areas 포함 |
| `.ide-title` | `TitleBar` | L120-131 | grid-area: title |
| `.traffic`, `.tc-red`, `.tc-yellow`, `.tc-green` | `TitleBar` | L132-139 | macOS 트래픽 라이트 |
| `.title-text` | `TitleBar` | L140-147 | 중앙 서비스명 |
| `.title-cmd`, `.title-cmd:hover`, `.title-cmd kbd` | `TitleBar` | L148-171 | ⌘K 검색 박스 |
| `.ide-activity` | `ActivityBar` | L174-182 | grid-area: act |
| `.act-btn`, `.act-btn:hover`, `.act-btn.active`, `.act-btn svg` | `ActivityBar`, `TitleBar` (테마 토글에서도 재사용) | L183-196 | active 시 좌측 brand 보더 |
| `.act-badge` | `ActivityBar` | L197-209 | 카트 카운트 |
| `.act-spacer` | `ActivityBar` | L210 | 설정 버튼 하단 푸시 |
| `.ide-sidebar` | `Sidebar` | L213-218 | grid-area: side |
| `.side-header` | `Sidebar/SidebarMenu`, `Sidebar/SidebarUpcoming`, `Sidebar/SidebarSession` | L219-228 | 섹션 제목 + 토글 |
| `.side-group` | 동일 3개 | L229 | 섹션 본문 컨테이너 |
| `.side-item`, `.side-item:hover`, `.side-item.active`, `.side-item .tri`, `.side-item .fi` | `SidebarMenu`, `SidebarUpcoming`, `SidebarSession` | L230-254 | 메뉴/이벤트/세션 행 공용 |
| `.side-count` | `SidebarMenu` | L255-263 | 카테고리/총개수 배지 |
| `.side-nested` | `SidebarMenu` | L264 | 카테고리 들여쓰기 (현재 프로토타입은 인라인 padding-left 28px 사용 — v2 에서 이 클래스로 이전) |
| `.ide-tabs`, `.ide-tabs::-webkit-scrollbar` | `TabBar` | L267-275 | grid-area: tabs |
| `.tab`, `.tab:hover`, `.tab.active`, `.tab.active::before`, `.tab .fi`, `.tab .close`, `.tab:hover .close`, `.tab .close:hover` | `TabBar` | L276-312 | active 시 상단 brand 인디케이터 |
| `.tab .dot`, `.tab .dot.modified` | `TabBar` (선택) | L313-318 | **현재 미사용 — 수정됨 마커 도입 시 활성화. 우선 포함 (마크업만 추가하면 동작)** |
| `.ide-editor`, `.ide-editor::-webkit-scrollbar`, `.ide-editor::-webkit-scrollbar-track`, `.ide-editor::-webkit-scrollbar-thumb`, `.ide-editor::-webkit-scrollbar-thumb:hover` | `Layout` (children 슬롯) | L115, L321, L635-645 | overflow auto + 커스텀 스크롤바 |
| `.ide-minimap` | `Minimap` | L374-380 | grid-area: mini |
| `.mini-line`, `.mini-line.kw`, `.mini-line.fn`, `.mini-line.str`, `.mini-line.cmt` | `Minimap` | L381-391 | syntax 흉내 라인 |
| `.mini-window` | `Minimap` | L392-401 | viewport 표시 박스 |
| `.ide-status` | `StatusBar` | L404-413 | grid-area: status |
| `.status-item`, `.status-item.clickable`, `.status-item.clickable:hover`, `.status-item svg` | `StatusBar` | L414-422 | 좌/우 항목 공용 |
| `.status-spacer` | `StatusBar` | L424 | 좌-우 분리 |
| `.status-item.term-ok` | `StatusBar` | L425 | "● 정상" 인디케이터 |
| `.palette-backdrop` | `CommandPalette` | L648-657 | fixed 오버레이 |
| `.palette` | `CommandPalette` | L658-667 | 560px 박스 |
| `.palette-input`, `.palette-input::placeholder` | `CommandPalette` | L668-676 | 검색 입력 |
| `.palette-list` | `CommandPalette/PaletteList` | L677 | max-height + scroll |
| `.palette-item`, `.palette-item:hover`, `.palette-item.sel`, `[data-theme="dark"] .palette-item:hover`, `[data-theme="dark"] .palette-item.sel`, `.palette-item .fi`, `.palette-item .shortcut` | `PaletteList` | L678-698 | 항목 행 |
| `.palette-hint`, `.palette-hint kbd` | `CommandPalette` | L699-713 | 푸터 힌트 |
| `.ide-sidebar::-webkit-scrollbar`, `.ide-sidebar::-webkit-scrollbar-track`, `.ide-sidebar::-webkit-scrollbar-thumb`, `.ide-sidebar::-webkit-scrollbar-thumb:hover` | `Sidebar` | L636-645 | 사이드바 스크롤바 |

### 5-3. 유틸 클래스

Layout chrome 안에서 사용하는 작은 유틸. ide-chrome.css 안에 둘지(스코프 좁힘) global.css 로 옮길지 정리.

| 클래스 | 출처 | 사용처 | 배치 결정 |
|---|---|---|---|
| `.truncate` | L747 | `PaletteList` (이벤트 항목 라벨), 향후 `Sidebar` 긴 제목 | **global.css** (다른 페이지/카드에서도 광범위 사용 예상). ide-chrome.css 는 사용만 |
| `.kbd` (스탠드얼론 클래스) | L748-759 | Layout 안에서는 **사용 안 함** — Layout 은 모두 `<kbd>` 엘리먼트의 nested 셀렉터(`.title-cmd kbd`, `.palette-hint kbd`, `.status-item kbd`)로 처리 | **global.css** (다른 페이지에서 키보드 가이드 표시 시 재사용) |
| `.mono` | L760 | Layout 직접 사용 없음 (모든 영역이 이미 `font-family` 명시) | **global.css** |
| `.sans` | L761 | `TitleBar` (`.title-text` 가 직접 명시 — 사용 안 함). 다른 페이지 본문에서 활용 | **global.css** |

→ ide-chrome.css 는 **유틸 클래스를 정의하지 않음**. 위 4개는 모두 global.css 로 분리.

### 5-4. 애니메이션 / keyframes

| 항목 | 출처 | 처리 |
|---|---|---|
| `@keyframes caret-blink` | L371 | **제외** (Layout 사용 안 함 — `.caret` 는 페이지 본문/터미널 블록 책임) |
| `transition: color 0.12s` 등 인라인 transition | L188, L238, L287, L418, L472 등 | ide-chrome.css 에 그대로 포함 (keyframes 아님, 룰셋에 직접 기술) |
| `.mini-window { transition: top 0.2s; }` | L401 | 포함. (현 시점 viewport 위치 갱신은 미구현이지만 클래스만 유지) |

→ ide-chrome.css 에 별도 `@keyframes` 블록 없음.

### 5-5. 반응형

```css
@media (max-width: 960px) {
  .ide { grid-template-columns: var(--ide-activity-w) 0 1fr 0; }
  .ide-sidebar, .ide-minimap { display: none; }
}
```

ide-theme.css L802-805 그대로 ide-chrome.css 로 이전. 추가 브레이크포인트는 §6 에서 다룸.

### 5-6. 제외 — ide-theme.css 에는 있지만 ide-chrome.css 에 안 들어가는 것

Layout chrome 책임이 아닌 클래스. **각 페이지/공용 컴포넌트의 별도 CSS 파일**(`src/styles-v2/components/<name>.css` 또는 컴포넌트 폴더 내)에 분리.

| 그룹 | 클래스 | 출처 | 어디로 이전 |
|---|---|---|---|
| 라인 거터 (페이지 본문) | `.editor-scroll`, `.gutter`, `.gutter .ln`, `.gutter .ln.active` | L322-339 | 페이지 측 또는 `code-block.css` 등 |
| 에디터 본문 | `.editor-body` | L341-347 | 페이지 측 |
| Syntax 하이라이팅 | `.sk`, `.ss`, `.sn`, `.sf`, `.sp`, `.sc`, `.spu`, `.st`, `.stg` | L350-358 | `syntax.css` (페이지 본문 공용) |
| 캐럿 | `.caret`, `.caret.term`, `@keyframes caret-blink` | L361-371 | Landing TypedTerminal 컴포넌트 |
| 터미널 블록 | `.terminal`, `.term-header`, `.term-body`, `.term-prompt`, `.term-cmd`, `.term-flag`, `.term-value`, `.term-out`, `.term-ok`(블록 내부), `.term-path`, `[data-theme="dark"] .terminal`, `[data-theme="dark"] .term-header`, `[data-theme="dark"] .term-body`, `[data-theme="dark"] .term-cmd`, `[data-theme="dark"] .term-out` | L428-461 | Landing 또는 `terminal.css`. **주의**: `.term-ok` 셀렉터는 ide-chrome.css 의 `.status-item.term-ok` 와 이름이 같음 — 이전 시 충돌하지 않도록 컨텍스트(`.terminal .term-ok`)로 한정 |
| JSON 카드 | `.json-card`, `.json-card:hover`, `.json-card-head`, `.json-card-head .fi`, `.json-card-body`, `.json-card-body .row`, `.row .key`, `.row .value`, `.row .num`, `.row .kw`, `.json-card-body .title`, `.json-card-line`, `[data-theme="dark"] .json-card-head`, `[data-theme="dark"] .json-card:hover` | L464-512 | `json-card.css` (이벤트 리스트/상세 공용) |
| 상태 칩 | `.status-chip`, `.status-chip.ok`, `.status-chip.sold`, `.status-chip.free`, `.status-chip.end`, `.status-chip .dot`, `[data-theme="dark"] .status-chip.ok/.sold/.end` | L514-532 | `status-chip.css` |
| 버튼 | `.btn`, `.btn:active`, `.btn:disabled`, `.btn-primary`, `.btn-primary:hover`, `.btn-term`, `.btn-term:hover`, `.btn-ghost`, `.btn-ghost:hover`, `.btn-lg`, `.btn-sm`, `.btn-full`, `[data-theme="dark"] .btn-term` | L535-571 | `button.css` (전역 공용) |
| 코드 입력 | `.code-input`, `.code-input:focus-within`, `.code-input .prompt`, `.code-input input`, `.code-input input::placeholder`, `.code-input kbd` | L574-607 | `code-input.css` (검색 입력 공용) |
| 칩/태그 | `.chip`, `.chip:hover`, `.chip.active`, `[data-theme="dark"] .chip.active` | L610-632 | `chip.css` (카테고리/필터 공용) |
| 스택 트레이스 | `.stack-trace`, `.stack-trace .err-title`, `.err-msg`, `.at`, `.file`, `.line-col`, `.hint` | L716-744 | `stack-trace.css` (에러/빈 상태) |
| 평면 카드 | `.flat-card` | L764-769 | `card.css` |
| 폼 | `.form-row`, `.form-row label`, `.form-row .input`, `.form-row .input:focus-within`, `.form-row .input .quote`, `.form-row .input input`, `.form-row .input input::placeholder`, `.form-row .err` | L772-799 | `form.css` (Login/Signup/MyPage 공용) |

**이전은 본 plan 범위 아님** — Layout chrome PR 에서는 ide-chrome.css 만 신설하고, 위 그룹들은 각 페이지 PR 진입 시점에 해당 페이지에서 분리 작성. ide-theme.css 원본은 v2 빌드에 포함하지 않음 (프로토타입 전용).

### 5-7. 다크 오버라이드

ide-chrome.css 안에 `[data-theme="dark"]` 추가 룰이 필요한 항목:

| 셀렉터 | 출처 | 이유 |
|---|---|---|
| `[data-theme="dark"] .palette-item:hover, [data-theme="dark"] .palette-item.sel { color: #C7D2FE; }` | L690-692 | 다크 모드에서 brand-light 위 텍스트 가독성 보정 |

그 외 IDE 전용 토큰의 다크 값은 모두 `tokens.css` 의 `[data-theme="dark"]` 블록에서 처리되므로(tokens.plan §5), ide-chrome.css 에는 위 1건만.


## 6. 반응형 / 다크모드 / 접근성

### 6-1. 반응형 분기점

프로토타입은 `@media (max-width: 960px)` 단일 브레이크 (ide-theme.css:802-805). v2 도 단순 유지하되, 미니맵 분기를 1280px 로 한 단계 더 두는 것을 권장.

| 분기점 | 영역 | 그리드 |
|---|---|---|
| **데스크탑** ≥ 1280px | 풀 chrome | `48px 220px 1fr 60px` (4열, 프로토타입 기본값) |
| **태블릿** 960px ~ 1279px | 미니맵 숨김 | `48px 220px 1fr 0` (3열 + 0열) |
| **모바일** < 960px | 사이드바 + 미니맵 숨김 | `48px 0 1fr 0` (1열 + 0 + 1열 + 0) |

미디어 쿼리는 `ide-chrome.css` 안에 다음 형태:

```css
@media (max-width: 1279px) {
  .ide { grid-template-columns: var(--ide-activity-w) var(--ide-sidebar-w) 1fr 0; }
  .ide-minimap { display: none; }
}
@media (max-width: 959px) {
  .ide { grid-template-columns: var(--ide-activity-w) 0 1fr 0; }
  .ide-sidebar { display: none; }
  /* TitleBar 의 검색 박스(.title-cmd)는 좁은 화면에서 숨김 */
  .title-cmd { display: none; }
}
```

### 6-2. 모바일 동작 (< 960px)

**채택안: 사이드바 / 미니맵 / 타이틀 검색 박스 숨김. 햄버거 / Drawer 도입 안 함.**

- ActivityBar(48px) 는 유지 — 이게 모바일에서의 주 네비. 검색 아이콘은 그대로 ⌘K 팔레트 오픈.
- 사이드바의 카테고리 / 다가오는 이벤트 / 세션 정보는 모바일에서는 **EventList 페이지 자체의 필터/리스트**가 대체 역할 수행 (사이드바 햄버거를 따로 만들지 않음).
- TitleBar 의 트래픽 라이트 + 서비스명은 유지(`.title-text` 가 flex:1 로 자동 축소).
- TabBar 는 가로 스크롤 가능(이미 ide-theme.css L271-273 `overflow-x: auto` + 스크롤바 숨김).
- StatusBar 는 유지하되, 좁아질 때 `.status-spacer` 가 자동으로 좌우 항목 분리.

**향후 확장 여지** (이번 PR 범위 아님): 모바일 햄버거 → 사이드바 Drawer. ActivityBar 의 좌측에 햄버거 버튼을 추가하고 `<Sidebar>` 를 fixed overlay 로 띄우는 변형. 본 plan 1차에는 미포함.

### 6-3. 태블릿 동작 (960px ~ 1279px)

**채택안: 미니맵만 숨김, 나머지는 데스크탑과 동일.**

- 사이드바(220px) 유지 — 태블릿 가로폭에서도 220px 는 12~17% 비중이라 무리 없음.
- 미니맵(60px)은 가독성 기여가 낮으므로 숨김 (그리드 4열 → 3열 + 0).
- 사이드바를 더 좁히거나 아이콘만 표시하는 변형은 도입 안 함 (구현 복잡도 대비 이득 작음).

### 6-4. 다크모드

**기본: 토큰 자동 적용.** `ThemeContext` 가 `document.documentElement` 에 `data-theme="dark"` 부착(§4-3) → tokens.css 의 `[data-theme="dark"]` 블록이 IDE 토큰 22개를 모두 다크 값으로 스왑(tokens.plan §4-0). ide-chrome.css 의 거의 모든 룰은 토큰만 참조하므로 **추가 처리 불필요**.

**별도 처리 필요한 영역**:

| 영역 | 처리 | 근거 |
|---|---|---|
| `[data-theme="dark"] .palette-item:hover, [data-theme="dark"] .palette-item.sel { color: #C7D2FE; }` | ide-chrome.css 에 명시 (§5-7) | 다크 brand-light 위 텍스트 가독성 보정 |
| TitleBar 테마 토글 아이콘 | `theme === 'dark' ? 'sun' : 'moon'` (Layout.jsx:20) — `TitleBar` 가 `resolvedTheme: 'light' \| 'dark'` 를 받아 분기 | `'system'` 미도달 보장 (§4-3) |
| 트래픽 라이트 색 (`#FF5F57`, `#FEBC2E`, `#28C840`) | **모드별 동일 — 의도된 하드코딩** (macOS 마이메틱) | 토큰화 안 함 |
| 활성 라인 하이라이트 `--editor-line` | 라이트 `rgba(79,70,229,0.04)` ↔ 다크 `rgba(255,255,255,0.035)` | tokens.css 가 처리 |
| 스크롤바 thumb (`var(--surface-3)`) | 토큰으로 자동 처리 | — |

**토큰 미사용 검증**: ide-chrome.css 작성 시 grep `#[0-9A-Fa-f]{3,8}` 로 색 리터럴 검출 → 트래픽 라이트 3색만 남는 것이 정상.

### 6-5. 키보드 네비게이션

**전역 단축키** (`useGlobalShortcuts`, §3-16):

| 키 | 동작 | 입력 필드 안 |
|---|---|---|
| `⌘K` / `Ctrl+K` | 팔레트 오픈 | 동작 |
| `Esc` | 팔레트 닫기 | 동작 |
| `/` | TitleBar 검색 박스 포커스(`focusSearch`) | 무시 |
| `g h` / `g e` / `g c` / `g m` | 라우트 이동 (`c`/`m` 은 미인증 시 `login`) | 무시 |
| `j` / `k` | 카드 포커스 이동(`onCardNav`, 페이지 옵트인) | 무시 |
| `Enter` | 현재 카드 열기(`onCardOpen`, 페이지 옵트인) | 무시 |

**팔레트 내부 키**: `↑` / `↓` 항목 이동, `Enter` 실행, `Esc` 닫기 (§1-3).

**포커스 순서 (Tab)**:

```
1. TitleBar      .title-cmd (검색 박스)
2. TitleBar      테마 토글 버튼
3. ActivityBar   home → events → search → cart → mypage → settings (위→아래)
4. Sidebar       메뉴 헤더(토글) → 메뉴 항목들 → 다가오는 헤더(토글) → 다가오는 항목들 → (세션 — 비대화형)
5. TabBar        탭들 (왼쪽→오른쪽), 각 탭 안에서 close 버튼
6. Editor        children 콘텐츠 (페이지 책임)
7. Minimap       포커스 받지 않음 (tabindex 미부여)
8. StatusBar     git/DevTicket → ⌘K 트리거 (clickable 만)
```

`tabindex` 직접 설정은 사용 안 함 (DOM 순서 = 그리드 영역 순서로 자연스럽게 매칭). 단 `.ide-editor` 는 `tabindex="-1"` 로 두어 라우트 변경 시 프로그램적 포커스 이동(스킵 링크용)을 허용.

**스킵 링크**: `Layout` 첫 자식으로 `<a className="skip-link" href="#ide-editor">본문으로 건너뛰기</a>` 추가. 평소 `clip-path: inset(50%)` 로 숨김, 포커스 시 노출. ide-chrome.css 에 `.skip-link` / `.skip-link:focus` 룰 추가.

**클릭 가능 요소는 모두 `<button>`**: 프로토타입의 `<div onClick>` (`.side-item`, `.title-cmd`, `.status-item.clickable` 등)은 v2 에서 `<button type="button">` 으로 변환. 이미 `<button>` 인 `.act-btn`, `.tab` 은 그대로.

### 6-6. 스크린리더 / ARIA

**랜드마크 구조**:

```tsx
<div className="ide" role="application" aria-label="DevTicket">
  <header className="ide-title" role="banner">
    {/* traffic lights — 장식 */}
    <div className="traffic" aria-hidden="true">…</div>
    <h1 className="title-text">DevTicket · 개발자를 위한 이벤트 티켓</h1>
    <button className="title-cmd" aria-label="명령 팔레트 열기 (⌘K)">…</button>
    <button className="act-btn" aria-label="테마 전환">…</button>
  </header>

  <nav className="ide-activity" aria-label="주요 메뉴">
    <button aria-label="홈" aria-current={isHome ? 'page' : undefined}>…</button>
    {/* … */}
  </nav>

  <aside className="ide-sidebar" aria-label="사이드 네비게이션">
    <h2 className="side-header">
      <button aria-expanded={menuOpen} aria-controls="side-menu">메뉴</button>
    </h2>
    <ul id="side-menu" className="side-group" role="list">…</ul>
    {/* 다가오는 이벤트 / 세션 동일 패턴 */}
  </aside>

  <div className="ide-tabs" role="tablist" aria-label="열린 페이지">
    <button role="tab" aria-selected={active} aria-controls="ide-editor">…</button>
  </div>

  <main className="ide-editor" id="ide-editor" role="main" tabIndex={-1}>
    <Outlet />
  </main>

  <div className="ide-minimap" aria-hidden="true">…</div>

  <footer className="ide-status" role="contentinfo">
    <button className="status-item clickable" aria-label="명령 팔레트 열기">…</button>
  </footer>

  {/* CommandPalette 는 별도 — 6-7 참조 */}
</div>
```

**영역별 ARIA 요약**:

| 영역 | 시맨틱 / role | aria 속성 |
|---|---|---|
| `.ide` | `role="application"` | `aria-label="DevTicket"` (단축키가 풍부하므로 application 적절) |
| TitleBar | `<header role="banner">` | `.title-text` 는 `<h1>` 으로 |
| `.traffic` | — | `aria-hidden="true"` (장식) |
| ActivityBar | `<nav aria-label="주요 메뉴">` | 각 버튼 `aria-label`, 현재 라우트 `aria-current="page"`, 카트 배지 `aria-label="장바구니 ${count}개"` |
| Sidebar | `<aside aria-label="사이드 네비게이션">` | 섹션 헤더 `<button aria-expanded aria-controls>`, 항목 그룹 `<ul role="list">`, 카테고리 카운트 `aria-label="${cat}, ${count}개"` |
| TabBar | `role="tablist" aria-label="열린 페이지"` | 각 탭 `role="tab" aria-selected aria-controls="ide-editor"`, close 버튼 `aria-label="${label} 탭 닫기"` |
| `.ide-editor` | `<main id="ide-editor" tabIndex={-1}>` | 스킵 링크 타깃 |
| Minimap | — | **`aria-hidden="true"`** (순수 장식, 포커스 X) |
| StatusBar | `<footer role="contentinfo">` | `.term-ok` 는 `aria-label="시스템 상태: 정상"`, ⌘K 트리거 `aria-label="명령 팔레트 열기"` |

**SR 전용 텍스트**: `.sr-only` 유틸리티(global.css)로 트래픽 라이트 등 장식 요소를 의도적으로 숨길 때 사용. ide-chrome.css 자체에는 두지 않음.

**축약 검증**: axe-core / @axe-core/react 로 자동 검증 (테스트 도입 시점에 별도 PR — INVENTORY §5: 현재 테스트 의존성 0개).

### 6-7. 포커스 트랩 (CommandPalette)

CommandPalette 는 Layout 안에서 유일한 모달성 영역. 다음을 만족해야 함.

| 요구 | 구현 |
|---|---|
| 다이얼로그 시맨틱 | `<div role="dialog" aria-modal="true" aria-label="명령 팔레트">` 를 `.palette` 에 부착 |
| 입력 자동 포커스 | open=true 시점에 `inputRef.current?.focus()` (Layout.jsx:221 동일 — `setTimeout(…, 10)` 그대로 유지) |
| 백그라운드 비활성화 | 백드롭(`.palette-backdrop`) 클릭 시 닫기 + 백그라운드 콘텐츠는 `aria-hidden="true"` (오픈 동안 `.ide` 에 토글) |
| 포커스 순환 | Tab 이 입력 → 리스트 → 푸터 → 다시 입력 으로 순환. **시작 sentinel + 끝 sentinel** 두 개 두고 `onFocus` 에서 반대편으로 이동. 또는 `react-focus-lock` (외부 라이브러리 도입 시) — INVENTORY §5 라이브러리 미도입 정책에 따라 **자체 구현 권장** |
| Esc 로 닫기 | `useGlobalShortcuts` 에서 처리 (Layout.jsx:308) |
| 백드롭 클릭 닫기 | `.palette-backdrop onClick={onClose}` + `.palette onClick={e => e.stopPropagation()}` (프로토타입과 동일) |
| 닫힌 후 포커스 복귀 | open 직전의 `document.activeElement` 를 `useRef` 로 저장 → onClose 시 `restoreEl.current?.focus()` |
| 리스트 시맨틱 | `.palette-list role="listbox" aria-label="검색 결과"`, 각 `.palette-item role="option" aria-selected={i === selectedIndex}` |
| 선택 동기화 | `.palette-input` 에 `aria-activedescendant={'palette-item-' + selectedIndex}` 부착해 SR 이 화살표 이동을 인지 |

**구현 위치**: 포커스 트랩 유틸은 `src/components-v2/Layout/CommandPalette/useFocusTrap.ts` (선택) 로 분리 가능. 단 sentinel 2개 패턴은 30줄 안쪽이라 `CommandPalette/index.tsx` 안에 인라인해도 무방 (§2-3 200줄 한도 내).

**스킵 패턴 — 포커스 복귀**:

```ts
const lastFocusedRef = useRef<HTMLElement | null>(null);
useEffect(() => {
  if (open) {
    lastFocusedRef.current = document.activeElement as HTMLElement;
    inputRef.current?.focus();
  } else {
    lastFocusedRef.current?.focus();
  }
}, [open]);
```


## 7. 파일 생성 순서
(작성 예정)
