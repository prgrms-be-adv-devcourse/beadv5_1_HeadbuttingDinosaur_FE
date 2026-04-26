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

### 2.0 그룹화 원칙
- 한 PR 200~400 LOC (TSX + CSS + 타입 + 간단 스토리/픽스처 합산 추정)
- 의존성 적은 것 → 많은 것 순. 같은 PR 내부에서 컴포넌트 간 import 가능, **다른 PR에 정의된 컴포넌트는 머지 후에 사용**
- 같은 성격끼리 묶음 (primitive / form / container / composite)
- Layout chrome (#14~21, EditorScroll/Gutter 포함) 은 본 plan 의 범위 밖 — `layout.plan.md` 에서 따로 PR 분할 (이 § 2 에서는 의존성만 표기)
- 페이지 전용 후보 (#31~36 EventCard / StatCard / CategoryTile / FeaturedRow / TypedTerminal / DataTable) 는 공용 승격 안 함 → 각 페이지 plan 의 `components/` 디렉토리 PR에 포함

### 2.1 제안 조정 사유

원안 (PR 1 / 2 / 3) 검토 결과:
- **PR 1** (Primitives 5개): LOC 합 ≈ 340 — 적정 ✓
- **PR 2** (Button + Input): LOC 합 ≈ 200 — 하한 근처
- **PR 3** (Card + SectionHead): LOC 합 ≈ 130 — **하한 미달**
- § 1.4 의 공용 승격 후보 6개 (#22 EmptyState, #23 QuantityStepper, #24 MetaLine, #26 AccentMediaBox, #27 Avatar, #28 TermDot) 가 원안 3개 PR에 들어갈 자리가 없음

→ PR 3 을 키우는 대신 **PR 4 (Composite shared) 를 신설**하고, PR 3 은 그대로 작게 유지하되 의존도가 낮아 PR 2와 병렬 진행 가능하도록 분리 유지.

대안 (병합형, 리뷰 부담 줄이고 싶을 때): PR 2 + PR 3 을 하나로 합쳐 ≈ 330 LOC 단일 "Form & Container" PR로. 본 plan 은 **분리형(PR 2 / PR 3 별개)** 을 기본으로 채택.

### 2.2 PR 별 상세

#### PR 1 — Primitives (의존 없음)

| 컴포넌트 | § 1 # | 추정 LOC | 비고 |
|---|---|---|---|
| Icon | 1 | 130 | `common.jsx` 의 paths 객체 그대로 + 타입화. 신규 추가 아이콘은 별도 PR |
| Kbd | 5 | 30 | `<kbd>` + `.kbd` 스타일 래퍼 |
| Eyebrow (pill) | 2 | 50 | `dot` 옵션 props 포함 |
| StatusChip | 3 | 70 | variant `ok` / `sold` / `free` / `end` |
| Chip | 4 | 60 | active toggle, onClick, icon 슬롯 |

- **합계**: ≈ 340 LOC ✓
- **의존**: tokens.css (이미 존재), 없음
- **사유**: 모든 다른 PR 의 빌딩 블록. 가장 먼저 머지되어야 PR 2~4 가 import 가능.
- **메모**: `common.jsx` 의 `accent()` 함수와 `fmtDate / fmtPrice / fmtISO` utility 도 이 PR에 묶어 `src/lib/utils` 또는 `src/styles-v2/accent.ts` 로 이전 (≈ +40 LOC). 합쳐도 PR 한도 안.

#### PR 2 — Form / Action (PR 1 의존)

| 컴포넌트 | § 1 # | 추정 LOC | 비고 |
|---|---|---|---|
| Button | 7 | 110 | variant `primary` / `ghost` + size `sm` / `lg` + `full` + `disabled` + 좌측 Icon 슬롯 |
| Input | 8 | 90 | label + error + focus glow + 좌측 Icon 슬롯 (search bar 케이스) |

- **합계**: ≈ 200 LOC ✓
- **의존**: **PR 1 (Icon)** — Button/Input 좌측 아이콘 슬롯
- **사유**: Login / EventList 검색 / Cart 결제 / EventDetail 구매 등 모든 폼·액션의 기반. PR 3 과는 독립적이라 병렬 작업 가능.

#### PR 3 — Container / Display (PR 1 의존)

| 컴포넌트 | § 1 # | 추정 LOC | 비고 |
|---|---|---|---|
| Card (flat-card) | 9 | 50 | `<Card>` 본체 + `<Card.Header>` / `<Card.Body>` 슬롯 (선택) |
| SectionHead | 6 | 80 | `// hint` + h2 + caption + action 슬롯, border-bottom |

- **합계**: ≈ 130 LOC — **하한 미달이지만 의도적으로 작게 유지**
- **의존**: **PR 1 (Icon)** — SectionHead action 슬롯 안에 들어가는 링크/버튼이 아이콘 사용 가능
- **사유**: 두 컴포넌트 모두 "콘텐츠 컨테이너" 성격이라 묶음. Card 는 LG/CT/ED/MP 모든 페이지에서 즉시 쓰임 → PR 4 (Composite) 보다 먼저 머지되어야 EmptyState 등에서 재사용 가능.
- **하한 미달 허용 사유**: 컴포넌트가 단순하고 리뷰 비용이 낮음. 억지로 다른 컴포넌트와 묶으면 성격이 흐려짐.

#### PR 4 — Composite shared patterns (PR 1, 2, 3 의존)

§ 1.4 중 2페이지 이상에서 반복 등장하는 후보 6개.

| 컴포넌트 | § 1 # | 추정 LOC | 비고 |
|---|---|---|---|
| TermDot | 28 | 20 | 6px 원형 점. Eyebrow / Sidebar / StatusBar 등에서 재사용. PR 1 의 Eyebrow 에서는 인라인 유지하다가 본 PR 머지 후 치환 가능 |
| Avatar / BrandMark | 27 | 50 | size + initial + brand bg. LG 로고와 MP 닉네임 이니셜 |
| AccentMediaBox | 26 | 60 | size prop + 그라디언트 alpha + glyph (`</>` / `❯_`) 슬롯. CT thumb / ED hero / MP stripe / LD FeaturedRow |
| QuantityStepper | 23 | 70 | 28px / 34px size, min/max, controlled value. ED 와 CT 두 곳에서 사용 |
| MetaLine | 24 | 40 | mono 라벨 + 값. EL EventCard 와 ED InfoRow 통합. 이모지 prefix 옵션 |
| EmptyState | 22 | 80 | `.stack-trace` shell + 이모지 + title + message + action 슬롯. EL / CT / MP 환불 |

- **합계**: ≈ 320 LOC ✓
- **의존**:
  - **PR 1 (Icon)**: QuantityStepper 의 `+` / `−` 아이콘
  - **PR 2 (Button)**: EmptyState 의 action 슬롯, QuantityStepper 의 사각 버튼은 자체 스타일이라 Button 안 써도 됨 (검토 필요)
  - **PR 3 (Card)**: EmptyState 가 Card 변형으로 만들지 별도 surface 로 갈지 § 3 에서 결정. 의존 가능성만 표기
- **사유**: § 1.5 메모의 "공용 승격 가치 있음" 6개를 한 번에 처리. PR 1~3 머지 후 진행해야 import 가능.

### 2.3 PR 의존 그래프 (요약)

```
PR 1 (Primitives) ──┬──> PR 2 (Form/Action) ──┐
                    │                          ├──> PR 4 (Composite)
                    └──> PR 3 (Container)  ────┘

(별도 트랙) layout.plan.md PR 들 ──depends──> PR 1 (Icon, Kbd)
(별도 트랙) 페이지 plan PR 들    ──depends──> PR 1~4
```

### 2.4 LOC 합계

| PR | LOC | 상태 |
|---|---|---|
| PR 1 | ≈ 340 (+40 utils) | 적정 |
| PR 2 | ≈ 200 | 하한 근처 |
| PR 3 | ≈ 130 | 하한 미달 (의도적) |
| PR 4 | ≈ 320 | 적정 |
| **합계** | **≈ 990 + 40 utils** | 4개 PR로 모든 공용 컴포넌트 커버 |

### 2.5 범위 밖 / 후속

- **§ 1.3 Layout chrome** (#14~21, EditorScroll/Gutter): `layout.plan.md` 의 PR 분할 대상
- **§ 1.4 페이지 전용 후보** (#31~36, #37): 각 페이지 plan 에서 처리
  - EventCard (#35) → EventList plan
  - StatCard / CategoryTile / FeaturedRow / TypedTerminal (#32~34, #36) → Landing plan
  - DataTable (#31) → MyPage plan
  - InfoCallout (#37) → EventDetail plan (또는 사용처 1회 늘면 PR 4 후속으로 승격)
- **§ 1.4 #25 SummaryRow / #29 Breadcrumb / #30 SegmentedTabs**: 단일 페이지 사용이라 우선 페이지 plan 에 두되, EL/MP 외 추가 사용처 발견 시 § 1 갱신 후 후속 PR로 승격


## 3. 컴포넌트별 props 시그니처

### 3.0 표준 패턴 (모든 컴포넌트 공통)

#### forwardRef 적용 기준
- **적용**: 단일 native HTML 엘리먼트를 감싸는 컴포넌트 (Icon, Kbd, Button, Input, Card, Chip, StatusChip, Eyebrow, TermDot, Avatar, AccentMediaBox, MetaLine, EmptyState, SectionHead, FileIcon)
- **미적용**: 내부에 여러 엘리먼트가 동등하게 있어 ref 대상이 모호한 컴포넌트 (QuantityStepper)
- 모두 `React.forwardRef<HTMLXxxElement, XxxProps>` 형태. 디스플레이 네임 지정.

#### className / style
- 모든 컴포넌트는 `className?: string` 받음. 내부 클래스와 `clsx`(또는 동등 헬퍼)로 병합
- `style?: CSSProperties` 는 native HTML 래퍼만 통과 (`...rest` 로). 합성 컴포넌트는 의도적으로 미허용.

#### ...rest 처리
- **native HTML 래퍼** (Button / Input / Card / Chip / Kbd / Icon / FileIcon): 해당 엘리먼트의 attribute 타입을 extend → onClick / disabled / aria-* / data-* 자동 통과
- **합성 컴포넌트** (Eyebrow / StatusChip / SectionHead / EmptyState / QuantityStepper / MetaLine / Avatar / AccentMediaBox / TermDot): `...rest` 미허용. props 표면을 명시 prop 으로만 제한 → API 흐려지는 것 방지

#### children
- 콘텐츠가 본질인 컴포넌트만 받음 (Button / Card / Chip / Eyebrow / StatusChip / Kbd / MetaLine 의 값)
- 그 외에는 `title`, `label`, `message` 등 named string/ReactNode prop 으로 받음

#### Slot 패턴
- 단일 슬롯: `action?: ReactNode`, `iconStart?: ReactNode`, `iconEnd?: ReactNode`
- compound component (`Card.Header`, `Card.Body`) 는 도입하지 않음 — `padding` 옵션으로 충분
- 호출자가 `<Icon name="cart" />` 인스턴스를 직접 만들어 슬롯에 주입 (의존 분리)

#### variant / size / tone
- **literal union 타입** 사용 (`'primary' | 'ghost'`). enum 안 씀
- `size` 가 디자인 토큰(sm/md/lg) 인 경우와 임의 px 인 경우 분리:
  - 디자인 토큰: `'sm' | 'md' | 'lg'`
  - 임의 px (Icon, TermDot 등): `number`

#### 색상 / accent
- **컴포넌트는 색을 모름**. accent 컬러가 필요한 컴포넌트(`AccentMediaBox`)는 `accent: string` prop 으로 hex 받음. 호출자가 `accent(eventId)` 유틸 호출 책임.

#### controlled / uncontrolled
- 모두 **controlled 강제**. `defaultValue` 안 받음. (QuantityStepper, Input)
- form 컴포넌트는 `value` + `onChange` 필수.

---

### 3.1 PR 1 — Primitives

#### Icon

```ts
import type { SVGAttributes } from 'react';

export type IconName =
  | 'folder' | 'file' | 'search' | 'git' | 'ext'
  | 'user' | 'cart' | 'ticket'
  | 'sun' | 'moon' | 'x' | 'chev' | 'chevd'
  | 'bell' | 'check' | 'play'
  | 'wallet' | 'refund' | 'terminal' | 'trash'
  | 'plus' | 'minus' | 'settings' | 'zap'
  | 'calendar' | 'pin';

export interface IconProps extends Omit<SVGAttributes<SVGSVGElement>, 'name'> {
  name: IconName;     // 아이콘 식별자 (paths 맵 키)
  size?: number;      // 한 변 px. default 16
  // stroke / fill 은 currentColor 고정 → CSS color 로 제어
}
```
- forwardRef: O (`SVGSVGElement`)
- 디스플레이 네임 `'Icon'`

#### Kbd

```ts
import type { HTMLAttributes, ReactNode } from 'react';

export interface KbdProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;  // 키 라벨 ('⌘K', '/', 'j', 'esc')
}
```
- forwardRef: O (`HTMLElement`, native `<kbd>`)
- 별도 variant 없음. 모든 스타일은 CSS 클래스에서.

#### Eyebrow

```ts
import type { ReactNode } from 'react';

export interface EyebrowProps {
  children: ReactNode;                       // 라벨 텍스트
  tone?: 'term-green' | 'brand';             // default 'term-green'
  dot?: boolean;                             // 좌측 dot. default true
  className?: string;
}
```
- forwardRef: O (`HTMLDivElement`)
- `...rest` 미허용. dot 은 PR 4 의 `<TermDot>` 머지 후 내부 치환 (PR 1 에선 인라인).

#### StatusChip

```ts
import type { ReactNode } from 'react';

export type StatusVariant = 'ok' | 'sold' | 'free' | 'end';

export interface StatusChipProps {
  variant: StatusVariant;   // 색/도트 색 결정
  children: ReactNode;      // 라벨 ('판매중', '매진', '무료', '결제 대기')
  dot?: boolean;            // default true
  className?: string;
}
```
- forwardRef: O (`HTMLSpanElement`)
- 색은 variant 가 결정. 호출자가 색 hex 전달하지 않음.

#### Chip

```ts
import type { ButtonHTMLAttributes, ReactNode } from 'react';

export interface ChipProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  active?: boolean;     // default false. 활성 시 brand color
  count?: number;       // 우측에 작은 숫자 (카테고리 카운트)
  children: ReactNode;  // 칩 라벨
}
```
- forwardRef: O (`HTMLButtonElement`)
- `onClick`, `disabled`, `type` 등은 ButtonHTMLAttributes 로 통과.

---

### 3.2 PR 2 — Form / Action

#### Button

```ts
import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;   // default 'primary'
  size?: ButtonSize;         // default 'md'
  full?: boolean;            // 100% 폭. default false
  loading?: boolean;         // 스피너 + 자동 disabled. default false
  iconStart?: ReactNode;     // 좌측 아이콘 슬롯
  iconEnd?: ReactNode;       // 우측 아이콘 슬롯
  children: ReactNode;
}
```
- forwardRef: O (`HTMLButtonElement`)
- `disabled` 와 `loading` 은 별개 — `loading=true` 면 내부에서 `disabled` 강제.
- `type` 은 미지정 시 `'button'` 강제 (form submit 사고 방지).

#### Input

```ts
import type { InputHTMLAttributes, ReactNode } from 'react';

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;            // 상단 라벨. 있으면 자동 htmlFor 연결
  error?: string;            // 에러 메시지. 있으면 border danger + 하단 표시
  iconStart?: ReactNode;     // 좌측 아이콘 (검색바)
  hintEnd?: ReactNode;       // 우측 힌트 슬롯 (<Kbd>/</Kbd>)
  containerClassName?: string;  // wrapper div 용 (label 까지 포함)
  // value / onChange / placeholder 등은 InputHTMLAttributes
}
```
- forwardRef: O (`HTMLInputElement`) — EventList 의 `/` 단축키로 외부 focus() 호출 필요
- `id` 미지정 시 `useId()` 로 자동 생성 후 label 연결.
- 자체 `size` prop 은 안 씀 (HTML `size` 와 충돌). 컨테이너 폭은 className 으로.

---

### 3.3 PR 3 — Container / Display

#### Card

```ts
import type { HTMLAttributes, ReactNode } from 'react';

export type CardPadding = 'none' | 'sm' | 'md' | 'lg' | number;

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: CardPadding;   // default 'md' (16px). number 면 raw px
  interactive?: boolean;   // hover lift + cursor pointer. default false
  children: ReactNode;
}
```
- forwardRef: O (`HTMLDivElement`)
- `onClick` 은 HTMLAttributes 로 통과. `interactive=true` 일 때만 의미.
- compound API 도입 안 함 (`Card.Header` 등). padding=0 + 자식 요소 직접 배치로 충분.

#### SectionHead

```ts
import type { ReactNode } from 'react';

export interface SectionHeadProps {
  title: string;             // h2 텍스트
  hint?: string;             // mono '// hint' (자동 prefix 추가)
  caption?: string;          // 부제 1줄
  action?: ReactNode;        // 우측 슬롯 ('전체 보기 →' 링크 등)
  className?: string;
}
```
- forwardRef: O (`HTMLDivElement`)
- `// ` prefix 는 컴포넌트 내부에서 자동으로 붙임 (호출자가 `'category'` 만 전달).

---

### 3.4 PR 4 — Composite shared

#### TermDot

```ts
export type DotTone = 'term-green' | 'brand' | 'danger';

export interface TermDotProps {
  size?: number;        // px. default 6
  tone?: DotTone;       // default 'term-green'
  className?: string;
}
```
- forwardRef: O (`HTMLSpanElement`)

#### Avatar

```ts
export type AvatarSize = 'sm' | 'md' | 'lg' | number;

export interface AvatarProps {
  initial: string;       // 1~2 글자. 컴포넌트가 toUpperCase 처리
  size?: AvatarSize;     // 'sm'=36 / 'md'=52 / 'lg'=72. default 'md'
  className?: string;
}
```
- forwardRef: O (`HTMLDivElement`)
- 이미지 URL 지원은 v2 phase 2. 현재는 initial only.

#### AccentMediaBox

```ts
import type { ReactNode } from 'react';

export type AccentMediaSize = 'xs' | 'sm' | 'md' | 'lg' | 'hero';

export interface AccentMediaBoxProps {
  accent: string;            // hex color. 호출자가 accent(eventId) 호출
  size?: AccentMediaSize;    // 'xs'=48 / 'sm'=56 / 'md'=72 / 'lg'=120 / 'hero'=240. default 'md'
  glyph?: ReactNode;         // default <span>{'</>'}</span>. 'terminal' 변형은 '❯_'
  className?: string;
}
```
- forwardRef: O (`HTMLDivElement`)
- 그라디언트 alpha (`15`/`35` 등) 는 size 별로 컴포넌트 내부에서 결정.

#### QuantityStepper

```ts
export interface QuantityStepperProps {
  value: number;                    // 현재 수량
  onChange: (next: number) => void; // 변경 콜백
  min?: number;                     // default 1
  max?: number;                     // 잔여 좌석. 없으면 무제한
  size?: 'sm' | 'md';               // 'sm'=28px / 'md'=34px. default 'md'
  disabled?: boolean;
  className?: string;
}
```
- forwardRef: X — 내부 `−` / `+` 두 버튼 + 숫자 span 으로 ref 대상이 모호. 필요해지면 imperative handle.
- controlled 강제. `defaultValue` 미지원.

#### MetaLine

```ts
import type { ReactNode } from 'react';

export interface MetaLineProps {
  label: string;          // 'WHEN' / 'WHERE' / 'HOST' (자동 uppercase 처리)
  icon?: ReactNode;       // 좌측 이모지/Icon 슬롯
  children: ReactNode;    // 값
  truncate?: boolean;     // default true (whitespace nowrap + ellipsis)
  className?: string;
}
```
- forwardRef: O (`HTMLDivElement`)
- 라벨/값 폭 비율은 컴포넌트 내부 표준 (라벨 30~66px). 인라인 override 미허용.

#### EmptyState

```ts
import type { ReactNode } from 'react';

export interface EmptyStateProps {
  emoji?: string;           // '🔍' / '🛒' / '💳'
  title: string;
  message?: ReactNode;      // 본문 (한 줄 권장)
  action?: ReactNode;       // <Button>
  className?: string;
}
```
- forwardRef: O (`HTMLDivElement`)
- 자체 surface (`.stack-trace` 변형) 갖음 → Card 로 감쌀 필요 없음. § 2.2 PR 4 의 Card 의존은 선택적.

---

### 3.5 부속 (B 카테고리)

#### FileIcon

```ts
import type { SVGAttributes } from 'react';

export type FileKind =
  | 'jsx' | 'ts' | 'tsx' | 'go' | 'rs'
  | 'json' | 'md' | 'py' | 'css';

export interface FileIconProps extends Omit<SVGAttributes<SVGSVGElement>, 'kind'> {
  kind?: FileKind;     // default 'jsx'
  size?: number;       // default 14
}
```
- forwardRef: O (`SVGSVGElement`)
- 색은 `kind` 가 결정 (common.jsx 의 `colors` 맵 그대로 이전).

---

### 3.6 본 plan 범위 밖 (signature 정의 위치)

| 카테고리 | 컴포넌트 | 정의 위치 |
|---|---|---|
| Layout chrome | TitleBar, ActivityBar, Sidebar, TabBar, Minimap, StatusBar, CommandPalette, EditorScroll+Gutter (#14~21) | `layout.plan.md` § 3 |
| Landing 전용 | TypedTerminal, StatCard, CategoryTile, FeaturedRow (#32~34, #36) | Landing page plan |
| MyPage 전용 | DataTable, SegmentedTabs (#30~31) | MyPage page plan |
| EventList 전용 | EventCard (#35) | EventList page plan |
| EventDetail 전용 | InfoCallout (#37), Breadcrumb (#29) | EventDetail page plan |
| Cart 전용 | SummaryRow (#25) | Cart page plan |

> 위 목록은 § 1.5 의 "공용 승격 안 함" 결정에 따라 본 § 3 에서 props 시그니처를 정의하지 않음. 각 페이지 plan 의 § 3 동등 섹션에서 정의.

---

### 3.7 내보내기 / 디렉토리 매핑 (요약)

```
src/components-v2/
├── Icon/             ← PR 1
├── Kbd/              ← PR 1
├── Eyebrow/          ← PR 1
├── StatusChip/       ← PR 1
├── Chip/             ← PR 1
├── Button/           ← PR 2
├── Input/            ← PR 2
├── Card/             ← PR 3
├── SectionHead/      ← PR 3
├── TermDot/          ← PR 4
├── Avatar/           ← PR 4
├── AccentMediaBox/   ← PR 4
├── QuantityStepper/  ← PR 4
├── MetaLine/         ← PR 4
├── EmptyState/       ← PR 4
├── FileIcon/         ← PR 1 (Icon 과 같은 PR, 다른 디렉토리)
└── index.ts          ← 모든 컴포넌트 + 타입 re-export
```

상세 구조/명명 규칙은 § 5 에서 확정.


## 4. 컴포넌트별 variant / state

> 본 섹션은 점진적으로 채움. **PR 1 (Primitives)** 부터 시작.

### 4.1 Icon

#### variant
- 변종(variant) 개념 없음. **`name`** prop 의 enum 값이 사실상 콘텐츠 식별자.

#### name (prototype 에서 정의 + 사용 현황)

| name | 정의 (`common.jsx`) | 페이지 사용처 |
|---|:---:|---|
| `folder` | O | LY ActivityBar / Sidebar / TabBar, CommandPalette |
| `file` | O | LY TabBar (이벤트 상세 탭), MyPage(orders 탭 라벨) |
| `search` | O | LY TitleBar / ActivityBar / CommandPalette, EventList(검색바), Landing(빠른 검색 버튼) |
| `git` | O | LY StatusBar |
| `ext` | O | (정의만, 페이지 직접 사용 0) |
| `user` | O | LY ActivityBar / Sidebar / TabBar / CommandPalette, MyPage(탭) |
| `cart` | O | LY ActivityBar / Sidebar / TabBar, EventDetail(장바구니 담기 버튼), CommandPalette |
| `ticket` | O | MyPage(탭, 티켓 카드 stripe), CommandPalette(이벤트 항목) |
| `sun` | O | LY TitleBar (다크 테마일 때) |
| `moon` | O | LY TitleBar (라이트 테마일 때), CommandPalette(테마 전환) |
| `x` | O | LY TabBar (탭 close) |
| `chev` | O | LY Sidebar (접힘) |
| `chevd` | O | LY Sidebar (펼침) |
| `bell` | O | (정의만, 사용 0) |
| `check` | O | (정의만, 사용 0) |
| `play` | O | (정의만, 사용 0) |
| `wallet` | O | LY ActivityBar(없음), MyPage(탭, 출금 버튼) |
| `refund` | O | MyPage(탭) |
| `terminal` | O | LY ActivityBar / Sidebar(홈/로그인), CommandPalette |
| `trash` | O | Cart(아이템 삭제 버튼) |
| `plus` | O | EventDetail(qtyBtn), Cart(qtyBtnSm), MyPage(충전 버튼) |
| `minus` | O | EventDetail(qtyBtn), Cart(qtyBtnSm) |
| `settings` | O | LY ActivityBar(하단) |
| `zap` | O | (정의만, 사용 0) |
| `calendar` | O | (정의만, 사용 0) |
| `pin` | O | (정의만, 사용 0) |

> **이전 정책**: 정의만 있고 사용처 0 인 7개(`ext`, `bell`, `check`, `play`, `zap`, `calendar`, `pin`) 도 `IconName` union 에 포함해 그대로 이전. v2 phase 2 에서 사용처 생기면 추가 검토.

#### size (실제 사용된 px 값)

| 사용처 | size |
|---|---|
| `common.jsx` 기본값 | **16** (default) |
| Sidebar `chev` / `chevd` | 10 |
| TitleBar(search), Cart 버튼(trash 등) | 11~12 |
| 대부분의 인라인 버튼 (Sidebar, Tab close, qty 버튼, MyPage 탭) | 13 |
| TitleBar 테마 토글, EventList 검색바, CommandPalette, Landing 검색 버튼 | 14 |
| EventList 검색바(별도), `common.jsx` 기본값 | 16 |
| ActivityBar 설정 | 18 |
| ActivityBar 메인 아이콘, MyPage 티켓 stripe | 20 |

→ `size?: number` 자유 입력. 권장 값은 **16 default**, **20 큰 액션**, **13 인라인**.

#### state
- 자체 state 없음. `currentColor` + 부모 hover/disabled/active 영향만 받음.
- stroke-width 는 `1.8` 고정 (props 화 안 함).

#### modifier
- 없음. 색상은 CSS `color` 로 외부 제어.

---

### 4.2 Kbd

#### variant
- **default**: 표준 라이트 surface 위 (`var(--kbd-bg)` 토큰 가정)
- **inverse**: 다크 surface 위 (StatusBar). 흰색 반투명 배경.

#### size
- 단일 사이즈. CSS 클래스에서 mono ~10.5~11.5px / padding 0~4px 고정.

#### state
- 자체 state 없음 (정보 표시용, 인터랙션 없음).

#### modifier
- 없음.

#### prototype 에서 실제 사용된 콘텐츠

| 콘텐츠 | 사용처 |
|---|---|
| `⌘K` | LY TitleBar, LY StatusBar (inverse), Landing(빠른 검색 버튼), EventList Hero |
| `/` | EventList Hero, EventList 검색바(우측) |
| `j`, `k` | EventList Hero (카드 이동 힌트) |
| `↵` | EventList Hero, CommandPalette(실행 힌트) |
| `↑↓` | CommandPalette(이동 힌트) |
| `esc` | CommandPalette(닫기 힌트) |
| `g h`, `g e`, `g c`, `g m` | CommandPalette(라우트 단축키 표시) |

→ inverse variant 는 **LY StatusBar 1곳에서만** 사용. 인라인 style 로 처리되어 있던 것을 `<Kbd inverse>` 로 통합.

```ts
// 시그니처 보강 (§ 3.1 에 추가)
export interface KbdProps extends HTMLAttributes<HTMLElement> {
  inverse?: boolean;   // 다크 surface 위. default false
  children: ReactNode;
}
```

---

### 4.3 Eyebrow

#### variant (tone)

| tone | 색 매핑 | prototype 사용처 |
|---|---|---|
| `term-green` (default) | bg `var(--term-green-soft)` / text `var(--term-green-dim)` / dot `var(--term-green)` | EventList Hero ("개발자를 위한 이벤트 플랫폼"), Landing Hero ("v1.0 · 베타 서비스 운영 중") |
| `brand` | bg `var(--brand-light)` / text `var(--brand)` / dot `var(--brand)` | (prototype 미사용, v2 향후 확장 슬롯) |

#### size

| size | 적용 | prototype 사용처 |
|---|---|---|
| `md` (default) | padding `5px 12px`, mono 11.5px, radius 999 | EventList Hero, Landing Hero |
| `sm` | padding `2px 7px`, mono 10.5px, radius 4 | MyPage 프로필 헤더 "● ONLINE" 배지 — 인라인이지만 동일 패턴 |

> **이전 결정**: MyPage 의 ONLINE 배지는 dot 이 `●` 문자였고 radius 가 작아 별도처럼 보이지만, 시각 토큰(term-green-soft / term-green-dim) 이 동일하므로 `<Eyebrow size="sm" tone="term-green">● ONLINE</Eyebrow>` 로 통합. dot 은 `dot=false` 로 끄고 children 안에 `●` 직접 넣거나, `dot=true` + size 별 dot 크기 자동 조정 — § 5 명명 확정 시 결정.

#### state
- 자체 state 없음 (정보 표시용).

#### modifier

| modifier | 효과 | prototype 사용처 |
|---|---|---|
| `dot` (default `true`) | 좌측 6px(`md`) / 4px(`sm`) 도트 표시 | EventList Hero, Landing Hero (모두 dot 있음). MyPage 는 인라인 `●` 문자라 dot=false 로 이전 가능 |

---

### 4.4 StatusChip

#### variant (4종, 색/도트 자동 매핑)

| variant | bg / text 색 | dot 색 | prototype 사용 라벨 |
|---|---|---|---|
| `ok` | term-green soft / term-green dim | term-green | "판매중" (EventList card, EventDetail header, Landing FeaturedRow), "결제 완료" (MyPage orders), "사용 가능" (MyPage tickets) |
| `sold` | danger soft / danger dim | danger | "매진" (EventList card, EventDetail header, Landing FeaturedRow), "{N}석" (Landing FeaturedRow low-stock), "환불 완료" (MyPage orders) |
| `free` | brand light / brand | brand | "무료" (EventList card 가격 0인 이벤트) |
| `end` | surface-2 / text-3 | text-4 | "사용 완료" (MyPage tickets), "결제 대기" (MyPage orders) |

> **재용도 메모**: prototype 의 Landing FeaturedRow 는 low-stock 표시(잔여 < 10)에 `sold` variant 를 시각적으로 빌려 씀 (빨강 톤 강조용). v2 에서는 의미 충돌 없이 같은 패턴 유지 — `sold` 가 "주의/위험" 톤을 의미하는 것으로 확장 해석.

#### size
- 단일 사이즈. CSS 토큰에서 mono ~11px / padding ~`2px 8px` / radius `4` 고정.
- (낮은 우선순위) v2 에서 `size: 'sm'` 옵션 도입 가능 — Landing FeaturedRow 의 `{N}석` 같은 짧은 칩에 한정. **현재 PR 1 범위에선 도입 안 함.**

#### state
- 자체 state 없음 (비-인터랙션 표시용).
- 클릭 가능 칩이 필요해지면 **`<Chip>` 사용**, StatusChip 은 정보 표시 전용으로 유지.

#### modifier

| modifier | 효과 | prototype |
|---|---|---|
| `dot` (default `true`) | 좌측 도트 (variant 색 자동) | prototype 의 모든 사용처가 dot 사용 |

---

### 4.5 Chip

#### variant
- 변종 없음 (단일 외형). 활성/비활성은 **state** 의 `active` 로 처리.

#### size
- 단일 사이즈. CSS 토큰 ~`5px 10px` padding / 13px / radius 6.
- (낮은 우선순위) v2 에서 EventDetail 기술 스택 칩이 EventList 필터 칩보다 살짝 작음 — 통합 후 단일 사이즈 표준화. 시각 차이는 § 4 검토 대상.

#### state

| state | 효과 | prototype 사용처 |
|---|---|---|
| `default` | 기본 surface + border | EventList 비활성 카테고리 / 비활성 기술 스택, EventDetail 기술 스택 |
| `hover` | borderColor → text-2 (CSS 클래스) | 모든 인터랙션 칩 (EventList 필터) |
| `active` | brand light bg + brand text + brand border | EventList "전체" / 선택된 카테고리 / 선택된 기술 스택 |
| `focus-visible` | brand outline ring (키보드 접근성) | prototype 미구현 → v2 에서 신규 추가 |
| `disabled` | opacity 0.5 + cursor not-allowed | prototype 미사용 → v2 에서 미래 확장 슬롯 |

> EventDetail 의 기술 스택 칩은 active/onClick 없이 표시 전용으로 사용됨 — `active` prop 미지정 + `onClick` 미지정 시 비-인터랙션 모드(`pointer-events: none` 또는 `<span>` 으로 렌더). § 5 에서 polymorphic 회피 위해 단순히 onClick 유무로 분기하는 정책 채택 검토.

#### modifier

| modifier | 효과 | prototype 사용처 |
|---|---|---|
| `count` | 라벨 우측에 작은 카운트 숫자 (opacity 0.6, 10.5px) | EventList 카테고리 칩 (`전체 8`, `컨퍼런스 3` 등) |

#### prototype 에서 실제 사용된 케이스

| 콘텐츠 | active | count | onClick | 사용처 |
|---|:---:|:---:|:---:|---|
| 카테고리 라벨 (`전체` / `컨퍼런스` / ...) | toggle | O | O (setCat) | EventList SearchAndFilters |
| 기술 스택 라벨 (`Java` / `React` / ...) | toggle | X | O (setStack 토글) | EventList SearchAndFilters |
| 기술 스택 라벨 (`Java` / `React` / ...) | X | X | X | EventDetail 헤더 (표시 전용) |

---

> **다음 턴**: § 4.6 Button, § 4.7 Input (PR 2). § 4.8 Card, § 4.9 SectionHead (PR 3). 이후 § 4.10~ PR 4 composite.


## 5. 파일 구조 / 명명 규칙
(작성 예정)

## 6. 의존성 그래프
(작성 예정)

## 7. PR 별 파일 생성 순서
(작성 예정)
