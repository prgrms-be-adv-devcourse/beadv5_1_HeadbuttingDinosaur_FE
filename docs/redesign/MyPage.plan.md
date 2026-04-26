# MyPage v2 계획

MyPage 는 탭 컨테이너 + 5개 탭 구조.
shell + 각 탭별 섹션으로 구성.

## 1. 페이지 디렉토리 구조

SPEC § 0 표준(`index.tsx` / `{Page}.tsx` / `components/` / `adapters.ts` / `hooks.ts` / `types.ts`)을 **shell 1개 + 탭 4개**에 맞춰 확장. shell은 표준 그대로, 탭은 각자 SPEC § 0 미니 구조를 가진다 (탭마다 API 면이 완전히 다르고 — `tickets.api` / `orders.api` / `wallet.api` / `refunds.api` — 의존이 0이라 합치면 모듈 경계만 흐려짐).

```
src/pages-v2/MyPage/
├── index.tsx                       ← 라우트 진입점. 인증 가드 위임 + 활성 탭 결정 + shell 마운트
├── MyPage.tsx                      ← shell 프레젠테이션. 프로필 헤더 + 탭 네비 + 활성 탭 children 슬롯
├── shell/                          ← shell 전용 컴포넌트 (탭 네비/프로필 헤더). 탭 폴더와 분리
│   ├── ProfileHeader.tsx           ← 52×52 아바타 + 닉네임 + ONLINE 배지 + 가입일/예치금 + "프로필 수정"
│   ├── ProfileHeaderSkeleton.tsx   ← 프로필 헤더 placeholder (auth.user 로딩 시)
│   └── TabNav.tsx                  ← segmented 4탭 트랙 (active editor-bg 카드 + 좌측 13px 아이콘)
├── tabs/
│   ├── Tickets/
│   │   ├── TicketsTab.tsx          ← 탭 프레젠테이션 (헤더 카운트 + grid auto-fill 카드)
│   │   ├── components/
│   │   │   ├── TicketsHeader.tsx   ← "티켓 N개 · 사용가능 X · 사용완료 Y" 요약 라인
│   │   │   ├── TicketCard.tsx      ← 56px accent stripe + 점선 보더 + 상태칩 + 제목 + 일시/좌석
│   │   │   ├── EmptyTickets.tsx    ← 빈 상태 (이모지 + "이벤트 둘러보기" CTA)
│   │   │   └── TicketsSkeleton.tsx ← 카드 6개 placeholder
│   │   ├── adapters.ts             ← `TicketItem` → `TicketVM` (status 매핑, 일시 라벨)
│   │   ├── hooks.ts                ← `useTickets()`
│   │   └── types.ts                ← `TicketVM`, `TicketStatus = 'VALID' | 'USED'`
│   ├── Orders/
│   │   ├── OrdersTab.tsx           ← 탭 프레젠테이션 (테이블 + 페이저)
│   │   ├── components/
│   │   │   ├── OrdersTable.tsx     ← surface-2 헤더 + tbody 슬롯
│   │   │   ├── OrderRow.tsx        ← mono 주문번호 / 이벤트 / 금액 / 상태칩 / 일시
│   │   │   ├── OrdersPager.tsx     ← 페이지네이션 컨트롤 (URL `page` 동기화)
│   │   │   ├── EmptyOrders.tsx
│   │   │   └── OrdersSkeleton.tsx  ← 행 8개 placeholder
│   │   ├── adapters.ts             ← `OrderItem` → `OrderRowVM` (status 매핑, 금액 포맷)
│   │   ├── hooks.ts                ← `useOrders(page)`, `useCancelOrder()`
│   │   └── types.ts                ← `OrderRowVM`, `OrderStatus`
│   ├── Wallet/
│   │   ├── WalletTab.tsx           ← 탭 프레젠테이션 (큰 잔액 카드 + 거래내역 섹션)
│   │   ├── components/
│   │   │   ├── BalanceCard.tsx     ← 38px 잔액 + 충전(primary) / 출금(ghost) 버튼
│   │   │   ├── TransactionList.tsx ← (선택) 거래내역 세로 스택
│   │   │   ├── TransactionRow.tsx
│   │   │   └── WalletSkeleton.tsx
│   │   ├── adapters.ts             ← `WalletBalanceResponse`, `WalletTransactionItem` → VM
│   │   ├── hooks.ts                ← `useWalletBalance()`, `useWalletTransactions()`, `useStartWalletCharge()`, `useWithdrawWallet()`
│   │   └── types.ts                ← `WalletBalanceVM`, `WalletTxVM`
│   └── Refund/
│       ├── RefundTab.tsx           ← 탭 프레젠테이션 (리스트 + 빈 상태)
│       ├── components/
│       │   ├── RefundList.tsx
│       │   ├── RefundRow.tsx
│       │   ├── EmptyRefunds.tsx    ← 프로토타입 empty state (대표 빈 상태 톤)
│       │   └── RefundsSkeleton.tsx
│       ├── adapters.ts             ← `RefundItem` → `RefundVM`
│       ├── hooks.ts                ← `useRefunds()`
│       └── types.ts                ← `RefundVM`
└── shared/                         ← 페이지 전역 공유 (탭 ≥2개가 쓰는 자산만)
    ├── tabs.ts                     ← 탭 메타 단일 정의 (key/label/icon/path) — TabNav + index 라우터가 같이 참조
    ├── types.ts                    ← `TabKey = 'tickets' | 'orders' | 'wallet' | 'refund'`
    └── currency.ts                 ← 원화 포맷 (잔액/주문/티켓 모두 사용)
```

### 결정 근거

| 결정 | 선택 | 이유 |
|---|---|---|
| 탭별 폴더 vs 평탄화 | **탭별 폴더** | 각 탭이 독립 API 모듈을 쓰고 컴포넌트가 4~5개씩 생김. 평탄화 시 `tabs/TicketsTab.tsx` 옆에 `tabs/TicketCard.tsx` `tabs/OrderRow.tsx` `tabs/BalanceCard.tsx` 가 섞여 시각적 경계가 사라짐. 탭별 lazy import도 폴더 단위가 자연스러움 (§ 2) |
| `adapters.ts` 단일 vs 탭별 | **탭별** | API 모듈 4개가 겹치지 않음. 단일 `adapters.ts`는 4개 API 타입을 전부 import하게 되어 탭 lazy 분할 의미가 사라짐 |
| `hooks.ts` 단일 vs 탭별 | **탭별** | 위와 동일. 또한 활성 탭이 아닌 탭의 데이터 페칭 훅은 마운트되지 않아야 함 (Wallet 탭에 들어왔는데 Orders가 같이 fetch 되면 안 됨) |
| `shell/` 분리 | **분리** | shell 컴포넌트(`ProfileHeader`, `TabNav`)는 모든 탭 위에 항상 떠 있는 자산. `tabs/` 안에 두면 소속이 모호해짐 |
| `shared/` 위치 | **`MyPage/shared/`** (페이지 내부) | 페이지 외부와 공유하는 자산은 SPEC 관례대로 `src/pages-v2/_shared/`(언더스코어 prefix). 페이지 내부에서만 공유하는 자산은 underscore 없는 `shared/`. `tabs.ts`는 라우터(`index.tsx`) + UI(`TabNav`)가 같은 정의를 봐야 하므로 단일 소스 |
| `settings`(프로필 수정) 탭 | **§ 11에서 결정** | SPEC § 3은 4탭만 명시. 기존 `pages/MyPage.tsx`는 `settings` 탭이 있고 `getTechStacks/updateProfile/changePassword/withdrawUser`를 쓴다. v2 4탭 외 영역(프로필 수정 / 비밀번호 / 탈퇴) 처리 방식은 § 11(의사결정)에서 다룸 |

## 2. 라우팅 / URL 설계

### 옵션 비교

| 옵션 | 형태 | 장점 | 단점 |
|---|---|---|---|
| **A. 라우트 분리** | `/mypage/:tab` (`/mypage/tickets` 등) | 탭 자체 쿼리 네임스페이스 독립 (Orders `?page=N` 이 다른 탭과 충돌 X). 탭별 React.lazy 로 코드 스플릿 자연스러움. deep-link 시 라우트 매칭만으로 활성 탭 결정 — `useSearchParams` 파싱 분기 불필요. 잘못된 탭 키는 라우터 단계에서 redirect 처리 가능. RequireAuth 가드를 부모 라우트에 한 번만 걸면 모든 탭 적용 | 라우트 정의 5줄(부모 + 4탭 + redirect). `/mypage` → `/mypage/tickets` 명시적 redirect 필요 |
| **B. 쿼리스트링** | `/mypage?tab=tickets` | 라우트 1개. 기존 `pages/MyPage.tsx`와 동일 패턴 (`useSearchParams`). cutover 시 v1 라우트 그대로 점거 가능 | **탭 간 쿼리 충돌**: Orders의 `?page=N`이 Wallet에 잔존하거나 다른 탭의 향후 쿼리와 키 충돌(`q`, `filter`). 탭별 lazy 분할 시 활성 키를 `?tab=`로 분기하는 사다리 코드 발생. 잘못된 `tab` 값 검증을 페이지 안에서 수동 처리해야 함 |
| **C. 단일 라우트 + 클라이언트 상태** | `/mypage` + `useState` | 가장 단순. 탭 전환 시 history 변화 없음 | 새로고침 / 결제 완료 → "/mypage 티켓 탭으로" deep-link 불가. 공유 URL이 항상 기본 탭만 가리킴. 뒤로가기 의미가 사라짐. **거의 모든 SPEC 요구사항(`결제 완료 시 마이페이지 티켓 탭으로` SPEC § 2)과 충돌** |

### INVENTORY 의 기존 라우팅 패턴 참고

- 기존 `src/pages/MyPage.tsx:56` 은 옵션 B (`useSearchParams().get('tab')`). 즉 v1 은 쿼리스트링.
- v2 페이지들은 SPEC § 0 규칙상 별도 경로를 쓰지 않고 cutover PR에서 라우트를 교체하는 구조. 즉 v2도 최종적으로 `/mypage` 네임스페이스를 점거.
- v2 EventList 계획(EventList.plan.md § 4)이 `?q=`, `?cat=`, `?stack=`, `?page=` 쿼리스트링을 **EventList 페이지 자신의 상태 표면**으로 사용 — MyPage 가 다시 `?tab=` 으로 페이지 라우팅을 가로채면 향후 탭 내부 상태(특히 Orders 페이지네이션)가 같은 쿼리 평면에 끼게 됨.
- `react-router-dom@6.22.3`(INVENTORY § 5) 은 nested route + `<Outlet/>` 또는 children rendering 둘 다 지원. 추가 라이브러리 없이 옵션 A 구현 가능.

### 추천 — **옵션 A**

탭마다 자기 쿼리스트링을 자유롭게 가질 수 있어야 하고(특히 Orders `?page=N`), SPEC § 2/§ 3의 deep-link 요구("결제 완료 시 티켓 탭으로", "충전 완료 후 예치금 탭으로")가 **라우트로 표현되는 게 의도에 더 맞음**. 옵션 B의 유일한 장점인 "라우트 1개"는 § 10 라우터 등록에서 nested route로 흡수되어 비용이 거의 없음.

### 확정 경로

```
/mypage                       → /mypage/tickets 로 redirect (replace)
/mypage/tickets               → MyPage shell + Tickets 탭
/mypage/orders                → MyPage shell + Orders 탭
/mypage/orders?page=2         → Orders 탭, 2페이지
/mypage/wallet                → MyPage shell + Wallet 탭
/mypage/refund                → MyPage shell + Refund 탭
/mypage/:invalid              → /mypage/tickets 로 redirect
```

- 모든 경로는 **RequireAuth + Layout** 하위 (현 `/mypage` 와 동일한 가드 — INVENTORY § 4).
- 탭 키는 `shared/tabs.ts` 단일 소스 (`'tickets' | 'orders' | 'wallet' | 'refund'`). TabNav 의 `to` 와 라우터의 `path` 가 같은 배열에서 생성되어 어긋날 수 없음.
- 탭별 lazy 분할은 PR 분할 후속 결정 (§ 10/§ 12). 1차 PR 에서는 동기 import 로 시작.
- v1 → v2 cutover 시 v1 의 `/mypage?tab=foo` 기존 외부 링크 호환은 **§ 11(의사결정)** 에서 다룸 (한 번에 컷오버 vs `?tab=` query를 path 로 변환하는 임시 redirect 컴포넌트).
- "프로필 수정" 액션의 도착지는 `/mypage/settings` 또는 모달 — § 11 결정.

## 3. Shell 컴포넌트 분해 (프로필 헤더 + 탭 네비)

`prototype/MyPage.jsx` 28~65행(프로필 헤더 + segmented tabs)이 shell 범위. 프로토타입의 인라인 `style={{}}` / `window.Icon` / `useStateM` 별칭은 가져오지 않음 (SPEC § 0).

### 3.1 컴포넌트 분해

| 이름 | 역할 | 위치 | props | 의존 |
|---|---|---|---|---|
| `MyPage` | shell 프레젠테이션. `editor-scroll` + gutter + 본문 컨테이너(`max-width: 1000`) 안에 `<ProfileHeader/>` + `<TabNav/>` + 활성 탭 슬롯을 세로로 배치. 자체 상태 0개 | `MyPage.tsx` | `{ activeTab: TabKey; children: React.ReactNode }` | `ProfileHeader`, `TabNav` |
| `ProfileHeader` | 52×52 아바타 + 닉네임 + ONLINE 배지(또는 status 매핑) + 메타 라인(가입일 · 예치금 잔액) + 우측 "프로필 수정" ghost sm 버튼 | `shell/ProfileHeader.tsx` | `{ profile: ProfileVM; balance: BalanceSlot; onEditProfile(): void }` | Phase 0 `Avatar`, `TermDot`, `Button` |
| `ProfileHeaderSkeleton` | `auth.isLoading` 또는 `user == null` 상태에서 자리만 잡는 placeholder (아바타 박스 + 텍스트 두 줄). shell이 `<Suspense fallback>` 없이 직접 분기 | `shell/ProfileHeaderSkeleton.tsx` | `{}` | — (마크업만) |
| `TabNav` | segmented control. surface-2 트랙 + padding 4 + 4개 `<Link>`. active 탭은 editor-bg 흰 카드 + soft shadow + bold | `shell/TabNav.tsx` | `{ active: TabKey; tabs: readonly TabMeta[] }` | Phase 0 `Icon`, `shared/tabs.ts`, `react-router-dom` `Link` |
| `TabMeta` | (타입) `{ key: TabKey; label: string; icon: IconName; path: string }` | `shared/tabs.ts` | — | — |

#### TabPanel 을 별도 컴포넌트로 두지 않는 이유

- § 2 옵션 A(`/mypage/:tab`) 채택으로 활성 탭 본문은 **라우터가 직접 렌더**한다. shell `MyPage.tsx` 는 `index.tsx` 가 결정한 활성 탭 컴포넌트를 `children` prop 으로 받기만 함.
- React Router 의 `<Outlet/>` 을 쓸지, `index.tsx` 가 `useParams().tab` 값을 narrow 해서 `<TicketsTab/> | <OrdersTab/> | …` 분기를 직접 렌더할지는 § 10(라우터 등록)에서 결정. 어느 쪽이든 shell 입장에서는 **단일 children 슬롯**이라 `TabPanel` 컴포넌트가 추가 추상화를 만들지 않음.
- segmented control(`TabNav`)이 표시·라우팅 책임을 다 가지므로, "탭 본문" 만 따로 묶는 컴포넌트는 props 가 사실상 `{ children }` 한 개 — 넣을 이유가 없음.

### 3.2 ProfileHeader 데이터 출처

| 필드 | 출처 | 비고 |
|---|---|---|
| `nickname` | `useAuth().user.nickname` (전역 `AuthContext` — INVENTORY § 4) | shell 마운트 시 이미 캐시됨. 추가 호출 0 |
| 이니셜 (아바타) | `nickname.charAt(0).toUpperCase()` | `Avatar` 의 `initial` prop 으로 전달. 비어있으면 `?` 폴백 |
| `email` | `useAuth().user.email` | 프로토타입엔 노출 X. v2도 표시 안 함 (보안/정보 밀도) |
| ONLINE 배지 | `useAuth().isLoggedIn` 이 true 인 경우 항상 표시 | 프로토타입의 정적 표기를 그대로 따름. status 가 다른 값(예: `BLOCKED`)이면 배지 숨김 — § 11 결정 |
| 가입일 | **API 부재** — `GetProfileResponse` 에 `createdAt` 없음 (`src/api/types.ts:68`) | § 11 의사결정: ① BE 에 필드 추가 요청 ② `getProfile` 외 다른 API 에서 끌어오는지 확인 ③ 표기 자체 제거. 1차 PR 에서는 라인 자체를 비워두거나 가입일 제거 |
| 예치금 잔액 | `getWalletBalance()` → `WalletBalanceResponse.balance` (`src/api/wallet.api.ts:16`) | shell 이 fetch. **Wallet 탭과 공유** — § 3.3 참조 |

#### `ProfileVM` (shell 어댑터 결과)

```ts
// src/pages-v2/MyPage/shell/types.ts (or shared/types.ts)
export type ProfileVM = {
  initial: string;       // nickname.charAt(0).toUpperCase() — 빈 값이면 '?'
  nickname: string;
  isOnline: boolean;     // status === 'ACTIVE' && isLoggedIn
  joinedAtLabel: string | null;  // § 11 확정 전까지 null
};
```

shell 의 `adapters.ts` (또는 `shell/adapters.ts`): `GetProfileResponse → ProfileVM` 변환. `useAuth()` 가 던지는 raw 타입을 컴포넌트로 직접 흘리지 않음 (SPEC § 0 어댑터 규칙).

### 3.3 예치금 잔액 — Wallet 탭과의 공유 전략

`ProfileHeader` 메타 라인에 잔액이 보이고 동시에 Wallet 탭의 `BalanceCard` 도 같은 잔액을 큰 숫자로 보여줌. 같은 데이터를 **두 번 fetch 하면 안 됨** (시점 불일치 + 호출 낭비).

| 옵션 | 형태 | 평가 |
|---|---|---|
| 1. shell 이 fetch + prop drilling | `index.tsx` 가 `useWalletBalance()` 호출 → `MyPage` 가 `balance` 를 `<ProfileHeader/>` 에 prop, `<WalletTab balance={...}/>` 에도 prop | 명시적이지만 Tickets/Orders/Refund 탭은 잔액 안 쓰므로 prop 이 dead-weight. children slot 패턴(§ 2)과 부딪침 |
| 2. shell + Wallet 탭이 동일 키로 fetch (캐시 의존) | React Query / SWR 가 있으면 자연스러움 | **불가** — INVENTORY § 5 + SPEC § 9 "추가 라이브러리 미도입 확정". 캐시 레이어 없음 |
| 3. 페이지 내부 컨텍스트 | `MyPage/shared/WalletBalanceContext.tsx`. shell 이 Provider 로 fetch + 노출. `ProfileHeader` 와 `BalanceCard` 가 `useWalletBalance()` 훅으로 소비 | shell 이 Wallet 탭에 들어가지 않은 상태에서도 잔액을 채워야 하므로 어차피 shell 이 fetch 책임. Tickets/Orders/Refund 탭에는 컨텍스트가 영향 X. **추천** |
| 4. `useAuth()` 확장 | AuthContext 에 `walletBalance` 추가 | 책임 오염. 인증 컨텍스트는 `src/contexts/AuthContext.tsx` 단일 책임 유지 (SPEC § 0 "기존 코드 건드리지 않음") |

**선택: 옵션 3**. `MyPage/shared/WalletBalanceContext.tsx` (또는 `shell/walletBalance.ts` 의 hook + provider). shell 마운트 시 1회 fetch + Wallet 탭의 `BalanceCard` 가 같은 hook 호출 → 동일 인스턴스 데이터. 충전/출금 후 갱신은 같은 hook 의 `refresh()` 호출.

`BalanceSlot` 타입 (`ProfileHeader` 의 props 일부):
```ts
export type BalanceSlot =
  | { state: 'loading' }
  | { state: 'error' }
  | { state: 'ready'; amount: number };  // ProfileHeader 가 "예치금 잔액 120,000원" 포맷
```

> 잔액 표기 규칙: shell 메타 라인은 짧게 ("예치금 120,000원"), 본격 표시는 Wallet 탭 `BalanceCard` 가 38px 숫자로. `loading` 일 때 shell 메타 라인은 "예치금 -" 로 표시(레이아웃 점프 방지), `error` 일 때 "예치금 ?원" 또는 라인 생략 — § 11에서 미세조정.

### 3.4 TabNav active 상태

§ 2 옵션 A(`/mypage/:tab`) 기반. **active 는 URL 파라미터에서 파생** — 로컬 state 없음.

```tsx
// shell/TabNav.tsx
import { Link } from 'react-router-dom';
import { Icon } from '@/components-v2';
import type { TabKey, TabMeta } from '../shared/tabs';

interface TabNavProps {
  active: TabKey;                       // index.tsx 에서 useParams() 로 결정 후 narrow 한 값
  tabs: readonly TabMeta[];             // shared/tabs.ts 의 단일 정의
}

export function TabNav({ active, tabs }: TabNavProps) {
  return (
    <div className="mypage-tab-track" role="tablist">
      {tabs.map(t => (
        <Link
          key={t.key}
          to={t.path}
          role="tab"
          aria-selected={active === t.key}
          className={`mypage-tab ${active === t.key ? 'is-active' : ''}`}
          replace                       // 탭 전환은 history entry 1개만 (사용자 의도 단위)
        >
          <Icon name={t.icon} size={13} />
          <span>{t.label}</span>
        </Link>
      ))}
    </div>
  );
}
```

- active 결정은 `index.tsx` 가 `useParams<{ tab: string }>()` + `narrowTabKey()` 로 해서 `MyPage` 와 `TabNav` 양쪽에 `activeTab` prop 으로 내려줌. `TabNav` 내부에서 `useParams()` 를 또 부르지 않음 (단일 진실 소스).
- `replace` prop: 탭 전환은 사용자가 페이지 내 이동으로 인식. 직전 탭으로 돌아가는 건 뒤로가기보다 다시 클릭이 자연스러움. 단 `/mypage` (redirect 결과 `/mypage/tickets`) 는 replace 가 아닌 push — § 10에서 라우터 동작과 함께 확정.
- `<button>` 이 아닌 `<Link>` 를 쓰는 이유: 우클릭 → 새 탭 / cmd+click 동작이 deep-link 와 일치 (옵션 A 선택의 직접적인 보상).

### 3.5 TabNav — Phase 0 공용 승격 여부

`shared-components.plan.md § 1.4 #30 SegmentedTabs` 분류 그대로 **MyPage 페이지 전용**. 사용처가 1곳뿐이라 공용 승격 안 함. 다른 페이지에서 segmented control 이 추가로 등장하면 그때 `src/components-v2/SegmentedTabs/` 로 승격 (shared-components plan § 2 머지 순서 규칙).

내부에서 사용하는 단위 컴포넌트(`Icon`)는 Phase 0 공용 그대로 사용. Avatar / TermDot / Button(`ProfileHeader`)도 동일.

### 3.6 분해 원칙 (요약)

- shell 범위는 **데이터 페칭 1건**(예치금 잔액)만 책임. 나머지는 탭 폴더가 각자 fetch.
- shell 컴포넌트는 라우팅 결정(`activeTab`)을 prop 으로 받기만 함 — `useParams()` 직접 호출 X.
- shell 의 사용자 액션 1건 = "프로필 수정" 클릭 — 도착지(별도 라우트 / 모달)는 § 11 의사결정.
- 프로토타입의 `gutter`(60줄 라인 번호)는 IDE chrome 의 일부. shell 내부에 직접 박지 않고 v2 Layout (`prototype/Layout.jsx` → `src/components-v2/Layout`)이 제공하는지 확인 필요 — 없으면 shell 내부에 작성하되 § 11 에 표시.

## 4. 공유 자산 (모든 탭이 공유)

"공유" 의 범위는 **MyPage 내부**(shell + 탭 사이) 와 **MyPage 외부**(`src/components-v2/`, `src/pages-v2/_shared/`, `src/lib/`) 두 층. 외부 자산은 그대로 import, 내부 자산은 `MyPage/shared/` 에 둠. ≥2개 탭이 쓰는 것만 `shared/` 로 승격, 1탭 전용은 해당 탭 폴더 안에 둔다.

### 4.0 자산 한눈에

| 자산 | 위치 | 사용처 | 비고 |
|---|---|---|---|
| `useAuth()` (전역) | `src/contexts/AuthContext.tsx` (기존, 수정 금지) | shell + Tickets/Orders/Refund/Wallet 모두 (간접) | 토큰/프로필/role |
| `useMyProfile()` (래퍼) | `MyPage/shared/useMyProfile.ts` | shell, Wallet(?) | `useAuth().user` 를 `ProfileVM` 로 변환 |
| `WalletBalanceProvider` / `useWalletBalance()` | `MyPage/shared/walletBalance.tsx` | shell(`ProfileHeader`) + Wallet 탭(`BalanceCard`) | § 3.3 결정 — 페이지 내부 컨텍스트 |
| `EmptyState` | `src/components-v2/EmptyState/` (Phase 0 공용) | Tickets / Orders / Refund | 그대로 import. **신규 작성 X** |
| `TabFetchState` 패턴 | `MyPage/shared/TabFetchState.tsx` | Tickets / Orders / Wallet / Refund | 로딩·에러·빈 상태를 동일 모양으로 분기 |
| 탭별 Skeleton | 각 탭의 `components/` 안 (`TicketsSkeleton.tsx` 등) | 해당 탭만 | placeholder 모양은 탭마다 달라 공유 X |
| `fmtPrice`, `fmtDate`, `fmtISO` | `src/lib/format.ts` (v2 기존) | 모든 탭 | 그대로 import. **신규 작성 X** |
| `formatBalance` (원화 큰 단위) | `MyPage/shared/currency.ts` | shell 메타 라인 + Wallet `BalanceCard` | `fmtPrice` 와 다른 표기 — 본문 참조 |
| `TabSectionHeader` (탭 카운트 요약) | **현재는 `tabs/Tickets/components/TicketsHeader.tsx` 단일** | Tickets 만 | 4.4 참조 — 승격 안 함 |

### 4.1 사용자 정보 훅

#### 4.1.1 출처 — 기존 `useAuth()` 그대로

`src/contexts/AuthContext.tsx` (INVENTORY § 4) 는 SPEC § 0 "기존 코드 건드리지 않음" 대상이라 **수정 금지**. v2 페이지에서도 그대로 사용한다 (이미 `pages-v2/Login/index.tsx` 가 사용 중).

```ts
const { user, isLoggedIn, isLoading, role, logout, refresh } = useAuth();
// user: GetProfileResponse | null
```

#### 4.1.2 `useMyProfile()` 래퍼 (선택)

`useAuth()` 가 던지는 `GetProfileResponse` 는 SPEC § 0 어댑터 규칙상 컴포넌트로 바로 흘리지 않음. shell 의 `ProfileHeader` 에 들어갈 `ProfileVM`(§ 3.2) 변환을 1곳에 모은 hook.

```ts
// src/pages-v2/MyPage/shared/useMyProfile.ts
export function useMyProfile(): {
  status: 'loading' | 'guest' | 'ready';
  profile: ProfileVM | null;
} {
  const { user, isLoading, isLoggedIn } = useAuth();
  if (isLoading) return { status: 'loading', profile: null };
  if (!isLoggedIn || !user) return { status: 'guest', profile: null };
  return { status: 'ready', profile: toProfileVM(user) };
}
```

`toProfileVM` 은 `MyPage/shell/adapters.ts`(또는 `shared/adapters.ts`) 의 함수 — § 3.2 의 `ProfileVM` 시그니처 채움.

#### 4.1.3 탭별 사용 필드

| 탭 | 어떤 필드 | 용도 |
|---|---|---|
| shell `ProfileHeader` | `nickname`, 이니셜, `isOnline`, (TBD: `joinedAtLabel`) | 헤더 표시 |
| shell `WalletBalanceProvider` | (없음 — `useAuth().isLoggedIn` 로 fetch 가드만) | 비로그인이면 fetch 자체 막음 |
| Tickets | (없음 — `getTickets` 가 토큰으로 자동 인증) | — |
| Orders | (없음 — 동일) | — |
| Wallet | (없음 — `getWalletBalance` / 충전·출금 자동 인증) | — |
| Refund | (없음 — `getRefunds` 자동 인증) | — |
| (TBD) settings/프로필 수정 | `nickname`, `position`, `bio`, `techStacks`, `profileImageUrl` | § 11 결정 후 |

요약: 인증 필드는 **shell 만** 직접 소비. 탭들은 인증을 axios 인터셉터(INVENTORY § 4)에 위임하므로 `user` 객체를 직접 보지 않는다 → 탭 컴포넌트가 `useAuth()` 를 import 하지 않아야 깨끗하다.

### 4.2 빈 상태 / 에러 / 로딩 패턴

#### 4.2.1 `EmptyState` — Phase 0 공용 그대로 사용

`src/components-v2/EmptyState/` 가 이미 존재 (`shared-components.plan.md § 1.4 #22`):

```ts
interface EmptyStateProps {
  emoji?: string;
  title: string;
  message?: ReactNode;
  action?: ReactNode;
  className?: string;
}
```

- Tickets: `<EmptyState emoji="🎫" title="구매한 티켓이 없습니다" message="..." action={<Button>이벤트 둘러보기</Button>}/>`
- Orders: `<EmptyState emoji="📄" title="주문 내역이 없습니다" .../>`
- Refund: 프로토타입 그대로 `<EmptyState emoji="💳" title="환불 내역이 없습니다" message="..."/>`
- Wallet 은 빈 상태가 없음(잔액 0원도 카드는 보임). 거래내역 섹션을 추가할 경우 그쪽에 1회 등장.

신규 작성 없음. **MyPage 내부에 `EmptyTickets` / `EmptyOrders` / `EmptyRefunds` 래퍼 컴포넌트는 § 1 디렉토리에 이미 명시** — 각 탭에서 텍스트/CTA 만 채워 `<EmptyState>` 로 감싸는 thin wrapper.

#### 4.2.2 `TabFetchState` — 로딩/에러/빈 상태 분기 헬퍼

같은 패턴을 4개 탭이 반복하므로 분기 로직만 한 곳에 모은다. UI 컴포넌트가 아니라 **render-prop 또는 narrow 헬퍼**.

```tsx
// src/pages-v2/MyPage/shared/TabFetchState.tsx
type FetchState<T> =
  | { status: 'loading' }
  | { status: 'error'; error: Error; retry: () => void }
  | { status: 'ready'; data: T };

interface TabFetchStateProps<T> {
  state: FetchState<T>;
  skeleton: ReactNode;
  empty?: { when: (data: T) => boolean; render: ReactNode };
  children: (data: T) => ReactNode;
}

export function TabFetchState<T>({ state, skeleton, empty, children }: TabFetchStateProps<T>) {
  if (state.status === 'loading') return <>{skeleton}</>;
  if (state.status === 'error')   return <TabErrorBox onRetry={state.retry} />;
  if (empty?.when(state.data))    return <>{empty.render}</>;
  return <>{children(state.data)}</>;
}
```

- `TabErrorBox` (`shared/TabErrorBox.tsx`): `EmptyState` 변형 — `<EmptyState emoji="⚠️" title="불러오지 못했습니다" message="..." action={<Button onClick={onRetry}>다시 시도</Button>}/>`. 4개 탭에서 동일 모양. **공용 EmptyState 의 인스턴스**라 신규 컴포넌트가 아니라 정해진 props 로 EmptyState 를 부르는 얇은 함수.
- 위치 결정: **`MyPage/shared/`**. Phase 0 공용 승격 안 함 — 다른 v2 페이지(EventList, Cart 등)는 이미 자기 패턴(EventList plan § 6, Cart plan § 6)을 따로 정의했고, render-prop API 가 페이지마다 다른 도메인 분기를 갖기 좋아 강제 통일하면 오히려 어색해짐. MyPage 내부 4탭만 강한 공통성을 가진 케이스.

#### 4.2.3 Skeleton — 공유 안 함

탭마다 placeholder 모양이 다르다 (Tickets = 카드 그리드, Orders = 테이블 행, Wallet = 큰 카드, Refund = 리스트). 공통화하면 모양이 깨져 가치가 없다. 각 탭의 `components/{Tab}Skeleton.tsx` 에 그대로.

### 4.3 날짜 / 금액 포매터

#### 4.3.1 기본 — `src/lib/format.ts` 그대로 사용

이미 v2 용으로 분리되어 존재 (`src/lib/format.ts`):

| 함수 | 출력 | 사용 탭 |
|---|---|---|
| `fmtDate(iso)` | `'2026.05.18 14:00'` (local) | Tickets(일시), Orders(주문일시), Wallet(거래내역 일시), Refund(환불일시) |
| `fmtPrice(p)` | `0 → 'free'`, `49000 → '49,000원'` | Orders(금액) — Refund(금액) |
| `fmtISO(iso)` | `'2026-05-18 14:00'` (UTC) | (사용 안 함, 기록용) |

> v1 의 `src/utils/index.ts` 는 `formatPrice(amount → '4.9만원')` 등 다른 규칙을 쓴다. **혼용 금지** — v2 는 `src/lib/format.ts` 만 import. SPEC § 0 "기존/v2 분리" 와 일치.

#### 4.3.2 `formatBalance` (원화 큰 단위)

`fmtPrice(120000)` 은 `'120,000원'` — Orders/Refund 의 행 금액에는 적절하나 Wallet `BalanceCard` 의 38px 큰 숫자 표기와 shell 메타 라인의 컴팩트 표기에는 형태가 다르다.

| 사용처 | 원하는 출력 | 후보 |
|---|---|---|
| Wallet `BalanceCard` 38px 숫자 | `120,000` (단위 `원` 은 별도 span) | 숫자만 분리한 포맷터 필요 |
| shell 메타 라인 ("예치금 잔액 N원") | `120,000원` | `fmtPrice` 와 동일 — 별도 함수 불필요 |
| Tickets 잔여 금액(없음) | — | — |

```ts
// src/pages-v2/MyPage/shared/currency.ts
export function formatBalanceParts(amount: number): { value: string; unit: '원' } {
  return { value: amount.toLocaleString('ko-KR'), unit: '원' };
}
```

위치 결정: **`MyPage/shared/currency.ts`**. `src/lib/format.ts` 에 같은 류의 다른 변형이 늘어나는 걸 막고, "잔액 표기" 라는 의미 단위가 MyPage 안에서만 의미 있어서 페이지 내부에 둔다. 외부 페이지(예: Cart)에서 같은 표기가 필요해지면 그때 `src/lib/format.ts` 로 승격.

#### 4.3.3 한글 상대시간 / 가입일 등

- Tickets/Orders/Wallet/Refund 모두 절대 일시(`fmtDate`)만 사용 — 상대시간(`5분 전`) 패턴 등장 X.
- 가입일 라벨은 § 3.2 에서 데이터 자체가 부재(`createdAt` 누락) — 포매터 결정은 § 11 의사결정 이후.

### 4.4 탭 헤더 패턴 (카운트 요약)

#### 4.4.1 현황

프로토타입에서 카운트 요약 라인을 가진 탭은 **Tickets 1개뿐**:

```
티켓 3개            사용 가능 2개 · 사용 완료 1개
```

- Orders: 프로토타입은 곧장 테이블. 카운트 라인 없음.
- Wallet: 단일 잔액 카드. 카운트 개념 없음.
- Refund: 프로토타입은 빈 상태. 데이터가 있을 때 카운트 라인을 어떻게 둘지 미정.

#### 4.4.2 결정 — 공통 컴포넌트로 추출 안 함

`shared-components.plan.md § 1.5` 의 원칙: "단일 페이지 사용은 페이지 plan 에 두고, 추가 사용처 등장 시 승격". 같은 원칙을 페이지 내부에도 적용 → **사용처 1탭** 인 카운트 요약은 `MyPage/shared/` 로 올리지 않는다.

위치: **`tabs/Tickets/components/TicketsHeader.tsx`** (§ 1 에 이미 명시).

```ts
interface TicketsHeaderProps {
  total: number;          // "티켓 N개"
  validCount: number;     // "사용 가능 N개"
  usedCount: number;      // "사용 완료 N개"
}
```

#### 4.4.3 승격 트리거 (미래 작업)

Orders 탭이 페이지네이션 요약("총 N건 · M/N 페이지") 을, Refund 탭이 카운트 라인을 추가하면 **사용처 ≥2** 로 늘어남. 그 시점에 `MyPage/shared/TabSectionHeader.tsx` 로 승격해 다음 props 로 일반화:

```ts
interface TabSectionHeaderProps {
  primary: string;             // "티켓 3개" / "총 24건"
  secondary?: ReactNode;       // 우측 세부 메타
}
```

승격은 별도 PR. 현재 plan 범위에는 포함 안 함.

### 4.5 `MyPage/shared/` 최종 파일 목록 (§ 1 보강)

§ 1 의 `shared/` 트리에 § 4 의 결정을 합쳐 정리:

```
src/pages-v2/MyPage/shared/
├── tabs.ts                    ← § 1, § 3.4 — 탭 메타 단일 정의
├── types.ts                   ← § 1 — TabKey 등 페이지 전역 타입
├── currency.ts                ← § 4.3.2 — formatBalanceParts
├── useMyProfile.ts            ← § 4.1.2 — useAuth → ProfileVM 래퍼
├── walletBalance.tsx          ← § 3.3 — WalletBalanceProvider + useWalletBalance
├── TabFetchState.tsx          ← § 4.2.2 — 로딩/에러/빈 상태 분기
└── TabErrorBox.tsx            ← § 4.2.2 — EmptyState 변형 (재시도 액션)
```

§ 1 트리 갱신은 § 11 의사결정 종결 후 한 번에 (디렉토리 트리 흔들기 방지).

## 5. 탭 1: 내 티켓

`prototype/MyPage.jsx:67-102` (tickets 탭 본문). shell + 외부 자산은 § 3·§ 4에서 결정. 이 절은 탭 본문만 다룬다.

### 5.1 컴포넌트 분해

#### 5.1.1 시각 구조 (프로토타입 매핑)

```
[탭 본문 영역]
 ├─ 헤더 라인 (justify space-between)
 │   ├─ 좌측: "티켓 3개"
 │   └─ 우측: "사용 가능 2개 · 사용 완료 1개"
 └─ 그리드 (auto-fill, minmax(340px, 1fr), gap 12)
     └─ 카드 N개 ── flat-card · padding 0 · overflow hidden · display flex
         ├─ 좌측 stripe (width 56)
         │   ├─ background: linear-gradient(180deg, accent22, accent44)
         │   ├─ border-right: 1px dashed var(--border-2)
         │   └─ <Icon name="ticket" size=20 />  (accent 색)
         └─ 우측 본문 (flex 1, padding 16)
             ├─ <StatusChip variant=ok|end>{t.label}</StatusChip>
             ├─ 제목 (14.5px / 600 / line-height 1.4)
             └─ 메타 라인 (flex gap 14)
                 ├─ "📅 {t.date}"
                 └─ "💺 {t.seat}"
```

#### 5.1.2 컴포넌트 표

| 이름 | 역할 | 위치 | props | 의존 |
|---|---|---|---|---|
| `TicketsTab` | 탭 진입점. `useTickets()` 호출 → `TabFetchState` 로 로딩/에러/빈/정상 분기. 정상 시 `TicketsHeader` + `TicketGrid` 렌더 | `tabs/Tickets/TicketsTab.tsx` | (라우트 element. props 없음) | `useTickets` (§ 5.3), `TabFetchState` (§ 4.2.2), `TicketsHeader`, `TicketGrid`, `EmptyTickets`, `TicketsSkeleton` |
| `TicketsHeader` | 좌측 primary "티켓 N개" + 우측 secondary "사용 가능 X개 · 사용 완료 Y개" 한 줄 | `tabs/Tickets/components/TicketsHeader.tsx` | `{ total: number; validCount: number; usedCount: number }` | — (마크업만) |
| `TicketGrid` | `display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 12px;` 래퍼. 각 카드에 `key=ticketId` | `tabs/Tickets/components/TicketGrid.tsx` | `{ tickets: TicketVM[] }` | `TicketCard` |
| `TicketCard` | 카드 1개 컨테이너. `flat-card` 변형(padding 0 / overflow hidden / display flex). 좌측 `<TicketStripe/>` + 우측 `<TicketInfo/>` 합성 | `tabs/Tickets/components/TicketCard.tsx` | `{ ticket: TicketVM }` | Phase 0 `Card`(`variant='flat'`), `TicketStripe`, `TicketInfo` |
| `TicketStripe` | 좌측 56px 그라디언트 stripe + dashed 우측 border + accent 색 ticket 아이콘 | `tabs/Tickets/components/TicketStripe.tsx` | `{ accent: string }` | Phase 0 `AccentMediaBox`(`variant='stripe' size='sm'`), Phase 0 `Icon` |
| `TicketInfo` | 우측 본문. 상태 칩 한 줄 + 제목 + 메타(일시/좌석) 한 줄 | `tabs/Tickets/components/TicketInfo.tsx` | `{ statusVariant: 'ok' \| 'end'; statusLabel: string; title: string; dateLabel: string; seatLabel: string }` | Phase 0 `StatusChip` |
| `EmptyTickets` | 빈 상태. `EmptyState` thin wrapper — 이모지 + 제목 + 메시지 + "이벤트 둘러보기" CTA | `tabs/Tickets/components/EmptyTickets.tsx` | `{ onBrowse(): void }` | Phase 0 `EmptyState`, Phase 0 `Button` |
| `TicketsSkeleton` | placeholder 6장. `TicketGrid` 와 같은 grid 안에 `<Card variant='flat'/>` 빈 카드를 6번 | `tabs/Tickets/components/TicketsSkeleton.tsx` | `{ count?: number }` (기본 6) | Phase 0 `Card` |

`TicketVM` 시그니처는 § 5.2(API 매핑) 에서 확정. 본 표는 `{ ticketId, title, dateLabel, seatLabel, statusVariant, statusLabel, accent }` 형태가 들어온다고 가정.

#### 5.1.3 합성 결정 — `TicketCard = TicketStripe + TicketInfo`

- 한 카드 안에서 좌측 stripe 와 우측 본문은 **서로 모르는** 영역 (디자인 변경이 한쪽에만 영향). 분리해 두면 stripe 색/아이콘 변경, 본문 메타 추가가 서로 간섭 없이 가능.
- `TicketCard` 자체는 **레이아웃 컨테이너 + 데이터 → props 매핑** 만 책임:
  ```tsx
  <Card variant="flat" className="ticket-card">
    <TicketStripe accent={ticket.accent} />
    <TicketInfo
      statusVariant={ticket.statusVariant}
      statusLabel={ticket.statusLabel}
      title={ticket.title}
      dateLabel={ticket.dateLabel}
      seatLabel={ticket.seatLabel}
    />
  </Card>
  ```
- `TicketCard` 가 `ticket: TicketVM` 통째로 받지만 자식들엔 필드를 풀어서 넘김 → 자식 컴포넌트가 VM 형태에 의존하지 않음(테스트/스토리북에서 단독 렌더 쉬움).

#### 5.1.4 Phase 0 자산 사용 — 신규 작성 X

| 자산 | 사용처 | API |
|---|---|---|
| `AccentMediaBox` | `TicketStripe` 내부 | `variant='stripe'` (180deg 그라디언트) + `size='sm'` (alpha 22/44) — `src/components-v2/AccentMediaBox/AccentMediaBox.tsx` ALPHA 매핑이 이미 MP 56px stripe 기준값 |
| `Icon` | `TicketStripe`(ticket), `EmptyTickets`(CTA), `TicketsHeader` (없음 — 텍스트만) | `name='ticket'`, `size=20` |
| `StatusChip` | `TicketInfo` | `variant='ok'`(VALID) / `'end'`(USED). dot=true 기본 |
| `Card` | `TicketCard`, `TicketsSkeleton` | `variant='flat'` (`padding=0` 위해 `padding` prop 또는 className 오버라이드 — 현재 Card props 와 맞는지 § 5.3 에서 확인) |
| `EmptyState` | `EmptyTickets` | § 4.2.1 |
| `Button` | `EmptyTickets` 의 "이벤트 둘러보기" CTA | `variant='primary'` |

#### 5.1.5 페이지 전용 신규 — `TicketStripe` 의 변형 흡수

`AccentMediaBox` 는 stripe variant 와 56px 사이즈를 **이미 지원** 하지만 다음 두 점이 MP 티켓 카드 요구와 어긋남:

1. **glyph 가 string 한정** (`'</>'` / `'❯_'` 등 텍스트 글리프). MP 는 lucide-style **SVG ticket 아이콘**.
2. **dashed 우측 border** (1px dashed `var(--border-2)`) 가 컴포넌트에 없음 — Tickets 탭 고유 장식.

**결정**: `TicketStripe` 를 페이지 전용 thin wrapper 로 둠. 내부 마크업:
```tsx
<div className="ticket-stripe">
  <AccentMediaBox accent={accent} variant="stripe" size="sm" glyph="" />
  <span className="ticket-stripe-icon" style={{ color: accent }} aria-hidden>
    <Icon name="ticket" size={20} />
  </span>
</div>
```
- `.ticket-stripe` (페이지 CSS) 가 dashed 우측 border 와 absolute-positioned 아이콘 슬롯을 담당.
- `glyph=""` 로 AccentMediaBox 의 텍스트 글리프 비우고 위에 Icon 을 절대배치.
- 다른 탭/페이지에서 같은 변형이 등장하면 `AccentMediaBox` 의 `glyph` 를 `ReactNode` 로 확장 + dashed border 토글 prop 도입 후 `TicketStripe` 흡수 — 후속 PR. 현재는 페이지 전용 유지.

#### 5.1.6 분해 원칙 (요약)

- 데이터 fetching 은 `TicketsTab` 1곳. `TicketsHeader`, `TicketGrid`, `TicketCard` 는 prop drilling 만.
- `TicketCard` 는 도메인 prop(`ticket: TicketVM`)을 받지만, `TicketStripe` / `TicketInfo` 는 도메인 모름 — 시각/UI prop 만.
- Skeleton 은 카드 모양을 흉내 내야 해서 `TicketCard` 와 같은 `Card variant='flat'` + 56px stripe 자리만 빈 채로. 별도 컴포넌트로 두는 이유: § 4.2.3 에 따라 탭별 placeholder 모양이 달라 공유 X.
- 프로토타입의 인라인 `style={{}}` / `window.accent(t.id)` 글로벌 / 한자릿수 알파 hex 직조립은 **가져오지 않음** (SPEC § 0). accent 매핑은 어댑터에서 `accent(eventId)` 헬퍼로 (§ 5.2 에서 위치 결정).

### 5.2 API 매핑

#### 5.2.1 호출 함수

```ts
// src/api/tickets.api.ts (기존, 수정 금지)
export const getTickets = (params?: TicketListRequest) =>
  apiClient.get<TicketListResponse>('/tickets', { params });
```

- 엔드포인트: `GET /tickets` (실제 BE 경로. SPEC § 3 의 `/api/me/tickets` 표기는 `apiClient` baseURL `/api` + `/tickets` 합성 결과 — 동일).
- **`ApiResponse<T>` 래퍼 없음**: `apiClient.get<TicketListResponse>` 가 직접 `TicketListResponse` 를 던진다 (다른 엔드포인트와 다름 — `unwrapApiData` 적용 X). 어댑터에서 그대로 `.data` 를 사용.
- 인증: axios 인터셉터(`Authorization: Bearer …`)가 자동 주입 (INVENTORY § 4). 페이지가 토큰을 직접 다루지 않음.
- 페이지 요청은 0-base (v1 MyPage.tsx:121 이 `{ page: 0, size: 20 }` 호출 — BE 컨벤션 그대로 따름).

#### 5.2.2 응답 타입 (실측)

```ts
// src/api/types.ts:434
interface TicketItem {
  ticketId: number;        // ← 숫자
  eventId: string;
  eventTitle: string;
  eventDate: string;       // ISO
  status: string;          // 'VALID' | 'USED' | 'CANCELLED' | 'EXPIRED' (v1 매핑 기준)
}
interface TicketListResponse {
  tickets: TicketItem[];
  totalElements: number;
  totalPages: number;
}
```

#### 5.2.3 응답 필드 매핑 (mock → API → VM)

| 프로토타입 mock 필드 | API 필드 | 실제 위치 | VM 필드 (`TicketVM`) | 변환 |
|---|---|---|---|---|
| `id` (`'t1'`) | `ticketId` (number) | `types.ts:435` | `ticketId: string` | `String(api.ticketId)` — React `key` / 향후 라우팅 안정성. accent 매핑은 `eventId` 기반이라 별도 |
| `title` (`'Spring Camp …'`) | `eventTitle` | `types.ts:437` | `title: string` | passthrough |
| `status` (`'VALID' / 'USED'`) | `status` (string) | `types.ts:439` | `statusVariant: 'ok' \| 'end'` | enum 매핑 표 (§ 5.2.4) |
| `label` (`'사용 가능' / '사용 완료'`) | (없음 — 클라이언트 매핑) | — | `statusLabel: string` | `status` 기반 자동 생성 — 어댑터에서 라벨 테이블 참조 |
| `date` (`'2026.05.18 14:00'`) | `eventDate` (ISO) | `types.ts:438` | `dateLabel: string` | `fmtDate(api.eventDate)` (`src/lib/format.ts:12`, § 4.3.1) |
| `seat` (`'A-14' / '자율석'`) | **없음** | — | **VM 에서 제거** | § 5.2.5 결정 |
| (없음) | `eventId` (string) | `types.ts:436` | `accent: string` | `accent(eventId)` 매핑 — 어댑터가 page-local `accent()` 헬퍼 호출 |

#### 5.2.4 status enum 매핑

v1 MyPage.tsx:30-35 의 매핑을 그대로 채택 (BE 컨벤션 반영). 4개 상태를 StatusChip 의 4개 variant 에 1:1 매핑:

| API `status` | `statusVariant` | `statusLabel` | 비고 |
|---|---|---|---|
| `VALID` | `'ok'` | `'사용 가능'` | 프로토타입 케이스 1 |
| `USED` | `'end'` | `'사용 완료'` | 프로토타입 케이스 2 |
| `CANCELLED` | `'sold'` | `'취소됨'` | 프로토타입에 없음 — v1 매핑 따라 추가 |
| `EXPIRED` | `'end'` | `'만료'` | USED 와 시각 톤 동일(`end`) |
| (그 외) | `'end'` | `String(status)` | 미지의 값은 라벨로 그대로 노출(디버그용). prod 에서 발생 시 BE 와 enum 합의 |

위치: `tabs/Tickets/adapters.ts` 의 상수 객체 + `toTicketVM(api: TicketItem): TicketVM` 함수.

#### 5.2.5 `seat` 필드 — VM 에서 제거

- `TicketItem` 에 좌석 필드 **없음**. `TicketDetailResponse`(`types.ts:447`) 에도 좌석 필드 없음(가장 가까운 건 `location` — 행사장).
- 프로토타입의 `💺 A-14 / 자율석` 은 mock 전용. SPEC § 0 절대 규칙 "프로토타입의 mock 데이터는 v2 코드에 들어가면 안 됨" → **v2 카드의 좌석 라인 삭제**.
- 메타 라인은 `📅 {dateLabel}` 만 단독 노출. 디자인 회귀가 우려되면 `📍 {location}` 을 `getTicketDetail` 에서 prefetch 해 채울 수 있으나, 목록에서 N개 detail 호출은 비용 — § 11 의사결정 안건으로 등록.

#### 5.2.6 `accent` 매핑

- 프로토타입 `window.accent(t.id)` 글로벌은 가져오지 않음 (SPEC § 0).
- `accent()` 함수는 페이지/공용 어디 둘지: `prototype/common.jsx` 의 매핑은 이미 `src/components-v2/_shared` 또는 `src/lib/accent.ts` 후보로 다른 페이지 plan 에서 거론(`shared-components.plan.md § 1.4 #26 AccentMediaBox` 의 alpha 매핑이 색상 매핑과 별개). 본 plan 에서는 다음으로 가정:
  - **이미 존재하면**: 그대로 import.
  - **없으면**: `src/lib/accent.ts` (페이지 외 공용) 신규 — Cart/EventDetail/Landing 도 같은 매핑을 쓸 수밖에 없으니 페이지 내부에 두면 중복.
- 어댑터가 `accent(eventId)` 한 번 호출해 VM 의 `accent` 필드(hex 문자열)에 박아둠. 컴포넌트는 hex 만 받음.

> 위치 결정 (`src/lib/accent.ts` vs `src/components-v2/_shared/`)은 § 11 안건. 1차 PR 에서는 `MyPage/shared/accent.ts` 임시 위치 + TODO 주석. 외부 페이지가 같은 함수 필요해지는 시점에 승격.

#### 5.2.7 `TicketVM` 시그니처

```ts
// src/pages-v2/MyPage/tabs/Tickets/types.ts
export type TicketStatus = 'VALID' | 'USED' | 'CANCELLED' | 'EXPIRED' | 'UNKNOWN';

export interface TicketVM {
  ticketId: string;          // String(TicketItem.ticketId)
  eventId: string;           // accent 재계산 등 향후 활용
  title: string;
  dateLabel: string;         // fmtDate 결과
  status: TicketStatus;
  statusVariant: 'ok' | 'end' | 'sold';   // StatusChip prop
  statusLabel: string;       // '사용 가능' 등
  accent: string;            // hex (#xxxxxx)
}
```

#### 5.2.8 페이징 전략

| 조건 | 전략 |
|---|---|
| `totalElements ≤ size` (단일 페이지) | 추가 호출 0. 현재 페이지 그대로 표시 |
| `totalElements > size` | § 11 의사결정 (페이지네이션 / 무한스크롤 / "더 보기" 버튼) |

- 1차 PR: `getTickets({ page: 0, size: 50 })` 단일 호출. 보통 사용자당 티켓 수가 적다는 가정 (v1 기본 size=20 보다 여유 둠).
- Footer 에 `totalElements > 50` 일 때만 "전체 N개 중 50개 표시" 안내 + § 11 결정 후 페이저/스크롤 도입.
- API 가 0-base 인지 1-base 인지: v1 코드(`page: 0`) + `getTickets` 시그니처에 명시 없음 → v1 호환성 차원에서 **0-base** 가정. 페이저 도입 시 `page` 키 의미를 한 번 검증.

#### 5.2.9 에러 처리

| HTTP / 조건 | 처리 | 위치 |
|---|---|---|
| 401 (액세스 토큰 만료) | axios 인터셉터가 `/auth/reissue` 자동 재발급 + 원 요청 재시도 (INVENTORY § 4). **페이지 코드가 401 분기 작성 X** | `src/api/client.ts:68` |
| 401 (재발급 실패) | 인터셉터가 토큰 3종 제거 + `window.location.href = '/login'`. 페이지는 가만 있으면 됨 | `src/api/client.ts:95` |
| 403 + `code: PROFILE_NOT_COMPLETED` | 인터셉터가 `/social/profile-setup` 강제 이동. 페이지 처리 X | `src/api/client.ts:60` |
| 4xx (그 외 — 거의 발생 안 하는 케이스) | `useTickets` 가 error 상태로 `TabFetchState` 에 넘김 → `TabErrorBox` (재시도 버튼) | § 4.2.2 |
| 5xx | 동일 — `TabErrorBox` 의 "다시 시도" 버튼이 `useTickets.refetch()` 트리거 | § 4.2.2 |
| 네트워크 오류 (`axios.isAxiosError(e) && !e.response`) | 동일 — 5xx 와 같은 에러 상태로 합침 | `useTickets` |
| 빈 응답 (`tickets: []`) | error 가 아니라 정상. `TabFetchState.empty.when` 분기로 `EmptyTickets` 렌더 | § 5.3 |

> SPEC § 0 어댑터 규칙 + INVENTORY § 4 인터셉터 동작이 페이지 코드의 분기를 줄여줌 — 401 / 403 / 토큰 갱신은 페이지에서 절대 다루지 않음. **페이지가 다루는 에러는 4xx-other / 5xx / 네트워크** 3종으로 좁혀짐.

### 5.3 상태 처리

`TabFetchState` (§ 4.2.2) 가 분기를 처리. Tickets 탭은 다음 4 상태:

| 상태 | 트리거 | 렌더 | 비고 |
|---|---|---|---|
| `loading` | 첫 fetch 진행 중 (`useTickets` 가 아직 응답 X) | `<TicketsSkeleton count={6} />` | 카드 6장 placeholder. 그리드 첫 줄(340px × 3열 × 데스크톱 가정)이 즉시 채워지는 시각 — 더 적으면 그리드가 비어 보이고, 더 많으면 위 fold 밖이라 무의미 |
| `error` | 4xx-other / 5xx / 네트워크 (§ 5.2.9) | `<TabErrorBox onRetry={refetch} />` | `EmptyState` 변형 — 이모지 ⚠️ + "불러오지 못했습니다" + "다시 시도" Button |
| `empty` | 응답 정상 + `tickets.length === 0` | `<EmptyTickets onBrowse={() => navigate('/')} />` | `EmptyState` 변형 — 이모지 🎫 + "보유한 티켓이 없습니다" + "이벤트 둘러보기" primary Button (`/` = EventList) |
| `ready` | 응답 정상 + `tickets.length > 0` | `<TicketsHeader/>` + `<TicketGrid/>` | `total / validCount / usedCount` 는 어댑터가 한 번에 계산해 `TabFetchState` 에 함께 넘김 |

#### 5.3.1 `useTickets()` 리턴 시그니처

```ts
// src/pages-v2/MyPage/tabs/Tickets/hooks.ts
type TicketsData = {
  tickets: TicketVM[];
  total: number;       // = api.totalElements
  validCount: number;  // tickets.filter(t => t.status === 'VALID').length
  usedCount: number;   // tickets.filter(t => t.status === 'USED').length
};

export function useTickets(): FetchState<TicketsData> & { refetch: () => void };
```

- `FetchState<T>` 는 § 4.2.2 의 `'loading' | 'error' | 'ready'` 합 타입.
- 페칭은 `useEffect` + `useState` (INVENTORY § 5: 캐시 라이브러리 미도입). 마운트 시 1회 호출. 탭 전환 후 재진입 시 다시 호출되는 동작은 1차 PR 에서 허용 — 캐시 도입은 § 11.

#### 5.3.2 `TicketsSkeleton` 형태

- `TicketGrid` 와 동일 grid 안에 빈 `<Card variant='flat' />` 6개.
- 각 빈 카드 내부에 56px stripe placeholder (회색 surface-2) + 우측 padding 16 본문 placeholder 3줄(상태칩 자리 짧은 막대 / 제목 자리 긴 막대 / 메타 자리 중간 막대).
- 깜빡임 애니메이션 토큰은 `src/styles-v2/tokens.css` 의 skeleton 토큰 사용 (Phase 0 토큰 작업 산출물). 토큰 미정 시 1차 PR 에서는 정적 placeholder 로 두고 § 11 표시.

#### 5.3.3 빈 상태 카피

- 제목: `"보유한 티켓이 없습니다"`
- 메시지: `"마음에 드는 이벤트를 찾아 첫 티켓을 만들어보세요."`
- CTA: `<Button variant="primary">이벤트 둘러보기</Button>` → `/` (EventList).
- 라우팅: `useNavigate()` 또는 `<Link>` — `Button` 의 `to`/`href` prop 지원 여부에 맞춤. 미지원이면 `onClick={() => navigate('/')}`.

#### 5.3.4 에러 상태 카피

- 제목: `"불러오지 못했습니다"`
- 메시지: `"네트워크 또는 서버 오류일 수 있어요. 잠시 후 다시 시도해주세요."`
- CTA: `<Button variant="primary">다시 시도</Button>` → `useTickets().refetch()`.
- HTTP 상태별 카피 분기는 1차 PR 범위 외(§ 11). 한 가지 카피로 시작.

#### 5.3.5 동시 상태 / 경합

- `TicketsTab` 자체는 자식만 가지므로 mutation 없음. 향후 "환불 요청" 버튼 등이 카드에 추가되면(§ 11 — 5.2.5 의 좌석/환불 동선과 함께) `useTickets.refetch()` 와 mutation 결과의 경합 처리 필요. 1차 PR 범위 외.

## 6. 탭 2: 주문 내역
(작성 예정)
### 6.1 컴포넌트 분해
### 6.2 API 매핑
### 6.3 상태 처리

## 7. 탭 3: 예치금
(작성 예정)
### 7.1 컴포넌트 분해
### 7.2 API 매핑
### 7.3 상태 처리

## 8. 탭 4: 환불 내역
(작성 예정)
### 8.1 컴포넌트 분해
### 8.2 API 매핑
### 8.3 상태 처리

## 9. 인증 / 가드
(작성 예정)

## 10. 라우터 등록
(작성 예정)

## 11. 의사결정 필요 지점
(작성 예정)

## 12. PR 분할 (골격만)
### 12.1 PR 1: Shell
### 12.2 PR 2: tickets
### 12.3 PR 3: orders
### 12.4 PR 4: wallet
### 12.5 PR 5: refund
### 12.6 PR 간 의존성
