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
(작성 예정)

## 4. 컴포넌트별 variant / state
(작성 예정)

## 5. 파일 구조 / 명명 규칙
(작성 예정)

## 6. 의존성 그래프
(작성 예정)

## 7. PR 별 파일 생성 순서
(작성 예정)
