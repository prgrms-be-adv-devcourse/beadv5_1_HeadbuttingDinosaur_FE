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
(작성 예정)

## 5. ide-chrome.css 토큰 및 클래스 목록
(작성 예정)

## 6. 반응형 / 다크모드 / 접근성
(작성 예정)

## 7. 파일 생성 순서
(작성 예정)
