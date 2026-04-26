# 공용 컴포넌트 계획

## 1. 컴포넌트 인벤토리 (프로토타입에서 수집)

수집 기준
- A: SPEC.md § 0 "공용 컴포넌트" 명시 항목
- B: 프로토타입의 `common.jsx`에 이미 정의된 항목
- C: 페이지마다 인라인으로 반복 등장하는 패턴 (3회 이상 또는 2개 이상 페이지)

페이지 약어: `LD`=Landing, `EL`=EventList, `ED`=EventDetail, `CT`=Cart, `MP`=MyPage, `LG`=Login, `LY`=Layout

### 1.1 SPEC § 0 명시 컴포넌트 (A)

| # | 이름 | 사용 페이지 | 사용 빈도 | 설명 (1줄) | 프로토타입 정의 위치 |
|---|---|---|---|---|---|
| 1 | **Icon** | LD, EL, ED, CT, MP, LG, LY | 매우 높음 (전 페이지 다수) | Lucide 스타일 인라인 SVG 아이콘 셋 | `common.jsx` (정식 정의) |
| 2 | **Eyebrow pill** | LD(Hero), EL(Hero) | 낮음 (2회) | term-green-soft 배경 + 좌측 dot + mono 11.5px 라벨 | 인라인 (`Landing.jsx`, `EventList.jsx`) |
| 3 | **StatusChip** | EL(EventCard), ED(헤더), MP(티켓·주문 테이블), LD(FeaturedRow) | 매우 높음 (10+ 사용처) | `ok` / `sold` / `free` / `end` variant + 좌측 dot | `tokens.css` 의 `.status-chip` 클래스만 존재 (JSX 컴포넌트 없음) |
| 4 | **Chip** | EL(필터 행), ED(기술 스택) | 높음 (필터 + 태그) | active 시 brand 컬러로 토글되는 칩 | `tokens.css` 의 `.chip` 클래스만 존재 |
| 5 | **Kbd** | EL(Hero 힌트), LD(Hero CTA), LY(TitleBar / CommandPalette / StatusBar) | 높음 (10+ 사용처) | 키보드 키 표시용 인라인 박스 | `tokens.css` 의 `.kbd` 클래스 + native `<kbd>` 혼용 |
| 6 | **SectionHead** | LD(카테고리 / Featured / CTA 부근) | 낮음 (Landing에서 3회) | mono "// hint" + h2 + caption + action 슬롯, border-bottom | 인라인 (`Landing.jsx` 273~283 라인) |
| 7 | **Button** | LD, EL, ED, CT, MP, LG | 매우 높음 (전 페이지) | `primary` / `ghost` / `sm` / `lg` / `full` variant | `tokens.css` 의 `.btn .btn-primary .btn-ghost .btn-sm .btn-lg .btn-full` 클래스만 존재 |
| 8 | **Input** | LG(이메일/비번), EL(검색바) | 보통 (페이지별 1~2회) | label + 텍스트 input + error 메시지 | 인라인 (`Login.jsx` 의 `inputS`, `labelS`) + `.code-input` 클래스 |
| 9 | **Card** (flat-card) | LG, CT, ED, MP | 매우 높음 (모든 콘텐츠 컨테이너) | 표준 surface 카드 (border + radius) | `tokens.css` 의 `.flat-card` 클래스만 존재 |
| 10 | **Layout chrome** | LY 전체 | (Phase 0 단일 사용) | 사이드바 / 탭 / 상태바 / 미니맵 / 커맨드 팔레트 묶음 | `Layout.jsx` (개별 함수로 분리되어 있음, 아래 1.3 참고) |

### 1.2 common.jsx 에 이미 있는 헬퍼 (B)

| # | 이름 | 사용 페이지 | 빈도 | 설명 | 위치 |
|---|---|---|---|---|---|
| 11 | **FileIcon** | (프로토타입에선 직접 호출 거의 없음, 탭/사이드바용) | 낮음 | 파일 확장자별 컬러 SVG | `common.jsx` |
| 12 | `accent(id)` | LD, EL(EventCard), ED(hero), CT(thumb), MP(티켓 stripe) | 매우 높음 | 이벤트 ID → accent 컬러 hex | `common.jsx` |
| 13 | `fmtDate / fmtPrice / fmtISO` | LD, EL, ED, CT, MP | 매우 높음 | 표시용 포매터 | `common.jsx` |

> 12, 13 은 컴포넌트가 아니라 utility. v2 에서는 `src/lib/utils` 또는 `src/styles-v2/accent.ts` 로 이전 (SPEC § 0 의 "보존 vs 신규" 표 따름).

### 1.3 Layout chrome 서브컴포넌트 (A 의 "Layout chrome" 분해)

`Layout.jsx` 내부에 함수 단위로 이미 분리되어 있음. v2에서도 같은 단위로 컴포넌트화 후보.

| # | 이름 | 사용 | 설명 | 위치 |
|---|---|---|---|---|
| 14 | **TitleBar** | 전 페이지 (LY 가 감쌈) | 트래픽 라이트 + 서비스명 + ⌘K 검색바 + 테마 토글 | `Layout.jsx` |
| 15 | **ActivityBar** | 전 페이지 | 좌측 세로 아이콘 레일 + 배지 | `Layout.jsx` |
| 16 | **Sidebar** | 전 페이지 | 파일 트리 스타일 네비 (메뉴 / 다가오는 이벤트 / 세션) | `Layout.jsx` |
| 17 | **TabBar** | 전 페이지 | 열린 라우트 탭 + 닫기 버튼 | `Layout.jsx` |
| 18 | **Minimap** | 전 페이지 | 라우트별 syntax 패턴 미니맵 | `Layout.jsx` |
| 19 | **StatusBar** | 전 페이지 | 하단 상태바 (브랜치 / 상태 / 사용자 / ⌘K) | `Layout.jsx` |
| 20 | **CommandPalette** | 전 페이지 (⌘K) | 라우트/이벤트 빠른 이동 모달 | `Layout.jsx` |
| 21 | **EditorScroll + Gutter** | LD, EL, ED, CT, MP, LG (각 페이지 루트) | 라인 번호 거터 + 본문 스크롤 컨테이너 | 페이지마다 인라인 반복 (`<div className="editor-scroll">` + `<div className="gutter">`) |

### 1.4 SPEC에 없지만 페이지에서 반복되는 인라인 패턴 (C)

각 항목은 "공용 컴포넌트로 승격할지" 2번 섹션(PR 그룹화)에서 결정.

| # | 이름 (제안) | 사용 페이지 | 빈도 | 설명 | 프로토타입 정의 위치 |
|---|---|---|---|---|---|
| 22 | **EmptyState** | EL(검색결과 없음), CT(장바구니 비어있음), MP(환불 내역 없음) | 3회 (모두 다른 페이지) | `.stack-trace` 박스 + 큰 이모지 + 타이틀 + 메시지 + 옵션 액션 버튼 | 매번 인라인 (`EventList.jsx` `EmptyStackTrace`, `Cart.jsx`, `MyPage.jsx` `tab==='refund'`) |
| 23 | **QuantityStepper** | ED(구매 패널), CT(아이템 카드) | 2회 (사이즈만 다름) | `−` / 숫자 / `+` 사각 버튼 | 각각 `qtyBtn` (34px, ED), `qtyBtnSm` (28px, CT) 인라인 |
| 24 | **MetaLine / InfoRow** | EL(EventCard 메타), ED(InfoRow) | 2개 페이지에서 약 8회 | mono 라벨 + 값 한 줄 (이모지 또는 width 30px 라벨) | EL: `MetaLine`, ED: `InfoRow` — 둘 다 인라인 |
| 25 | **SummaryRow** | CT(주문 요약 4행) | 1페이지 4회 | label / value 양쪽 정렬, bold 변형 | `Cart.jsx` 의 `Row` |
| 26 | **AccentMediaBox** | CT(아이템 thumb 72×72), ED(hero 240px), MP(티켓 stripe 56px), LD(FeaturedRow 48px) | 4개 페이지 | `linear-gradient(135deg, accentXX, accentYY)` + `</>` 또는 `❯_` 글리프 | 매번 인라인 (사이즈/그라디언트 alpha 만 다름) |
| 27 | **Avatar / BrandMark** | LG(DT 36×36 로고), MP(닉네임 이니셜 52×52) | 2회 | brand bg + 흰 모노 글자 정사각 | 각각 인라인 |
| 28 | **OnlineBadge / TermDot** | EL(Hero pill), LD(Hero pill), MP(ONLINE 배지), LY(Sidebar 세션, StatusBar) | 5회+ | 6px term-green 원형 점 (단독 또는 텍스트 prefix) | 매번 인라인 `<span style={{ width:6, height:6, borderRadius:'50%', background:'var(--term-green)' }} />` |
| 29 | **Breadcrumb** | ED(이벤트 › 제목) | 1회 | 텍스트 링크 / `›` 구분자 / 현재 페이지 | `EventDetail.jsx` 인라인 |
| 30 | **SegmentedTabs** | MP(4개 탭) | 1페이지 | surface-2 트랙 + 4px padding + 활성 카드 + 좌측 아이콘 | `MyPage.jsx` 인라인 |
| 31 | **DataTable (mono ID 행)** | MP(주문 내역) | 1페이지 | surface-2 헤더 + 컬럼별 정렬 + StatusChip 셀 | `MyPage.jsx` 인라인 |
| 32 | **StatCard** | LD(Stats 4개) | 1페이지 4회 | mono "// hint" + 큰 숫자 + 단위 + 라벨 | `Landing.jsx` 의 `Stat` |
| 33 | **CategoryTile** | LD(카테고리 6개) | 1페이지 6회 | 약자 컬러 박스 + 카테고리명 + 카운트, hover 시 accent 보더 | `Landing.jsx` 의 `CategoryTile` |
| 34 | **FeaturedRow** | LD(주목 이벤트 5개) | 1페이지 5회 | 순번 / 그라디언트 박스 / 정보 / 가격 grid | `Landing.jsx` 의 `FeaturedRow` |
| 35 | **EventCard** | EL(메인 그리드) | 1페이지 N회 | 좌측 accent bar + 파일탭 헤더 + 본문 + dashed 푸터 | `EventList.jsx` 의 `EventCard` |
| 36 | **TypedTerminal** | LD(Hero 우측) | 1페이지 1회 | 트래픽 라이트 헤더 + 타이핑 애니메이션 본문 | `Landing.jsx` 의 `TypedTerminal` (Landing 전용) |
| 37 | **InfoCallout** | ED(구매 패널 하단 안내) | 1회 | 좌측 brand bar + editor-line bg + caption | `EventDetail.jsx` 인라인 |

### 1.5 메모

- 31~36 은 "페이지 전용"에 가까워 공용 승격이 아니라 해당 페이지 디렉토리(`src/pages-v2/{Page}/components/`)에 두는 것이 자연스러움. 2번 섹션(PR 그룹화)에서 분류 확정.
- 22, 23, 24, 26, 27, 28 은 2개 이상 페이지에서 반복되므로 `src/components-v2/` 후보.
- 3~9 (StatusChip / Chip / Kbd / Button / Card / Input 등) 은 현재 프로토타입에서 **CSS 클래스만** 있고 React 컴포넌트가 없음 → v2 에서는 props 기반 컴포넌트로 새로 만들어야 함.


## 2. PR 그룹화
(작성 예정)

## 3. 컴포넌트별 props 시그니처
(작성 예정)

## 4. 컴포넌트별 variant / state
(작성 예정)

## 5. 파일 구조 / 명명 규칙
(작성 예정)

## 6. 의존성 그래프
(작성 예정)

## 7. PR 별 파일 생성 순서
(작성 예정)
