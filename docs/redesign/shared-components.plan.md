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

### 4.6 Button

#### variant

| variant | bg / text / border | prototype 사용처 |
|---|---|---|
| `primary` (default) | bg `brand` / text `#fff` / border 없음 | Login("로그인"), Cart("결제하기" / 빈 상태 "이벤트 둘러보기"), EventDetail("바로 구매하기"), MyPage("충전하기"), Landing(Hero "이벤트 둘러보기" / CTA "시작하기"), EventList 빈 상태("필터 초기화") |
| `ghost` | bg transparent / text `text-2` / border `border-2` | EventDetail("장바구니에 담기" / "매진된 이벤트입니다"), Cart("삭제"), MyPage("프로필 수정" / "출금 요청"), Landing("빠른 검색") |

> **`danger` variant**: prototype 미사용. v2 phase 1 PR 2 범위에서 도입 안 함. 환불/탈퇴 등 위험 액션이 등장하면 후속 PR 에서 추가.

#### size

| size | 높이 / padding / 폰트 | prototype 사용처 |
|---|---|---|
| `sm` | h 28 / `0 10px` / 12.5px | Cart "삭제", MyPage "프로필 수정", EventList "필터 초기화" |
| `md` (default) | h 36 / `0 14px` / 13.5px | Cart 빈 상태 "이벤트 둘러보기", MyPage "충전하기" / "출금 요청" |
| `lg` | h 44 / `0 18px` / 14px | Login "로그인", EventDetail "바로 구매하기" / "매진된 이벤트입니다", Cart "결제하기", Landing Hero CTA / 페이지 하단 CTA |

#### state

| state | 트리거 | 시각 |
|---|---|---|
| `default` | - | variant 기본 |
| `hover` | mouse over | primary: bg `brand-hover`, ghost: bg `surface-2` |
| `active` | mouse down | bg 추가 darken / scale 0.98 (CSS 토큰 결정) |
| `focus-visible` | 키보드 포커스 | brand outline ring (prototype 미구현 → v2 신규) |
| `disabled` | `disabled` prop | opacity 0.5 + cursor not-allowed | EventDetail "매진된 이벤트입니다", Login 로그인 중 |
| `loading` | `loading` prop | iconStart 자리에 회전 스피너 (`◐`), 텍스트 children 그대로, 자동 `disabled` | Login (회전 애니메이션 `@keyframes spin`) |

> **disabled 와 loading 구분**: prototype Login 은 `disabled={loading}` + 텍스트 변경(`로그인 중...`) 으로 처리. v2 에서는 `<Button loading>로그인</Button>` 한 줄로 동등 동작 (children 텍스트는 그대로, 스피너 자동, disabled 자동).

#### modifier

| modifier | 효과 | prototype 사용처 |
|---|---|---|
| `full` | width 100% | Login "로그인", EventDetail "바로 구매하기" / "장바구니에 담기" / "매진된 이벤트입니다", Cart "결제하기" |
| `iconStart` | 좌측 슬롯 | EventDetail 장바구니(`cart`), Cart 삭제(`trash`), MyPage 충전(`plus`) / 출금(`wallet`), Landing 빠른 검색(`search`) |
| `iconEnd` | 우측 슬롯 | Landing 빠른 검색의 `<Kbd>⌘K</Kbd>` (kbd 도 ReactNode 슬롯에 들어감) |

> Landing Hero "이벤트 둘러보기 →" / CTA "시작하기 →" 의 `→` 는 prototype 에서 인라인 텍스트(`<span style={{ opacity: 0.7 }}>→</span>`). v2 에서는 children 안에 텍스트로 유지하거나 `iconEnd` 에 화살표 아이콘 — **children 텍스트 유지** 채택 (단순 글리프).

#### prototype 에서 실제 사용된 조합 매트릭스

| 라벨 | variant | size | full | iconStart | state |
|---|---|---|:---:|---|---|
| 로그인 | primary | lg | O | (loading 시 스피너) | loading 가능 |
| 로그인 중... | primary | lg | O | 스피너 | loading + disabled |
| 결제하기 | primary | lg | O | - | default |
| 바로 구매하기 | primary | lg | O | - | default |
| 장바구니에 담기 | ghost | md | O | `cart` | default |
| 매진된 이벤트입니다 | ghost | lg | O | - | disabled |
| 이벤트 둘러보기 (Cart 빈 상태) | primary | md | X | - | default |
| 이벤트 둘러보기 (Landing Hero) | primary | lg | X | - | default |
| 빠른 검색 ⌘K | ghost | lg | X | `search` | default (+ iconEnd Kbd) |
| 시작하기 → | primary | lg | X | - | default |
| 충전하기 | primary | md | X | `plus` | default |
| 출금 요청 | ghost | md | X | `wallet` | default |
| 삭제 | ghost | sm | X | `trash` | default |
| 프로필 수정 | ghost | sm | X | - | default |
| 필터 초기화 | primary | sm | X | - | default |

---

### 4.7 Input

#### variant

| variant | 외형 | prototype 사용처 |
|---|---|---|
| `default` (default) | 단정한 폼 인풋. h 42 / radius 8 / border `border-2`. label + error 슬롯 표준 사용 | Login 이메일 / 비밀번호 |
| `code` | 검색바 / 터미널 톤. h 44 / `.code-input` 패턴 / iconStart + hintEnd 슬롯 표준 | EventList 검색바 |

> **`palette` variant**: CommandPalette 의 `.palette-input` 은 모달 chrome 의 일부로 본 § 4 Input 에 통합 안 함. `layout.plan.md` 에서 다룸.
>
> **variant 도입 사유**: prototype 의 두 인풋이 단순 modifier 차이가 아니라 **shape · 사용 맥락 · 슬롯 활용 패턴이 모두 다름**. variant 로 분리하는 편이 default 케이스의 props 표면을 단순하게 유지함.

#### size
- 단일 사이즈 (variant 가 사실상 사이즈 토큰을 결정 — default 42 / code 44).
- `size?: 'md' | 'lg'` 는 PR 2 범위에서 도입 안 함 (prototype 두 사용처 모두 ~42~44 안에 수렴).

#### state

| state | 트리거 | 시각 | prototype |
|---|---|---|---|
| `default` | - | border `border-2` | 모든 사용처 기본 |
| `focus` | input focus | border `brand` + soft glow (box-shadow `brand` 0.1 alpha) | Spec § 1 명시 (prototype CSS 토큰에 정의) |
| `error` | `error` prop 존재 | border `danger`, 하단에 `× {error}` 12px danger 텍스트 | Login 이메일 형식 오류 ("올바른 이메일 형식이 아닙니다") |
| `disabled` | `disabled` prop | opacity 0.5 + bg `surface-2` + cursor not-allowed | prototype 미사용 → v2 신규 (필요 시) |
| `readonly` | `readOnly` prop (HTML attr) | 동일 외형, caret 없음 | prototype 미사용 |

> **focus + error 동시**: 에러 상태에서도 focus 시 border 는 `danger` 유지하되 glow 만 추가 (Spec § 1 의 "focus 시 border brand + soft glow" 는 default state 한정으로 해석).

#### modifier

| modifier | 효과 | prototype 사용처 |
|---|---|---|
| `label` | 인풋 위 13px text-2 라벨 + 자동 `htmlFor` 연결 | Login "이메일" / "비밀번호" |
| `error` | 인풋 아래 12px danger 메시지 (`× {error}` 형식) | Login 이메일 검증 실패 시 |
| `iconStart` | 인풋 내부 좌측 (variant `code` 표준) | EventList 검색바 (`search` 16px) |
| `hintEnd` | 인풋 내부 우측 (variant `code` 표준) | EventList 검색바 (`<Kbd>/</Kbd>`) |

#### prototype 에서 실제 사용된 조합 매트릭스

| 사용처 | variant | label | error | iconStart | hintEnd | placeholder |
|---|---|---|---|---|---|---|
| Login 이메일 | default | "이메일" | (조건부) "올바른 이메일 형식이 아닙니다" | - | - | "you@example.com" |
| Login 비밀번호 | default | "비밀번호" | - | - | - | (없음) |
| EventList 검색바 | code | - | - | `search` | `<Kbd>/</Kbd>` | "이벤트명이나 기술 스택으로 검색" |

> **외부 ref 호출**: EventList 의 `/` 단축키가 `window.__focusSearch = () => inputRef.current?.focus()` 로 input ref 에 직접 접근. v2 에서는 `forwardRef` 적용된 `<Input variant="code" ref={searchRef} />` 로 동등 동작 보장 (§ 3.2 시그니처대로).

---

### 4.8 Card

#### variant

| variant | border / bg | radius | prototype 사용처 |
|---|---|---|---|
| `solid` (default) | `1px solid var(--border)` / `var(--surface)` | 12 (`.flat-card` 토큰) | Login(폼), Cart(아이템·요약), EventDetail(info·purchase), MyPage(티켓·orders·wallet) |
| `dashed` | `1px dashed var(--border-2)` / `linear-gradient(135deg, var(--brand-light) 0%, transparent 70%)` | 12 | Landing 페이지 하단 CTA 박스 |

> **`dashed` variant 도입 사유**: prototype 의 Landing CTA 박스(`Landing.jsx:248-267`) 가 `.flat-card` 클래스 없이 인라인으로 구성됐지만, 시각 역할이 "강조용 카드 컨테이너"로 동일 → Card variant 로 통합. 그라디언트 끝점(`70%`) 은 토큰화 검토(§ 5).

#### size (= padding)

| size | px | prototype 사용처 |
|---|---|---|
| `none` | 0 | EventDetail purchase 패널(외곽 0, 내부에서 padding), MyPage 티켓 카드(stripe 위해 0), MyPage orders 테이블 wrapper |
| `sm` | 16 | Cart 아이템 카드 |
| `md` (default) | 20 | Cart 주문 요약 |
| `lg` | 28 | Login 폼, MyPage wallet 카드 |

> **EventDetail info 카드 (`padding: '4px 0'`)**: 인라인의 비대칭 padding 은 각 `InfoRow` 가 `12px 16px` 자체 padding 을 가지기 때문 → v2 에서는 `padding="none"` + InfoRow(MetaLine) 자체 padding 으로 동등 처리.
>
> **Landing CTA (`padding: '28px 32px'`)**: `lg` 와 약간 다름. v2 phase 1 에서는 `lg` 토큰으로 흡수(28×28). 디자인 검토 후 필요시 별도 토큰.

#### state

| state | 트리거 | 시각 | prototype |
|---|---|---|---|
| `default` | - | base border + bg | 모든 사용처 |
| `hover` | mouse over (when `interactive=true`) | border → `text-2`, translateY `-2px`, shadow soft | prototype 의 `.flat-card` 사용처에는 미적용 — interactive 카드는 모두 bespoke (CategoryTile / FeaturedRow / EventCard) |
| `focus-visible` | 키보드 포커스 (when `interactive=true`) | brand outline ring | prototype 미구현 → v2 신규 |

> **prototype 의 `.flat-card` 는 인터랙션 없음**: prototype 에서 hover-able 한 카드형 UI(CategoryTile / FeaturedRow / EventCard)는 모두 `.flat-card` 가 아닌 자체 인라인 스타일. 본 Card 컴포넌트의 `interactive` 모드는 § 1.5 메모대로 페이지 전용 컴포넌트로 흡수되므로 PR 3 시점에는 **사용처 0**. 그러나 § 3.3 시그니처에 정의된 prop 이므로 spec 으로 유지.

#### modifier

| modifier | 효과 | prototype |
|---|---|---|
| `interactive` (default `false`) | hover lift + cursor pointer + focus-visible ring | (사용처 0, 향후 페이지 전용 컴포넌트가 필요 시 활용) |
| `style.overflow` 등 native style | `...rest` 로 통과 | EventDetail purchase / MyPage 티켓 (`overflow: hidden` 으로 stripe 잘림 방지) |
| `onClick` | `HTMLAttributes` 로 통과 | (사용처 0 — `interactive=true` 와 함께 사용 권장) |

#### prototype 에서 실제 사용된 조합 매트릭스

| 사용처 | variant | padding | interactive | overflow hidden | 비고 |
|---|---|---|:---:|:---:|---|
| Login 폼 | solid | lg | - | - | 폼 전체를 감쌈 |
| Cart 아이템 카드 | solid | sm | - | - | flex row 레이아웃 (children 인라인) |
| Cart 주문 요약 | solid | md | - | - | sticky (외부에서 `style.position` 부여) |
| EventDetail info | solid | none | - | - | InfoRow 가 자체 padding 보유 |
| EventDetail purchase | solid | none | - | O | sticky, 내부 div 에서 padding 20 |
| MyPage 티켓 카드 | solid | none | - | O | 좌측 stripe 그라디언트 위해 overflow hidden |
| MyPage orders 테이블 | solid | none | - | O | `<table>` wrapper |
| MyPage wallet | solid | lg | - | - | 38px 큰 숫자 표시 |
| Landing CTA | dashed | lg | - | - | brand-light 그라디언트 |

---

### 4.9 SectionHead

#### variant
- 변종 없음 (단일 외형). h2 20px / mono `// hint` / caption / 우측 action 슬롯 / `border-bottom 1px solid var(--border)`.

> **CTA 미니헤드(`Landing.jsx:255-262`) 통합 검토**: prototype 의 Landing 페이지 하단 CTA 박스 안에 `// get started` + h3 + p 패턴이 있지만, h3 사이즈와 border-bottom 부재로 SectionHead 와 시각이 명확히 다름. **PR 3 범위에선 별도 패턴으로 두고 통합 안 함** (Landing page plan 의 CTA 컴포넌트로 흡수). 향후 사용처 1곳 더 등장 시 `variant: 'compact'` 도입 재검토.
>
> **EventList 결과 카운트 헤더(`EventList.jsx:243-250`) 통합 검토**: 동일하게 border-bottom + 2-column 패턴이지만 h2 가 없고 `font-size: 14` 작은 라벨 → SectionHead 의 축소 변종 후보지만 props 차이가 커 통합 안 함. `MetaLine` / `Eyebrow` 와 별개의 "result-count header" 패턴으로 페이지 plan 에서 처리.

#### size
- 단일 사이즈. CSS 토큰 hint mono 11px / title 20px semibold / caption 13px text-3 / pb 12 / mb 16.
- (낮은 우선순위) v2 에서 `level?: 2 | 3` 도입 가능 — 시맨틱 마크업 변경용 (`<h2>` ↔ `<h3>`). 시각은 유지. **PR 3 범위에선 h2 고정**.

#### state
- 자체 state 없음 (콘텐츠 컨테이너 헤더).
- action 슬롯 안의 `<a>` / `<Button>` 은 자체 hover/focus 를 가짐 (SectionHead 가 관여 안 함).

#### modifier (모두 옵셔널 슬롯)

| modifier | 효과 | prototype 사용처 |
|---|---|---|
| `hint` | h2 위에 mono `// {hint}` 작은 라벨 | Landing 카테고리(`category`), Landing Featured(`featured`) |
| `caption` | h2 아래 13px text-3 부제 1줄 | Landing 카테고리("관심 있는 포맷을 선택해보세요"), Landing Featured("마감 임박 및 신규 오픈 순") |
| `action` | 우측 슬롯 (링크 / 버튼 / Eyebrow / Kbd 등 ReactNode) | Landing Featured(`<a>전체 보기 →</a>`) |

> `hint`, `caption`, `action` 모두 옵셔널이므로 셋 다 없으면 사실상 단순 h2. prototype 에는 그런 사용처 없음.

#### prototype 에서 실제 사용된 조합 매트릭스

| 사용처 | title | hint | caption | action |
|---|---|---|---|---|
| Landing 카테고리 섹션 | "카테고리별 이벤트" | "category" | "관심 있는 포맷을 선택해보세요" | - |
| Landing Featured 섹션 | "이번 주 주목할 이벤트" | "featured" | "마감 임박 및 신규 오픈 순" | `<a>전체 보기 →</a>` |

> **사용처 빈도 메모**: prototype 사용 2회. § 1.4 의 분류 기준(2회 이상 또는 2개 페이지 이상)을 가까스로 만족. SPEC § 0 의 명시 항목이라 PR 3 에 포함하되, 페이지 분포가 Landing 한 곳에 쏠려 있어 **컴포넌트 승격 vs Landing 전용** 검토 여지 있음 → SPEC 명시이므로 공용으로 결정 (단, action 슬롯에 `<Eyebrow>` / `<Kbd>` 가 들어가는 케이스가 phase 2 에서 나올 것을 가정).

---

### 4.10 TermDot

#### variant (tone)

| tone | 색 | prototype 사용처 |
|---|---|---|
| `term-green` (default) | `var(--term-green)` | EventList Hero(eyebrow 안), Landing Hero(eyebrow 안), MyPage 프로필(`●` 문자로 인라인), LY Sidebar 세션 행, LY StatusBar 사용자 행 |
| `brand` | `var(--brand)` | (prototype 미사용 — 향후 확장) |
| `danger` | `var(--danger)` | (prototype 미사용 — 향후 확장) |

#### size

| size | 사용 |
|---|---|
| `6` (default) | prototype 의 모든 사용처 |
| `4` | (낮은 우선순위) MyPage 의 ONLINE `●` 문자 통합 시 활용 가능 |

→ `size?: number` 자유 입력. 시각적으로 자연스러운 값은 `4` ~ `8`.

#### state
- 자체 state 없음 (시각 표시).

#### modifier
- 없음.

> **Eyebrow / StatusChip 의 dot 과의 관계**: Eyebrow 와 StatusChip 은 자체 dot 을 인라인 또는 CSS 의사요소로 가짐. TermDot 은 그 외 위치(헤더 / 사이드바 / 상태바)에서 단독으로 점만 표시할 때 쓰는 독립 컴포넌트. § 6.1 에 따라 PR 4 머지 후 Eyebrow 의 인라인 dot 을 TermDot 으로 치환하는 후속 정리는 옵셔널.

---

### 4.11 Avatar

#### variant
- 변종 없음 (단일 외형 — brand bg + 흰 모노 글자).
- v2 phase 2 에서 이미지 URL 지원 시 `variant: 'initial' | 'image'` 도입 가능.

#### size

| size | px | font-size | prototype 사용처 |
|---|---|---|---|
| `sm` | 36 | mono 14px / 700 | Login 페이지 상단 "DT" 브랜드 마크 |
| `md` (default) | 52 | mono 20px / 700 | MyPage 프로필 헤더 닉네임 이니셜 |
| `lg` | 72 | mono 28px / 700 | (prototype 미사용 — 향후 확장) |
| `number` | 임의 px | 자동 비율 | escape hatch |

#### state
- 자체 state 없음 (정적 표시).
- 클릭 가능 아바타가 필요해지면 호출자가 `<button>` 으로 감쌈 (Avatar 자체에 onClick 미통합).

#### modifier
- 없음 (initial 만).

#### prototype 에서 실제 사용된 케이스

| 사용처 | size | initial |
|---|---|---|
| Login 브랜드 마크 | sm (36) | "DT" (2글자 — brand 약자) |
| MyPage 프로필 | md (52) | 닉네임 첫글자 (`user.nickname.charAt(0).toUpperCase()`) |

> **2글자 케이스 처리**: Login "DT" 는 2글자. `initial: string` 그대로 받고 컴포넌트 내부에서 길이 제한 안 걸음. `toUpperCase()` 만 적용. font-size 는 size 가 결정.

---

### 4.12 AccentMediaBox

#### variant

| variant | 형태 | 그라디언트 방향 | prototype 사용처 |
|---|---|---|---|
| `box` (default) | 정사각 / 직사각 (size 가 결정) | `linear-gradient(135deg, ...)` | Cart thumb, EventDetail hero, Landing FeaturedRow |
| `stripe` | 폭 고정 + 높이 100% (부모 flex 행 안에서 세로 stripe) | `linear-gradient(180deg, ...)` | MyPage 티켓 카드 좌측 stripe |

> **`stripe` variant 도입 사유**: prototype 의 MyPage 티켓 stripe(`width: 56`, `linear-gradient(180deg, accent22, accent44)`)는 단일 정사각 박스 패턴이 아니라 부모 flex 의 세로 strip → axis(가로/세로) 가 다름. size + 그라디언트 방향이 함께 묶이는 별개 패턴이라 variant 로 분리.

#### size

| size | px | 그라디언트 alpha | glyph 폰트 | prototype 사용처 |
|---|---|---|---|---|
| `xs` (`box`) | 48×48 | `accent20` → `accent45` | mono 16px | Landing FeaturedRow |
| `sm` (`stripe`) | 56×100% | `accent22` → `accent44` (180deg) | size 결정 후 호출자 정함 | MyPage 티켓 카드 stripe |
| `md` (`box`, default) | 72×72 | `accent18` → `accent38` | mono 22px | Cart 아이템 thumb |
| `lg` (`box`) | 120×120 | (미정 — 사용처 생기면 결정) | (미정) | (prototype 미사용) |
| `hero` (`box`) | full×240 | `accent15` → `accent35` | mono 72px | EventDetail hero banner |

> **alpha 토큰**: prototype 이 사용한 hex alpha(`15`/`18`/`20`/`22`/`35`/`38`/`44`/`45`)는 size 별로 자동 결정. 호출자가 alpha 를 prop 으로 지정하지 않음. 컴포넌트 내부에 size→alpha 매핑 상수.
>
> **`size`/`variant` 조합 제약**: `stripe` variant 는 size `sm` 만 허용 (현재). 타입 차원에서 강제할지(discriminated union)는 § 3.4 시그니처 보강 시 결정 — 본 § 4 에선 표만 명시.

#### state
- 자체 state 없음 (정적 미디어 박스).
- hover/focus 가 필요한 케이스(Landing FeaturedRow, MyPage 티켓 카드)는 부모에서 처리 — AccentMediaBox 자체는 상태 없음.

#### modifier (slot)

| modifier | 효과 | prototype |
|---|---|---|
| `glyph` | 가운데 표시 콘텐츠. default `</>` (string) | Cart/Landing/EventDetail = `</>` 또는 `❯_`. MyPage 티켓 = `<Icon name="ticket" />` |
| `accent` (필수) | 그라디언트 베이스 색 hex | 호출자가 `accent(eventId)` 결과 전달 (§ 1.2 utility) |

#### prototype 에서 실제 사용된 조합 매트릭스

| 사용처 | variant | size | accent | glyph |
|---|---|---|---|---|
| Cart 아이템 thumb | box | md (72) | `accent(item.eventId)` | `</>` mono 22px |
| EventDetail hero banner | box | hero (240) | `accent(event.eventId)` | `❯_` mono 72px (opacity 0.35) |
| MyPage 티켓 stripe | stripe | sm (56×100%) | `accent(t.id)` | `<Icon name="ticket" size={20} />` |
| Landing FeaturedRow | box | xs (48) | `accent(ev.eventId)` | `</>` mono 16px |

> **EventDetail hero 의 opacity 0.35**: glyph 의 opacity 도 size 별로 자동 결정 (`hero` 는 0.35, 나머지는 0.8). 호출자가 지정 안 함.

---

### 4.13 QuantityStepper

#### variant
- 변종 없음 (단일 외형 — `−` / 숫자 / `+` 사각 버튼 묶음).

#### size

| size | 버튼 px | 라벨 폰트 | prototype 사용처 |
|---|---|---|---|
| `sm` | 28×28 / radius 6 / Icon 11 | font 14 / minWidth 20 | Cart 아이템 카드 (수량 변경) |
| `md` (default) | 34×34 / radius 6 / Icon 13 | font 16 / minWidth 28 | EventDetail 구매 패널 (수량 변경) |

#### state

| state | 트리거 | 시각 |
|---|---|---|
| `default` | - | 두 버튼 활성 |
| `at-min` | `value <= min` | `−` 버튼 disabled (opacity 0.5 + cursor not-allowed) |
| `at-max` | `value >= max` | `+` 버튼 disabled |
| `disabled` | `disabled` prop | 두 버튼 모두 disabled, 숫자 dim |
| (per-button) `hover` / `active` | mouse | 사각 버튼 자체 hover (border → text-2 등) |

> **min / max 경계 처리**: prototype 의 EventDetail 은 `Math.max(1, q-1)` / `Math.min(event.remainingQuantity, q+1)` 로 클램프. v2 컴포넌트에서는 `min` (default 1), `max` (옵셔널) 받아 컴포넌트가 클램프 + 경계 도달 시 해당 버튼 disabled 처리.
>
> **controlled 강제** (§ 3.0): `value` + `onChange` 필수. `defaultValue` 미지원.

#### modifier
- 없음 (size + min/max + disabled 만).

#### prototype 에서 실제 사용된 케이스

| 사용처 | size | min | max | 추가 조건 |
|---|---|---|---|---|
| EventDetail 구매 패널 | md | 1 | `event.remainingQuantity` | `event.price > 0 && canBuy` 일 때만 렌더 (호출자 책임) |
| Cart 아이템 카드 | sm | 1 | 무제한 (max prop 미지정) | (Cart 는 잔여 좌석 검증을 별도) |

---

### 4.14 MetaLine

#### variant
- 변종 없음 (단일 외형 — mono 라벨 + 값 한 줄).

#### size
- 단일 사이즈. 폰트 라벨 mono 10.5px / 값 12.5~14px (prototype 두 사용처 모두 비슷).

#### state
- 자체 state 없음.

#### modifier

| modifier | 효과 | prototype 사용처 |
|---|---|---|
| `compact` (default `true`) | 라벨 width 30 / 라벨 mono uppercase / icon 슬롯 미사용 | EventList EventCard 의 메타 3행 (일시 / 장소 / 주최) |
| `compact: false` | 라벨 minWidth 66 / 라벨 일반 케이스 / icon 슬롯 활성 (이모지 또는 Icon) | EventDetail InfoRow 4행 (📅 일시 / 📍 장소 / 👤 주최 / 🎫 잔여 좌석) |
| `icon` | 좌측 이모지/Icon 슬롯 (`compact: false` 일 때 의미 있음) | EventDetail InfoRow 의 이모지 4종 |
| `truncate` (default `true`) | 값에 `whitespace-nowrap` + `text-overflow: ellipsis` | EventList EventCard (장소 등 긴 텍스트). EventDetail InfoRow 는 `truncate=false` |

> **prototype 의 두 인라인 컴포넌트(EL `MetaLine` + ED `InfoRow`)를 통합**: 시각·역할이 같지만 라벨 폭과 icon 슬롯 유무가 다름 → `compact` 단일 modifier 로 두 모드 분기. § 3.4 시그니처에 `compact?: boolean` 추가.

#### prototype 에서 실제 사용된 조합 매트릭스

| 사용처 | compact | icon | truncate | 라벨 예 |
|---|:---:|---|:---:|---|
| EventList EventCard - 일시 | O | - | O | "WHEN" + "{d} · {t}" |
| EventList EventCard - 장소 | O | - | O | "WHERE" + 장소 앞 3단어 |
| EventList EventCard - 주최 | O | - | O | "WHO" + 호스트명 |
| EventDetail InfoRow - 일시 | X | "📅" | X | "일시" + 풀 datetime |
| EventDetail InfoRow - 장소 | X | "📍" | X | "장소" + 전체 주소 |
| EventDetail InfoRow - 주최 | X | "👤" | X | "주최" + 호스트명 |
| EventDetail InfoRow - 잔여 좌석 | X | "🎫" | X | "잔여 좌석" + 좌석 수 (또는 매진 노출) |

> **§ 3.4 시그니처 보강**: `compact?: boolean` modifier 를 추가해야 함. 본 § 4.14 결정에 따라 § 3 업데이트는 PR 4 작업 시 함께 진행.

---

### 4.15 EmptyState

#### variant
- 변종 없음 (단일 surface — `.stack-trace` 톤 흡수). v2 에서는 `empty-state.css` 안에 자체 surface.

#### size
- 단일 사이즈. padding 40 / 이모지 40px / title 17px / message 14px (prototype 3개 사용처 모두 동일).

#### state
- 자체 state 없음 (정적).
- `action` 슬롯 안의 `<Button>` 은 자체 state 가짐.

#### modifier (모두 옵셔널)

| modifier | 효과 | prototype 사용처 |
|---|---|---|
| `emoji` | 큰 이모지 (40px). 미지정 시 미렌더 | EventList = 🔍, Cart = 🛒, MyPage 환불 = 💳 |
| `title` (필수) | 17px 본문 톤 헤드라인 | EventList = "검색 결과가 없습니다", Cart = "장바구니가 비어있습니다", MyPage = "환불 내역이 없습니다" |
| `message` | 14px text-3 본문 (`ReactNode` — `<strong>` 강조 등 가능) | EventList / Cart / MyPage 모두 사용 |
| `action` | 하단 액션 슬롯 (보통 `<Button>`) | EventList = "필터 초기화", Cart = "이벤트 둘러보기". MyPage 환불 = action 없음 |

#### prototype 에서 실제 사용된 조합 매트릭스

| 사용처 | emoji | title | message 특이사항 | action |
|---|---|---|---|---|
| EventList 빈 결과 | 🔍 | "검색 결과가 없습니다" | 일반 텍스트 + 추가 hint 텍스트 (한 줄 더) | `<Button variant="primary" size="sm">필터 초기화</Button>` |
| Cart 빈 상태 | 🛒 | "장바구니가 비어있습니다" | 일반 텍스트 | `<Button variant="primary">이벤트 둘러보기</Button>` |
| MyPage 환불 빈 상태 | 💳 | "환불 내역이 없습니다" | `<strong>` 강조 포함 ("내 티켓") | (없음) |

> **EventList 의 hint 추가 줄**: prototype 은 `.hint` 클래스로 한 줄 더 추가. v2 에서는 `message` 가 `ReactNode` 이므로 호출자가 `<>{...}<br/>{...}</>` 또는 `<div>` 묶음으로 표현. EmptyState 자체에 별도 슬롯 추가 안 함.



## 5. 파일 구조 / 명명 규칙

### 5.1 결정 (Spec § 9 와 합치)

| 항목 | 결정 | 사유 |
|---|---|---|
| 폴더 vs 단일 파일 | **폴더 per component** (`src/components-v2/Button/`) | 타입/테스트/스토리 co-located, 단순 컴포넌트도 동일 규칙 (일관성). § 3.7 디렉토리 매핑과 일치 |
| 진입점 | `index.tsx` 가 re-export 만, 구현은 `{Name}.tsx` | `import { Button } from '@/components-v2/Button'` 로 깊이 1 안에 멈춤. 내부 분해(타입/헬퍼)에 영향 없음 |
| export 방식 | **named export 만**. default export 금지 | auto-import 및 grep 친화. 오타 시 컴파일 에러 |
| 타입 export | public 타입은 `index.tsx` 에서 `export type` 으로 재노출. `Props` 와 `Variant` / `Size` 등 모두 포함 | 호출자가 `import type { ButtonProps, ButtonVariant }` 가능 |
| 타입 파일 분리 | 타입 ≥ 2개 또는 인터페이스 길어지면 `{Name}.types.ts` 로 분리. 단순한 경우 `{Name}.tsx` 안에 동거 | 작은 컴포넌트(Kbd / TermDot) 는 단일 파일로 충분 |
| 스타일 위치 | **`src/styles-v2/components/{kebab-name}.css`**. 컴포넌트는 `className` 으로 참조만 | Spec § 9 결정: 전역 CSS + className. CSS Module / styled-components 미사용 |
| 스타일 import | `src/styles-v2/index.css` 가 컴포넌트 CSS 를 모두 import. 앱 진입점에서 한 번만 로드 | 컴포넌트가 자기 CSS 를 직접 import 하지 않음 (트리쉐이킹보다 단순성 우선, prototype 과 일치) |
| 동적 스타일 | `accent` 컬러처럼 prop 기반 동적 값만 인라인 `style={{}}` 허용 | Spec § 0 "UI 작업 원칙" 일치 |
| 클래스 명명 | block: `kebab-case`. variant: `block-variant` 접미사. state: `is-state` 접두사 | prototype 의 `.btn .btn-primary .btn-sm` 컨벤션 유지 + state 만 `is-` 로 정리 |
| 컴포넌트 / 파일명 | PascalCase (`Button`, `StatusChip`, `AccentMediaBox`). CSS 파일은 kebab-case (`status-chip.css`, `accent-media-box.css`) | TS 표준 / CSS 표준 분리 |
| 헬퍼 / 유틸 함수 | camelCase. `clsx` (또는 동등 헬퍼) 1개 의존. 자체 `cn` wrapper 도입 안 함 | 표준 라이브러리 그대로 |
| 테스트 파일 | `{Name}.test.tsx` co-located. **PR 1~4 범위에선 옵셔널** (smoke 테스트 우선) | 기존 프로젝트 테스트 도구 사용 (Vitest 가정). 의무화는 phase 2 |
| 스토리북 | 도입 안 함 (phase 1) | 추가 의존성 부담. 시각 검증은 페이지 통합으로 대체 |
| 배럴 | `src/components-v2/index.ts` 가 모든 컴포넌트 + 타입 re-export | `import { Button, Card, Icon } from '@/components-v2'` 단일 라인 |

### 5.2 표준 폴더 레이아웃

```
src/components-v2/
├── Button/
│   ├── index.tsx              ← re-export 만
│   ├── Button.tsx             ← 구현 (forwardRef + JSX)
│   ├── Button.types.ts        ← 타입 (변수 ≥2개일 때만 분리)
│   └── Button.test.tsx        ← 옵셔널, smoke 테스트
├── Kbd/
│   ├── index.tsx
│   └── Kbd.tsx                ← 단순 컴포넌트는 타입 동거
├── ...
└── index.ts                   ← 배럴 re-export

src/styles-v2/
├── tokens.css                 ← tokens.plan.md 결정 변수
├── globals.css                ← reset + 폰트 / 공통 키프레임 (`@keyframes spin` 등)
├── components/
│   ├── button.css
│   ├── input.css
│   ├── card.css
│   ├── chip.css
│   ├── status-chip.css
│   ├── kbd.css
│   ├── eyebrow.css
│   ├── section-head.css
│   ├── term-dot.css
│   ├── avatar.css
│   ├── accent-media-box.css
│   ├── quantity-stepper.css
│   ├── meta-line.css
│   └── empty-state.css
└── index.css                  ← 위 파일 전체 import 배럴
```

> Icon / FileIcon 은 SVG 마크업이라 별도 CSS 거의 없음 (currentColor + size prop 으로 충분). 필요 시 `icon.css` 추가.

### 5.3 예시: Button 컴포넌트의 파일 구조

```
src/components-v2/Button/
├── index.tsx
├── Button.tsx
├── Button.types.ts
└── Button.test.tsx        (PR 2 범위 — smoke 만)
```

**`Button/index.tsx`** — re-export 전용

```tsx
export { Button } from './Button';
export type { ButtonProps, ButtonVariant, ButtonSize } from './Button.types';
```

**`Button/Button.types.ts`**

```ts
import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  full?: boolean;
  loading?: boolean;
  iconStart?: ReactNode;
  iconEnd?: ReactNode;
  children: ReactNode;
}
```

**`Button/Button.tsx`**

```tsx
import { forwardRef } from 'react';
import clsx from 'clsx';
import type { ButtonProps } from './Button.types';

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    full = false,
    loading = false,
    iconStart,
    iconEnd,
    type = 'button',
    disabled,
    className,
    children,
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={clsx(
        'btn',
        `btn-${variant}`,
        `btn-${size}`,
        full && 'btn-full',
        loading && 'is-loading',
        className,
      )}
      {...rest}
    >
      {loading ? <span className="btn-spinner" aria-hidden /> : iconStart}
      <span className="btn-label">{children}</span>
      {iconEnd}
    </button>
  );
});
```

**`src/styles-v2/components/button.css`** (스타일은 전부 여기)

```css
.btn { /* base: display/align/radius/font/transition */ }
.btn-primary { /* bg brand / color #fff */ }
.btn-primary:hover { /* bg brand-hover */ }
.btn-ghost { /* bg transparent / border border-2 */ }
.btn-sm { /* h 28 / padding 0 10 / font 12.5 */ }
.btn-md { /* h 36 / padding 0 14 / font 13.5 */ }
.btn-lg { /* h 44 / padding 0 18 / font 14 */ }
.btn-full { width: 100%; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.btn.is-loading .btn-spinner { animation: spin 0.8s linear infinite; }
.btn-label { /* gap 처리 */ }
```

**`src/styles-v2/index.css`** (배럴 — 컴포넌트 추가 시 한 줄 추가)

```css
@import './tokens.css';
@import './globals.css';
@import './components/button.css';
@import './components/input.css';
/* ... 나머지 컴포넌트 ... */
```

**`src/components-v2/index.ts`** (컴포넌트 배럴)

```ts
export { Button } from './Button';
export type { ButtonProps, ButtonVariant, ButtonSize } from './Button';
export { Icon } from './Icon';
export type { IconProps, IconName } from './Icon';
// ... 나머지 ...
```

### 5.4 명명 규칙 요약

| 대상 | 규칙 | 예 |
|---|---|---|
| 컴포넌트 | PascalCase | `StatusChip`, `AccentMediaBox` |
| 컴포넌트 파일 | `{Name}.tsx` | `StatusChip.tsx` |
| 타입 파일 | `{Name}.types.ts` (분리 시) | `Button.types.ts` |
| 테스트 파일 | `{Name}.test.tsx` | `Button.test.tsx` |
| CSS 파일 | kebab-case `{name}.css` | `status-chip.css`, `accent-media-box.css` |
| CSS 블록 클래스 | kebab-case 단어 | `.status-chip`, `.accent-media-box` |
| CSS variant 클래스 | `{block}-{variant}` | `.btn-primary`, `.status-chip-ok` |
| CSS state 클래스 | `is-{state}` | `.is-active`, `.is-loading` |
| 타입 (variant union) | `{Name}Variant` / `{Name}Size` / `{Name}Tone` | `ButtonVariant`, `AvatarSize` |
| 슬롯 prop | `{position}{Slot}` | `iconStart`, `iconEnd`, `hintEnd` |

---

## 6. 의존성 그래프

### 6.0 분류 정의

- **직접 import 의존**: 컴포넌트 파일 내부에서 다른 컴포넌트를 `import` 해서 직접 렌더 → **머지 순서에 영향**
- **슬롯 의존**: prop 으로 `ReactNode` 받음. 호출자가 인스턴스 주입. 컴포넌트 자체는 의존 없음 → **머지 순서 무관 (타입 시그니처만 호환되면 됨)**
- **CSS 토큰 의존**: `var(--xxx)` 참조. tokens.css 만 있으면 됨
- **CSS 클래스 의존**: 다른 컴포넌트의 클래스를 사용하지 않는 것을 원칙 (클래스 격리). 위반 사례는 명시

### 6.1 컴포넌트 → 컴포넌트 (직접 import)

| 의존하는 쪽 | 의존 대상 | 사유 |
|---|---|---|
| **QuantityStepper** | **Icon** | 컴포넌트 내부에서 `+` / `−` 버튼을 직접 렌더 (`<Icon name="plus" />` / `<Icon name="minus" />`) |
| (선택) **Eyebrow** | **TermDot** | PR 1 시점에는 자체 인라인 dot. PR 4 머지 후 `dot=true` 일 때 `<TermDot />` 로 치환 — **선택적 후속 리팩터** |

→ **직접 import 의존은 단 1개 (QuantityStepper → Icon)**. 나머지는 모두 슬롯 의존.

### 6.2 컴포넌트 → 컴포넌트 (슬롯 의존, 참고용)

머지 순서에는 영향 없지만 호출자가 어떤 컴포넌트를 슬롯에 넣을 가능성이 큰지 식별.

| 컴포넌트 | 슬롯 | 통상 주입되는 것 |
|---|---|---|
| Button | `iconStart`, `iconEnd` | Icon (대다수), Kbd (Landing 빠른 검색의 ⌘K) |
| Input | `iconStart`, `hintEnd` | Icon, Kbd |
| SectionHead | `action` | anchor `<a>` (Landing Featured "전체 보기 →"), 향후 Button / Eyebrow / Kbd |
| EmptyState | `action` | Button (대다수) |
| MetaLine | `icon` | Icon, 또는 이모지 string |
| Chip | (자체) | (없음 — 자체 텍스트만) |
| StatusChip | (자체) | (없음 — 자체 텍스트만) |
| Eyebrow | `children` | 텍스트 (특수 케이스 없음) |
| Card | `children` | 자유 |
| AccentMediaBox | `glyph` | 텍스트 글리프(`</>` / `❯_`) 또는 Icon |

> SectionHead, EmptyState, Card, Input, Button 등 슬롯 컴포넌트는 PR 1~4 머지 순서에 무관. 호출자(페이지) 가 import 시점에만 모든 컴포넌트 존재하면 됨.

### 6.3 컴포넌트 → styles-v2 의존

| 컴포넌트 | 자체 CSS 파일 | 추가 토큰 의존 (tokens.css) | 다른 컴포넌트 클래스 사용 |
|---|---|---|---|
| Icon | (없음 — currentColor + size prop) | (없음) | - |
| FileIcon | (없음) | (없음) | - |
| Kbd | `kbd.css` | `--font-mono`, `--text-3`, surface | - |
| Eyebrow | `eyebrow.css` | `--term-green*`, `--brand-light`, `--brand` (tone 변종), `--font-mono` | - |
| StatusChip | `status-chip.css` | `--term-green*`, `--danger*`, `--brand-light`, `--brand`, surface-2, `--text-3` (variant 별 색) | - |
| Chip | `chip.css` | `--brand-light`, `--brand`, `--border`, `--text-2` (active / hover) | - |
| Button | `button.css` | `--brand`, `--brand-hover`, `--border-2`, `--surface-2`, `--text-2`, `--danger` (focus), `@keyframes spin` (`globals.css` 또는 자체) | - |
| Input | `input.css` | `--editor-bg`, `--border-2`, `--brand`, `--danger`, `--text-2`, `--font` | (variant `code` 일 때 내부 `iconStart` 슬롯에 Icon 들어가지만 클래스 의존 아님) |
| Card | `card.css` | `--surface`, `--border`, `--border-2`, `--brand-light` (dashed variant) | - |
| SectionHead | `section-head.css` | `--font-mono`, `--text-4`, `--text`, `--text-3`, `--border` | action 슬롯에 anchor/Button 들어가지만 클래스 의존 아님 |
| TermDot | `term-dot.css` | `--term-green`, `--brand`, `--danger` (tone 별) | - |
| Avatar | `avatar.css` | `--brand`, `--font-mono` | - |
| AccentMediaBox | `accent-media-box.css` | `--font-mono`, `--border` | accent hex 는 prop (CSS 의존 아님) |
| QuantityStepper | `quantity-stepper.css` | `--border-2`, `--editor-bg`, `--text-2` | - |
| MetaLine | `meta-line.css` | `--font-mono`, `--text-4`, `--text-2` | - |
| EmptyState | `empty-state.css` | `--surface`, `--border`, `--text`, `--text-3`, `.stack-trace` 변형 패턴 흡수 | (action 슬롯의 Button 클래스 의존 없음) |

#### styles-v2 유틸/공통 클래스
- `.stack-trace` (prototype globals): EmptyState 의 surface 변형 기반. v2 에서는 `empty-state.css` 안으로 흡수해 `.stack-trace` 직접 사용 안 함 (격리).
- `@keyframes spin`: Button loading 스피너용. `globals.css` 에 두고 Button CSS 가 참조.
- `clsx` (npm): 거의 모든 컴포넌트가 className 병합용으로 import. styles-v2 가 아닌 npm 의존.
- `accent(eventId)` / `fmtDate` / `fmtPrice`: utility 함수 (컴포넌트가 아닌 페이지/호출자 책임). § 1.5 메모대로 `src/lib/utils` 또는 `src/styles-v2/accent.ts` 로 이전 — 본 § 6 의 컴포넌트 의존 그래프에는 포함 안 함.

### 6.4 공통 hub 식별

다른 컴포넌트의 슬롯에 가장 자주 들어가는 = **사실상 가장 먼저 필요한 것**.

| 컴포넌트 | 슬롯 진입 횟수 (§ 6.2 + § 4 매트릭스) | 직접 import 의존 받는 횟수 | 우선순위 등급 |
|---|---|---|---|
| **Icon** | Button(많음) / Input / SectionHead / MetaLine / AccentMediaBox / EmptyState | QuantityStepper 1건 | **S — 필수 hub. 모든 다른 PR 의 사실상 선결조건** |
| **Kbd** | Button(Landing) / Input(EventList 검색바) | 0건 | A — Input 의 `code` variant 와 함께 자주 쓰임 |
| **Button** | EmptyState(action) / SectionHead(action) | 0건 | A — composite 와 페이지 어디서나 쓰임 |
| **TermDot** | Eyebrow(후속 치환) | 0건 (선택적) | B — PR 1 의 Eyebrow 가 이미 인라인 dot 가짐. 우선순위 낮음 |
| **Card** | (없음 — 페이지 직접 사용) | 0건 | B — composite 의존 없음. 독립 머지 가능 |
| **SectionHead** | (없음) | 0건 | B — Landing 만 사용 |
| 그 외 | (없음 — 페이지 직접 사용) | 0건 | C — leaf |

### 6.5 § 7 머지 순서의 근거

위 그래프에서 다음을 도출:

1. **Icon 이 절대적 hub**: PR 1 안에 들어가지만 PR 1 의 다른 컴포넌트들과도 독립 → **PR 1 내부에서도 Icon 을 가장 먼저 구현/머지** 권장
2. **PR 1 의 Eyebrow / StatusChip / Chip / Kbd 는 Icon 미의존** → Icon 과 병렬 작업 가능
3. **PR 2 (Button / Input)** 는 Icon 의 슬롯 의존만 가짐 → PR 1 머지 후 진행
4. **PR 3 (Card / SectionHead)** 는 어느 컴포넌트에도 의존 없음 → PR 1 과 **병렬 머지 가능**. 사실상 PR 2 와도 병렬
5. **PR 4 (Composite 6개)** 중 직접 import 의존은 **QuantityStepper → Icon** 1건만. 나머지(TermDot / Avatar / AccentMediaBox / MetaLine / EmptyState) 는 PR 1 만 있으면 충분 → PR 4 는 PR 1 머지 후 진행 가능 (PR 2/3 머지 대기 불필요, 단 EmptyState 가 호출자에서 Button 받으므로 페이지 통합 시점은 PR 2 이후)
6. **Eyebrow → TermDot 후속 치환**은 별도 정리 PR (§ 7 에 옵셔널 단계로 표기)

이 결과를 § 7 의 PR 별 파일 생성 순서에 반영.


## 7. PR 별 파일 생성 순서

### 7.0 PR 머지 순서 (§ 6.5 결론 정리)

```
                  ┌─────────────► PR 2 (Form: Input → Button)
                  │
   PR 1 ─────────┼─────────────► PR 3 (Display: Card → SectionHead)   ← PR 2 와 병렬
   (Primitives)   │
                  └─────────────► PR 4 (Composite 6개)                ← § 4.10 작성 후 별도
```

| PR | 선결 PR | 병렬 가능 | 사유 |
|---|---|---|---|
| PR 1 | 없음 | - | Icon 이 모두의 hub. 가장 먼저 머지 |
| PR 2 | **PR 1** | PR 3 | Button/Input 의 슬롯에 Icon/Kbd 들어감 (호출 시점 의존) |
| PR 3 | **PR 1** (느슨) | PR 2 | 어느 컴포넌트도 직접 import 의존 없음. PR 1 머지 전이라도 작업 시작 가능, 머지는 PR 1 후 |
| PR 4 | **PR 1** | (PR 2/3 와 병렬 가능) | QuantityStepper → Icon 만 직접 의존. 나머지 5개는 PR 1 토큰 + slot |

### 7.0.1 검증 방법 (전 PR 공통)

§ 5 결정에 따라 **Storybook 도입 안 함**. 대안:

| 검증 | 도구 | 시점 |
|---|---|---|
| 타입 체크 | `tsc --noEmit` | 모든 commit |
| 린트 | `eslint` | 모든 commit |
| Smoke 테스트 | Vitest — render + 기본 props 변경 1~2개 | 컴포넌트별 1 파일 (`{Name}.test.tsx`). 옵셔널이지만 PR 1~4 권장 |
| 시각 검증 | **임시 showcase 라우트** `/_showcase` (dev 환경에서만 노출) | PR 마지막 commit 에서 해당 섹션 추가 |
| 페이지 통합 검증 | 실제 v2 페이지 plan PR 에서 사용 | 본 § 7 범위 밖 (별도 페이지 plan) |

#### Showcase 라우트 구조

```
src/pages-v2/_Showcase/
├── index.tsx                     ← 진입점 (router-toggle.plan.md 의 dev gate 따름)
└── sections/
    ├── PrimitivesSection.tsx     ← PR 1 마무리 commit 에서 추가
    ├── FormSection.tsx           ← PR 2 마무리 commit
    ├── DisplaySection.tsx        ← PR 3 마무리 commit
    └── CompositeSection.tsx      ← PR 4 마무리 commit
```

각 섹션은 컴포넌트별로 모든 variant × size × state 조합을 렌더. 디자이너/리뷰어 시각 검토용.

---

### 7.1 PR 1 — Primitives

**목표**: Icon 을 시작으로 PR 2~4 의 모든 의존을 해소.
**브랜치**: `claude/components-v2-pr1-primitives` (예시)
**전체 LOC**: ≈ 340 + 마무리 30 = **≈ 370**

#### Step 1.1 — Icon

| 항목 | 값 |
|---|---|
| 생성 파일 | `src/components-v2/Icon/index.tsx`, `Icon/Icon.tsx`, `Icon/Icon.types.ts` |
| LOC | ~118 (`Icon.tsx` 80 / `Icon.types.ts` 35 / `index.tsx` 3) |
| commit 권장 | **2 commits**: ① `feat(components-v2): add Icon types and paths` (types + paths 객체) → ② `feat(components-v2): add Icon component` (forwardRef wrapper) |
| 검증 | tsc / eslint / smoke test (`Icon.test.tsx`: 임의 name 렌더 확인 + size prop 변경) |
| 의존 | 없음 |

> **`common.jsx` 의 paths 객체를 그대로 이전**. 사용 0인 7개 (`ext`/`bell`/`check`/`play`/`zap`/`calendar`/`pin`) 도 포함 (§ 4.1 결정).

#### Step 1.2 — Kbd

| 항목 | 값 |
|---|---|
| 생성 파일 | `src/components-v2/Kbd/index.tsx`, `Kbd/Kbd.tsx`, `src/styles-v2/components/kbd.css` |
| LOC | ~30 (`Kbd.tsx` 18 / `index.tsx` 3 / `kbd.css` 12). 타입 동거 (단순) |
| commit 권장 | **1 commit**: `feat(components-v2): add Kbd primitive` |
| 검증 | tsc / smoke test (`children` 텍스트 렌더 + `inverse` 변종 클래스 적용) |
| 의존 | 없음. Icon 머지 대기 불필요 → **Step 1.1 과 병렬 작업 가능** |

#### Step 1.3 — Eyebrow

| 항목 | 값 |
|---|---|
| 생성 파일 | `src/components-v2/Eyebrow/index.tsx`, `Eyebrow/Eyebrow.tsx`, `src/styles-v2/components/eyebrow.css` |
| LOC | ~50 (`Eyebrow.tsx` 25 / `index.tsx` 3 / `eyebrow.css` 22) |
| commit 권장 | **1 commit**: `feat(components-v2): add Eyebrow primitive` |
| 검증 | smoke test (tone × size × dot 4조합 — md/sm × term-green) |
| 의존 | 없음 (PR 1 시점 dot 은 인라인). PR 4 머지 후 TermDot 치환은 별도 후속 PR (§ 6.1 메모) |

#### Step 1.4 — StatusChip

| 항목 | 값 |
|---|---|
| 생성 파일 | `src/components-v2/StatusChip/index.tsx`, `StatusChip/StatusChip.tsx`, `src/styles-v2/components/status-chip.css` |
| LOC | ~70 (`StatusChip.tsx` 30 / `index.tsx` 3 / `status-chip.css` 37) |
| commit 권장 | **1 commit**: `feat(components-v2): add StatusChip with 4 variants` |
| 검증 | smoke test (4 variant × dot on/off — 8 케이스 렌더 확인) |
| 의존 | 없음 |

#### Step 1.5 — Chip

| 항목 | 값 |
|---|---|
| 생성 파일 | `src/components-v2/Chip/index.tsx`, `Chip/Chip.tsx`, `src/styles-v2/components/chip.css` |
| LOC | ~60 (`Chip.tsx` 30 / `index.tsx` 3 / `chip.css` 27) |
| commit 권장 | **1 commit**: `feat(components-v2): add Chip with active state and count` |
| 검증 | smoke test (default / active / count 표시 / onClick 호출) |
| 의존 | 없음 |

#### Step 1.F — PR 1 마무리 commit

| 항목 | 값 |
|---|---|
| 작업 | ① `src/components-v2/index.ts` 배럴에 Icon/Kbd/Eyebrow/StatusChip/Chip + 타입 추가 ② `src/styles-v2/index.css` 에 신규 CSS 4개 (`@import './components/kbd.css'` 등) 추가 ③ `src/pages-v2/_Showcase/sections/PrimitivesSection.tsx` 추가 ④ FileIcon 함께 이전 시 추가 (§ 2.2 메모) ⑤ accent / fmt utility 이전 (`src/lib/utils` 또는 `src/styles-v2/accent.ts`) |
| LOC | ~30 (배럴 + index.css + showcase) + utility 이전 ~40 |
| commit 권장 | **2 commits**: ① `chore(components-v2): wire PR 1 barrel and styles index` ② `feat(pages-v2): add showcase primitives section` (utility 이전은 ②와 합치거나 ① 앞에 별도) |
| 검증 | dev 서버 → `/_showcase` 진입 → 모든 variant 시각 확인. `npm run build` 통과 |

---

### 7.2 PR 2 — Form / Action (선결: PR 1 머지 완료)

**목표**: Login 폼과 EventList 검색바 그리고 모든 페이지의 액션 버튼 기반 마련.
**브랜치**: `claude/components-v2-pr2-form` (예시)
**전체 LOC**: ≈ 200 + 마무리 25 = **≈ 225**

#### Step 2.1 — Input

| 항목 | 값 |
|---|---|
| 생성 파일 | `src/components-v2/Input/index.tsx`, `Input/Input.tsx`, `Input/Input.types.ts`, `src/styles-v2/components/input.css` |
| LOC | ~90 (`Input.tsx` 50 / `Input.types.ts` 15 / `index.tsx` 3 / `input.css` 22) |
| commit 권장 | **2 commits**: ① `feat(components-v2): add Input default variant with label/error` (default variant + states) → ② `feat(components-v2): add Input code variant with iconStart/hintEnd` (code variant 슬롯) |
| 검증 | smoke test (default + label + error / code + iconStart + hintEnd / `forwardRef` 로 외부 focus() 호출) |
| 의존 | PR 1 의 Icon (`code` variant 의 iconStart 에 `<Icon name="search" />` 주입), PR 1 의 Kbd (`hintEnd` 에 `<Kbd>/</Kbd>`) — **모두 슬롯**. 직접 import 없음 |

> **Input 먼저 시작 사유**: Button 보다 상태 머신이 단순(loading 없음). Login 페이지 plan 이 가장 먼저 진행될 가능성이 높아 빠른 머지 가치.

#### Step 2.2 — Button

| 항목 | 값 |
|---|---|
| 생성 파일 | `src/components-v2/Button/index.tsx`, `Button/Button.tsx`, `Button/Button.types.ts`, `src/styles-v2/components/button.css` (+ `globals.css` 에 `@keyframes spin` 없으면 추가) |
| LOC | ~110 (`Button.tsx` 40 / `Button.types.ts` 20 / `index.tsx` 3 / `button.css` 47) |
| commit 권장 | **2 commits**: ① `feat(components-v2): add Button with variants and sizes` (variant × size × full × disabled) → ② `feat(components-v2): add Button loading state and icon slots` (loading + iconStart/iconEnd + spin keyframe) |
| 검증 | smoke test (variant × size × full / loading 시 disabled 자동 / type 미지정 시 'button' / iconStart/iconEnd 슬롯) |
| 의존 | PR 1 의 Icon (iconStart/iconEnd 슬롯에 호출자가 주입). 직접 import 없음 |

#### Step 2.F — PR 2 마무리 commit

| 항목 | 값 |
|---|---|
| 작업 | ① 배럴에 Input/Button 추가 ② `src/styles-v2/index.css` 에 `input.css`, `button.css` import 추가 ③ Showcase 라우트에 `FormSection.tsx` 추가 (variant × size × state 매트릭스 시각화) |
| LOC | ~25 |
| commit 권장 | **1 commit**: `chore(components-v2): wire PR 2 and add showcase form section` |
| 검증 | `/_showcase` 에서 Form 섹션 시각 확인 |

---

### 7.3 PR 3 — Display (선결: PR 1 머지 완료, **PR 2 와 병렬 가능**)

**목표**: 페이지 전반의 카드 컨테이너 + Landing 섹션 헤드 기반.
**브랜치**: `claude/components-v2-pr3-display` (예시)
**전체 LOC**: ≈ 130 + 마무리 25 = **≈ 155**

#### Step 3.1 — Card

| 항목 | 값 |
|---|---|
| 생성 파일 | `src/components-v2/Card/index.tsx`, `Card/Card.tsx`, `src/styles-v2/components/card.css` |
| LOC | ~50 (`Card.tsx` 25 / `index.tsx` 3 / `card.css` 22). 타입 동거 |
| commit 권장 | **1 commit**: `feat(components-v2): add Card with solid/dashed variants and padding sizes` |
| 검증 | smoke test (variant 2종 × padding 5종 / `interactive=true` 시 className 'is-interactive' 반영 / `...rest` 로 onClick 통과) |
| 의존 | 없음 (PR 1 머지 전이라도 작업 가능). 다른 컴포넌트 직접 import 없음 |

#### Step 3.2 — SectionHead

| 항목 | 값 |
|---|---|
| 생성 파일 | `src/components-v2/SectionHead/index.tsx`, `SectionHead/SectionHead.tsx`, `src/styles-v2/components/section-head.css` |
| LOC | ~80 (`SectionHead.tsx` 30 / `index.tsx` 3 / `section-head.css` 47) |
| commit 권장 | **1 commit**: `feat(components-v2): add SectionHead with hint/caption/action slots` |
| 검증 | smoke test (title only / hint+caption / action 슬롯에 anchor 주입). `// ` prefix 자동 부착 확인 |
| 의존 | 없음 (action 슬롯 의존은 호출자) |

#### Step 3.F — PR 3 마무리 commit

| 항목 | 값 |
|---|---|
| 작업 | ① 배럴에 Card/SectionHead 추가 ② `src/styles-v2/index.css` 에 `card.css`, `section-head.css` import ③ Showcase 라우트에 `DisplaySection.tsx` 추가 |
| LOC | ~25 |
| commit 권장 | **1 commit**: `chore(components-v2): wire PR 3 and add showcase display section` |
| 검증 | `/_showcase` 에서 Display 섹션 시각 확인 |

---

### 7.4 PR 4 — Composite (선결: PR 1 머지 완료)

**목표**: 페이지 인라인 반복 패턴 6종 흡수.
**브랜치**: `claude/components-v2-pr4-composite` (예시)
**전체 LOC**: ≈ 320 + 마무리 35 = **≈ 355**
**선결**: **PR 1** (Icon — QuantityStepper 직접 import). PR 2/3 머지 전이라도 시작 가능 (§ 6.5 결론 5).
**호출자 의존**: EmptyState 의 `action` 슬롯에는 보통 Button 이 들어감 → 페이지 통합 PR 은 PR 2 머지 후. 본 PR 4 자체는 Button 없이도 머지 가능 (showcase 에서 Button 사용 시 PR 2 와 순서 조정).

#### 작업 순서 근거 (§ 6.1 + § 6.2)

1. 직접 import 의존이 있는 QuantityStepper 는 Icon (PR 1) 머지 확인 후 진행
2. 나머지 5개는 PR 1 토큰만 있으면 됨 → leaf 부터 작업 (TermDot → Avatar → AccentMediaBox → MetaLine)
3. EmptyState 는 호출자 의존(Button) 이 있으므로 마지막. showcase 에서 PR 2 의 Button 을 import 하므로 **본 PR 4 머지 시점에는 PR 2 도 머지되어 있는 것이 자연스러움** — 그러나 컴포넌트 자체 의존은 없으므로 강제는 아님

#### Step 4.1 — TermDot

| 항목 | 값 |
|---|---|
| 생성 파일 | `src/components-v2/TermDot/index.tsx`, `TermDot/TermDot.tsx`, `src/styles-v2/components/term-dot.css` |
| LOC | ~20 (`TermDot.tsx` 12 / `index.tsx` 3 / `term-dot.css` 5). 타입 동거 |
| commit 권장 | **1 commit**: `feat(components-v2): add TermDot primitive` |
| 검증 | smoke test (tone 3종 × size 3개 — 6 케이스 className 확인) |
| 의존 | 없음 |

#### Step 4.2 — Avatar

| 항목 | 값 |
|---|---|
| 생성 파일 | `src/components-v2/Avatar/index.tsx`, `Avatar/Avatar.tsx`, `src/styles-v2/components/avatar.css` |
| LOC | ~50 (`Avatar.tsx` 25 / `index.tsx` 3 / `avatar.css` 22). 타입 동거 |
| commit 권장 | **1 commit**: `feat(components-v2): add Avatar with size variants` |
| 검증 | smoke test (size sm/md/lg + initial 1글자/2글자, `toUpperCase()` 적용 확인) |
| 의존 | 없음 |

#### Step 4.3 — AccentMediaBox

| 항목 | 값 |
|---|---|
| 생성 파일 | `src/components-v2/AccentMediaBox/index.tsx`, `AccentMediaBox/AccentMediaBox.tsx`, `AccentMediaBox/AccentMediaBox.types.ts`, `src/styles-v2/components/accent-media-box.css` |
| LOC | ~60 (`AccentMediaBox.tsx` 30 / `AccentMediaBox.types.ts` 10 / `index.tsx` 3 / `accent-media-box.css` 17) |
| commit 권장 | **2 commits**: ① `feat(components-v2): add AccentMediaBox box variant with size→alpha mapping` (box variant + xs/md/hero size + 그라디언트 alpha 매핑 상수) → ② `feat(components-v2): add AccentMediaBox stripe variant` (stripe variant + sm size + 180deg) |
| 검증 | smoke test (box × xs/md/hero / stripe × sm / glyph 슬롯에 string + Icon 모두 받기) |
| 의존 | 없음 (accent 는 prop). § 1.2 utility (`accent()`) 는 호출자 책임 |

> § 4.12 에서 정리한 size→alpha / size→glyph fontSize / size→glyph opacity 매핑 상수는 `AccentMediaBox.tsx` 내부 상수로. 호출자가 override 안 하도록 prop 으로 노출 안 함.

#### Step 4.4 — MetaLine

| 항목 | 값 |
|---|---|
| 생성 파일 | `src/components-v2/MetaLine/index.tsx`, `MetaLine/MetaLine.tsx`, `src/styles-v2/components/meta-line.css` |
| LOC | ~40 (`MetaLine.tsx` 20 / `index.tsx` 3 / `meta-line.css` 17). 타입 동거 |
| commit 권장 | **1 commit**: `feat(components-v2): add MetaLine with compact modifier` |
| 검증 | smoke test (compact true (EventCard 모드) / compact false + icon (InfoRow 모드) / truncate on/off) |
| 의존 | 없음 (icon 슬롯은 호출자 ReactNode) |

> § 3.4 시그니처 보강 (`compact?: boolean` 추가) 도 본 commit 에 포함.

#### Step 4.5 — QuantityStepper

| 항목 | 값 |
|---|---|
| 생성 파일 | `src/components-v2/QuantityStepper/index.tsx`, `QuantityStepper/QuantityStepper.tsx`, `QuantityStepper/QuantityStepper.types.ts`, `src/styles-v2/components/quantity-stepper.css` |
| LOC | ~70 (`QuantityStepper.tsx` 35 / `QuantityStepper.types.ts` 12 / `index.tsx` 3 / `quantity-stepper.css` 20) |
| commit 권장 | **1 commit**: `feat(components-v2): add QuantityStepper with min/max bounds` |
| 검증 | smoke test (size sm/md / min·max 클램프 / 경계 도달 시 해당 버튼 disabled / disabled prop 시 둘 다 비활성 / onChange 호출) |
| 의존 | **PR 1 의 Icon (직접 import)** — `<Icon name="plus" />` / `<Icon name="minus" />` 컴포넌트 내부 렌더 |

#### Step 4.6 — EmptyState

| 항목 | 값 |
|---|---|
| 생성 파일 | `src/components-v2/EmptyState/index.tsx`, `EmptyState/EmptyState.tsx`, `src/styles-v2/components/empty-state.css` |
| LOC | ~80 (`EmptyState.tsx` 30 / `index.tsx` 3 / `empty-state.css` 47). 타입 동거 |
| commit 권장 | **1 commit**: `feat(components-v2): add EmptyState with stack-trace surface` |
| 검증 | smoke test (3 prototype 사용처 재현 — 🔍/🛒/💳 + 각각 title/message/action 조합. action 없는 케이스 확인) |
| 의존 | 없음 (action 슬롯은 호출자 ReactNode). showcase 에서 Button 사용 시 PR 2 머지 필요 |

#### Step 4.F — PR 4 마무리 commit

| 항목 | 값 |
|---|---|
| 작업 | ① 배럴에 6개 컴포넌트 + 타입 추가 ② `src/styles-v2/index.css` 에 신규 CSS 6개 import ③ `src/pages-v2/_Showcase/sections/CompositeSection.tsx` 추가 (variant × size × state 매트릭스) ④ § 3.4 의 `MetaLine.compact`, `AccentMediaBox.variant` 시그니처 업데이트 (이미 본 PR 의 step commit 에 포함됐다면 생략) |
| LOC | ~35 |
| commit 권장 | **1 commit**: `chore(components-v2): wire PR 4 and add showcase composite section` |
| 검증 | `/_showcase` 에서 Composite 섹션 시각 확인 |

#### Step 4.G — Eyebrow → TermDot 후속 치환 (옵셔널)

| 항목 | 값 |
|---|---|
| 작업 | `Eyebrow.tsx` 내부의 인라인 dot `<span style={...}>` 을 `<TermDot tone={tone} size={size === 'sm' ? 4 : 6} />` 로 치환 |
| LOC | ~5 (실코드) + smoke 테스트 변경 ~5 |
| commit 권장 | **1 commit (옵셔널)**: `refactor(components-v2): use TermDot inside Eyebrow` |
| 검증 | 기존 Eyebrow smoke 테스트 통과 + showcase 시각 동등성 |
| 의존 | 본 PR 4 의 TermDot 머지 후. 본 PR 4 마지막 commit 으로 포함하거나 후속 정리 PR 로 분리 — 양쪽 모두 허용 |

> **분리 권장 사유**: 이 치환은 시각·동작 변화 없는 순수 내부 리팩터. 별도 PR 로 분리하면 PR 4 의 신규 컴포넌트 리뷰와 분리되어 부담이 줄음. 단, PR 4 가 작은 편(355 LOC)이라 합쳐도 무방.

---

### 7.6 전체 PR 1~4 요약 (§ 7.5 갱신)

```
주차    │ PR 1               │ PR 2               │ PR 3               │ PR 4
────────┼────────────────────┼────────────────────┼────────────────────┼────────────────────
W1      │ Icon + Kbd (병렬)  │                    │ Card 작업 시작 가능 │
W1 후반 │ Eyebrow / Status   │                    │                    │
        │ Chip / Chip + 통합 │                    │                    │
        │ → 머지 ✓           │                    │                    │
────────┼────────────────────┼────────────────────┼────────────────────┼────────────────────
W2      │                    │ Input → Button     │ SectionHead + 통합 │ TermDot / Avatar
        │                    │ + 통합 → 머지 ✓    │ → 머지 ✓ (병렬)    │ AccentMediaBox 시작
────────┼────────────────────┼────────────────────┼────────────────────┼────────────────────
W3      │                    │                    │                    │ MetaLine /
        │                    │                    │                    │ QuantityStepper /
        │                    │                    │                    │ EmptyState + 통합
        │                    │                    │                    │ → 머지 ✓
        │                    │                    │                    │ Eyebrow 치환 (옵션)
```

| PR | 누적 LOC | 누적 컴포넌트 수 |
|---|---|---|
| PR 1 ✓ | ~370 | 5 (+ 옵션 FileIcon, utils 이전) |
| PR 2 ✓ | ~595 | 7 |
| PR 3 ✓ (병렬) | ~750 | 9 |
| PR 4 ✓ | ~1105 | **15** (= SPEC § 0 명시 9 + composite 6) |

각 페이지 plan PR (Login / EventList / EventDetail / Cart / MyPage / Landing) 은 본 § 7 의 **PR 1~3 머지 후 시작**, EmptyState 가 필요한 페이지(EventList 빈 결과 / Cart 빈 상태 / MyPage 환불 탭)는 **PR 4 머지 대기**.

---

### 7.5 전체 타임라인 요약

```
주차    │ PR 1               │ PR 2               │ PR 3               │ PR 4
────────┼────────────────────┼────────────────────┼────────────────────┼─────────────────
W1      │ Icon + Kbd 작업    │                    │ Card 작업 시작 가능 │
W1 후반 │ Eyebrow / Status   │                    │                    │
        │ Chip / Chip + 통합 │                    │                    │
        │ → 머지             │                    │                    │
────────┼────────────────────┼────────────────────┼────────────────────┼─────────────────
W2      │                    │ Input / Button     │ SectionHead + 통합 │ TermDot 등 시작
        │                    │ + 통합 → 머지      │ → 머지 (병렬)      │ (§ 4.10 후)
────────┼────────────────────┼────────────────────┼────────────────────┼─────────────────
W3      │                    │                    │                    │ → 머지 + Eyebrow
        │                    │                    │                    │   후속 치환
```

각 페이지 plan (Login / EventList / EventDetail / Cart / MyPage / Landing) 의 PR 들은 본 § 7 의 PR 1~3 머지 후 시작. EmptyState 가 필요한 페이지(EventList / Cart / MyPage 환불) 는 PR 4 머지 대기.

