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

`prototype/MyPage.jsx:104-131` (orders 탭 본문). shell + 외부 자산은 § 3·§ 4. 이 절은 탭 본문만 다룬다.

### 6.1 컴포넌트 분해

#### 6.1.1 시각 구조 (프로토타입 매핑)

```
[탭 본문 영역]
 └─ flat-card (padding 0 / overflow hidden)
     └─ <table width=100% borderCollapse=collapse>
         ├─ <thead> (background surface-2)
         │   └─ <tr>
         │       ├─ <th>주문번호</th>      ← uppercase / mono-ish 11.5px / fontWeight 600 / text-3 / letterSpacing 0.04em
         │       ├─ <th>이벤트</th>
         │       ├─ <th>금액</th>
         │       ├─ <th>상태</th>
         │       └─ <th>주문일시</th>
         └─ <tbody>
             └─ <tr> × N (border-top: 1px solid var(--border))
                 ├─ <td mono 12px syn-fn>{order.id}</td>      ← ORD_a8f3 형태
                 ├─ <td 14px text>{order.eventTitle}</td>
                 ├─ <td 14px fontWeight 600 text>{amount.toLocaleString()}원</td>
                 ├─ <td><StatusChip variant=ok|end|sold>{statusLabel}</StatusChip></td>
                 └─ <td 13px text-3>{order.date}</td>
[페이저 자리 — 프로토타입엔 없음. SPEC § 3 의 "페이지네이션 또는 무한스크롤 추가" 요구를 v2 에서 신규]
```

#### 6.1.2 컴포넌트 표

| 이름 | 역할 | 위치 | props | 의존 |
|---|---|---|---|---|
| `OrdersTab` | 탭 진입점. URL `?page=N` 동기화 + `useOrders(page)` 호출 → `TabFetchState` 로 분기 | `tabs/Orders/OrdersTab.tsx` | (라우트 element. props 없음) | `useOrders` (§ 6.3), `TabFetchState` (§ 4.2.2), `OrdersTable`, `OrdersPager`, `EmptyOrders`, `OrdersSkeleton`, `react-router-dom` `useSearchParams` |
| `OrdersTable` | `flat-card` 래퍼 + `<table>` 골격(`<thead>` 인라인 + `<tbody>` 슬롯). 행은 `rows.map` 으로 `<OrderRow/>` 렌더 | `tabs/Orders/components/OrdersTable.tsx` | `{ rows: OrderRowVM[] }` | Phase 0 `Card` (`variant='flat'`), `TableHeader`, `OrderRow` |
| `TableHeader` | `<thead>` 한 줄. 5개 컬럼 라벨을 `ORDER_COLUMNS` 상수에서 매핑 | `tabs/Orders/components/TableHeader.tsx` | (props 없음 — 컬럼 고정) | `ORDER_COLUMNS` 상수 (`tabs/Orders/columns.ts`) |
| `OrderRow` | `<tr>` 1개. 5개 `<td>` 렌더. 상태 셀만 `<StatusChip/>`, 나머지는 텍스트 | `tabs/Orders/components/OrderRow.tsx` | `{ row: OrderRowVM }` | Phase 0 `StatusChip` |
| `OrdersPager` | 페이지네이션 컨트롤. 현재/총 페이지 + prev/next + 직접 입력(선택) | `tabs/Orders/components/OrdersPager.tsx` | `{ page: number; totalPages: number; onPageChange(next: number): void }` | Phase 0 `Button` (또는 `Icon` ghost-sm 직접) |
| `EmptyOrders` | 빈 상태. `EmptyState` thin wrapper — 이모지 + 제목 + 메시지 + "이벤트 둘러보기" CTA | `tabs/Orders/components/EmptyOrders.tsx` | `{ onBrowse(): void }` | Phase 0 `EmptyState`, Phase 0 `Button` |
| `OrdersSkeleton` | placeholder 8행. `OrdersTable` 와 같은 `flat-card` + `<table>` 안에 `<tr>` 빈 행 8개 | `tabs/Orders/components/OrdersSkeleton.tsx` | `{ rows?: number }` (기본 8) | Phase 0 `Card` |

`OrderRowVM` 시그니처는 § 6.2(API 매핑) 에서 확정. 본 표는 `{ orderId, displayId, eventTitle, amountLabel, statusVariant, statusLabel, dateLabel }` 형태가 들어온다고 가정.

#### 6.1.3 합성 결정 — `OrdersTable = TableHeader + OrderRow[]`

- 헤더(고정 라벨)와 행(가변 데이터) 의 변경 축이 다름. 헤더가 컬럼 추가/정렬 토글로 확장될 때 행 컴포넌트는 그대로 두고 헤더만 수정.
- `OrdersTable` 자체는 컨테이너만:
  ```tsx
  <Card variant="flat" className="orders-card">
    <table className="orders-table">
      <TableHeader />
      <tbody>
        {rows.map(row => <OrderRow key={row.orderId} row={row} />)}
      </tbody>
    </table>
  </Card>
  ```
- 페이저는 `OrdersTable` 외부(자매 위치)에 둠. 테이블이 비어 있어도(에러/스켈레톤 상태) 페이저는 표시 안 됨 — `OrdersTab` 의 `TabFetchState` 분기 안에서 `ready` 상태일 때만 페이저 마운트.

#### 6.1.4 `TableHeader` 를 별도 파일로 두는 이유 (얇아도)

- 현재 props 0 / 컬럼 5개 고정이라 `OrdersTable.tsx` 안에 인라인 두는 게 LOC 절약은 됨.
- 그래도 분리하는 이유:
  1. **컬럼 정의(`ORDER_COLUMNS`) 의 단일 소스**: `TableHeader` 의 라벨과 `OrderRow` 의 셀 순서가 어긋나면 화면이 망가진다. 두 곳이 같은 상수를 참조하는 구조여야 안전 — `columns.ts` 가 의미를 가짐. `TableHeader` 는 그 상수의 시각화 책임 1개를 갖는다.
  2. **향후 정렬/필터 추가 시 단일 진입점**: 컬럼 헤더 클릭으로 sort, sticky thead 등 시각 변경이 들어올 때 `OrdersTable` 본문을 안 건드리고 작업 가능.
- 컬럼 정의는 별도 모듈:
  ```ts
  // tabs/Orders/columns.ts
  export const ORDER_COLUMNS = [
    { key: 'displayId',   label: '주문번호',   align: 'left' },
    { key: 'eventTitle',  label: '이벤트',     align: 'left' },
    { key: 'amountLabel', label: '금액',       align: 'left' },
    { key: 'statusLabel', label: '상태',       align: 'left' },
    { key: 'dateLabel',   label: '주문일시',   align: 'left' },
  ] as const;
  ```
  `OrderRow` 는 `ORDER_COLUMNS.map(...)` 으로 셀을 그리지 않음 — 상태 셀이 텍스트가 아니라 `<StatusChip/>` 이라 일반화가 어색. 행은 5칸을 명시적으로 작성해 가독성 우선.

#### 6.1.5 `OrdersPager` — 페이지네이션 vs 무한스크롤

SPEC § 3 은 둘 중 하나. 1차 PR 결정은 § 6.2/§ 6.3 에서. 본 절은 두 안에 공통인 props 로 컴포넌트만 정의해 추후 결정에 흔들리지 않게 한다.

| 안 | `OrdersPager` 가 그릴 모양 | URL 동기화 |
|---|---|---|
| A. 페이지네이션 (추천 기본값) | `‹ 1 2 3 … N ›` 형태. `Button` ghost sm 또는 native `<button>` | `OrdersTab` 이 `?page=N` 쿼리스트링 owner. `useSearchParams` |
| B. 무한스크롤 | 페이저 미사용. `OrdersTab` 이 `IntersectionObserver` 로 누적 fetch. 페이저 컴포넌트 자체가 등장 X | URL 미동기화 (또는 `?page=N` 으로 누적 페이지 추적) |

**권장 — 옵션 A**.
- 테이블 뷰는 행이 길게 흐르고 헤더가 떠 있어야 비교가 쉬워서 무한스크롤과 시각적으로 어색.
- § 2 (`/mypage/orders?page=N`) 가 이미 옵션 A를 전제(쿼리 네임스페이스 분리한 이유의 반).
- 무한스크롤은 § 11 안건으로 등록 (모바일 카드 폴백 결정과 묶어서).

#### 6.1.6 Phase 0 자산 사용 — 신규 작성 X

| 자산 | 사용처 | API |
|---|---|---|
| `Card` | `OrdersTable`, `OrdersSkeleton` | `variant='flat'` (`padding=0` overlay 위해 className 으로 padding 0 강제) |
| `StatusChip` | `OrderRow` | `variant='ok' / 'end' / 'sold' / 'free'` 매핑 — § 6.2 |
| `Button` | `EmptyOrders`(CTA), `OrdersPager`(필요 시) | `variant='primary'` / `'ghost'` |
| `EmptyState` | `EmptyOrders` | § 4.2.1 |

#### 6.1.7 페이지 전용 신규 — 모두 `tabs/Orders/components/` 안

- `shared-components.plan.md § 1.4 #31 DataTable` 분류 그대로 **MyPage 페이지 전용**. 다른 페이지에서 표 형태가 등장하면 `src/components-v2/DataTable/` 로 승격 후속 PR.
- `OrdersTable` / `TableHeader` / `OrderRow` / `OrdersPager` / `OrdersSkeleton` / `EmptyOrders` 6개. 모두 1탭 전용이므로 `MyPage/shared/` 로도 올리지 않음 (§ 4.5 기준).

#### 6.1.8 분해 원칙 (요약)

- 데이터 fetching 은 `OrdersTab` 1곳. URL 의 `?page=N` 동기화도 `OrdersTab` 책임 — `OrdersTable` 이하는 prop drilling 만.
- `OrderRow` 는 도메인 prop(`row: OrderRowVM`)을 받지만, 자식 셀 마크업은 직접 작성(상태 셀만 `<StatusChip/>`). 내부에 별도 `<OrderCell/>` 추상화 안 함 — 5칸 고정에 일반화는 비용 대비 이득 없음.
- Skeleton 행 8개 = 첫 fold 가시 영역(데스크톱 가정). Tickets 의 6개와 다른 숫자 — 행 높이가 카드보다 낮아 더 많은 placeholder 가 fold 안에 들어감.
- 모바일 카드 폴백(좁은 화면에서 `<table>` 가 카드 stack 으로 변형)은 § 11 결정. 1차 PR 은 데스크톱 한정 — 모바일에서 가로 스크롤 허용.
- 프로토타입의 인라인 `style={{}}` / `r.amt.toLocaleString()` 직접 호출 / 인라인 status `cls` 분기는 가져오지 않음 (SPEC § 0). 금액/상태 매핑은 어댑터에서 (§ 6.2).

### 6.2 API 매핑

#### 6.2.1 호출 함수

```ts
// src/api/orders.api.ts (기존, 수정 금지)
export const getOrders = (params?: OrderListRequest) =>
  apiClient.get<ApiResponse<OrderListResponse>>('/orders', { params });

export const cancelOrder = (orderId: string) =>
  apiClient.patch<ApiResponse<OrderCancelResponse>>(`/orders/${orderId}/cancel`);
```

- 엔드포인트: `GET /orders` (BE 경로). SPEC § 3 의 `/api/me/orders` 표기는 baseURL `/api` 합성 후 동일.
- **`ApiResponse<T>` 래퍼 있음**: Tickets 와 달리 wrapping 됨 → 어댑터에서 `unwrapApiData(res)` 또는 `res.data.data` 접근. 본 plan 은 `unwrapApiData` 사용 (`src/api/client.ts`).
- 페이지 요청 0-base (v1 MyPage.tsx:121 `{ page: 0, size: 20 }` 동일 컨벤션). 1차 PR 도 동일.
- `cancelOrder` 는 § 11(취소 동선) 결정 후 합류 — 1차 PR 범위는 조회만.

#### 6.2.2 응답 타입 (실측)

```ts
// src/api/types.ts:393
interface OrderItem {
  orderId: string;
  status: string;       // 'CREATED' | 'PAYMENT_PENDING' | 'PAID' | 'CANCELLED' | 'REFUNDED'
  totalAmount: number;
  createdAt: string;    // ISO
}
interface OrderListResponse {
  content: OrderItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
```

#### 6.2.3 응답 필드 매핑 (mock → API → VM)

| 프로토타입 mock 필드 | API 필드 | 실제 위치 | VM 필드 (`OrderRowVM`) | 변환 |
|---|---|---|---|---|
| `id` (`'ORD_a8f3'`) | `orderId` | `types.ts:394` | `orderId: string`, `displayId: string` | `displayId = shortenOrderId(api.orderId)` (§ 6.2.5) |
| `ev` (`'Spring Camp 2026'`) | **없음** | — | `eventTitle: string \| null` | § 6.2.4 결정 |
| `amt` (`49000`) | `totalAmount` | `types.ts:396` | `amountLabel: string` | `fmtPrice(api.totalAmount)` → `'49,000원'` (`src/lib/format.ts:22`). `0` 인 케이스(전액 예치금/포인트)는 `'free'` 대신 `'0원'` 으로 — § 11 |
| `st` (`'결제 완료' / '결제 대기' / '환불 완료'`) | `status` (string) | `types.ts:395` | `statusVariant: 'ok' \| 'end' \| 'sold'`, `statusLabel: string` | enum 매핑 표 (§ 6.2.6) |
| `date` (`'2026.04.14'`) | `createdAt` (ISO) | `types.ts:397` | `dateLabel: string` | `fmtDate(api.createdAt)` (§ 4.3.1) → `'2026.04.14 10:23'`. 프로토타입은 날짜만 보여주지만 v2 는 시각까지 노출 (정렬 기준 명확화) |
| (없음) | `orderId` | `types.ts:394` | `orderId: string` | 행 `key` + 향후 `/mypage/orders/:orderId` 상세 진입 |

#### 6.2.4 `eventTitle` 필드 — API 부재 처리

가장 큰 갭. `OrderItem` 은 이벤트 이름을 **내려주지 않는다**. v1 `pages/MyPage.tsx:240-247` 도 주문 리스트에서 이벤트 이름을 표시하지 않고 status / orderId / amount / date 4개만 노출(카드 형태). SPEC § 3 의 5컬럼 표는 mock 기준이라 실제 API 와 어긋남.

| 옵션 | 전략 | 평가 |
|---|---|---|
| 1. **이벤트 컬럼 삭제** | 4컬럼 표(`displayId / amount / status / date`)로 운영. v1 과 동일한 정보 면 | **추천 1차 PR**. SPEC § 0 절대 규칙 "mock 데이터 v2 금지" 와 일치. 가장 안전 |
| 2. 행마다 `getOrderDetail` 호출 | 페이지당 N+1 호출. 20개면 21회 | 비용 큼. INVENTORY § 5 캐시 라이브러리 부재로 캐시 hit 도 없음. 거부 |
| 3. 이벤트 컬럼을 `'주문 #ORD_xxxx'` 같은 자리표시자로 채움 | 시각적으로는 5컬럼 유지 | 정보 0. 컬럼이 시각 노이즈만 차지. 거부 |
| 4. **BE 변경 요청** | `OrderItem` 에 `summaryTitle` (대표 이벤트명 또는 "X 외 N건") 필드 추가 | 근본 해결. § 11 안건으로 등록. 수신 후 옵션 1 → 5컬럼 복원 |

**1차 PR 결정 — 옵션 1**: 4컬럼 표(`주문번호 / 금액 / 상태 / 주문일시`).
- `ORDER_COLUMNS` (§ 6.1.4) 에서 `eventTitle` 행 제외.
- `OrderRowVM.eventTitle` 필드는 `null` 고정으로 미리 만들지 않고 **VM 에서 아예 제거**. 옵션 4 가 도착하면 그때 추가.
- 표 가로폭이 줄어 visual balance 가 어긋날 수 있음 — `displayId` 컬럼 옆에 약간의 여백을 두거나 `금액` 을 우측 정렬로 재배치 (§ 11 시각 결정).

`useOrderEventTitle(orderId)` 같은 lazy hook 으로 행 hover/expand 시 detail 을 부르는 변형도 가능 — § 11 안건.

#### 6.2.5 `displayId` (`shortenOrderId`)

- BE 의 `orderId` 실제 형태: v1 `pages/MyPage.tsx:244` 가 `order.orderId.slice(0, 16)` 처리 → UUID 등 긴 문자열 가능성 높음.
- 프로토타입 mock 형태: `'ORD_a8f3'` 8자.
- 변환 규칙:
  ```ts
  // tabs/Orders/adapters.ts
  function shortenOrderId(raw: string): string {
    if (raw.length <= 12) return raw;            // 이미 짧으면 그대로
    return `${raw.slice(0, 8)}…${raw.slice(-4)}`; // ex) 'a3f8c102…7b91'
  }
  ```
- `mono` 폰트로 표시 (`OrderRow` 의 `<td>` className 으로). 프로토타입의 `var(--syn-fn)` 색은 토큰으로 (`--syn-fn` = function/identifier 색).
- 풀 ID 는 `<td title={raw}>` 로 hover tooltip 노출 — 복사 등 추후 작업은 § 11.

#### 6.2.6 status enum 매핑

v1 `pages/MyPage.tsx:37-43` + 프로토타입 시각 톤 종합:

| API `status` | `statusVariant` | `statusLabel` | 비고 |
|---|---|---|---|
| `CREATED` | `'end'` | `'주문 생성'` | 결제 진행 전. 프로토타입엔 없는 상태 |
| `PAYMENT_PENDING` | `'end'` | `'결제 대기'` | 프로토타입 케이스 2 |
| `PAID` | `'ok'` | `'결제 완료'` | 프로토타입 케이스 1 |
| `CANCELLED` | `'sold'` | `'취소됨'` | 프로토타입에 없음 — v1 매핑 따라 추가 |
| `REFUNDED` | `'sold'` | `'환불 완료'` | 프로토타입 케이스 3 |
| (그 외) | `'end'` | `String(status)` | 미지의 값은 라벨 그대로 노출. prod 발생 시 BE 와 enum 합의 |

위치: `tabs/Orders/adapters.ts` 의 상수 + `toOrderRowVM(api: OrderItem): OrderRowVM` 함수.

#### 6.2.7 `OrderRowVM` 시그니처

```ts
// src/pages-v2/MyPage/tabs/Orders/types.ts
export type OrderStatus =
  | 'CREATED'
  | 'PAYMENT_PENDING'
  | 'PAID'
  | 'CANCELLED'
  | 'REFUNDED'
  | 'UNKNOWN';

export interface OrderRowVM {
  orderId: string;        // 풀 ID (행 key + 상세 진입)
  displayId: string;      // shortenOrderId 결과
  amountLabel: string;    // fmtPrice 결과
  status: OrderStatus;
  statusVariant: 'ok' | 'end' | 'sold';
  statusLabel: string;
  dateLabel: string;      // fmtDate 결과
  // eventTitle: 옵션 4 도착 후 추가 (§ 6.2.4)
}
```

#### 6.2.8 페이징 — 옵션 A (페이지네이션) 확정

§ 6.1.5 의 두 안 중 **A 선택**.

| 항목 | 값 |
|---|---|
| 페이지 사이즈 | `size = 20` (v1 호환) |
| URL 동기화 | `/mypage/orders?page=N`. `OrdersTab` 이 `useSearchParams` 의 owner — `?page` 미존재 시 0 으로 처리 |
| 0-base / 1-base | **URL 은 1-base**(사용자 가독), **API 호출은 0-base**(BE 컨벤션). `OrdersTab` 안에서 1↔0 변환 |
| `?page` 미존재 = `?page=1` | URL 에 `?page=1` 직접 노출하지 않음 — § 2 의 EventList plan 이 같은 방식 |
| 페이지 외 변경 시 reset | (없음 — 다른 필터가 없음. 향후 status 필터 추가 시 § 11) |
| 페이저 모양 | `‹ 1 2 [3] 4 5 … N ›`. 1차 PR 은 prev/next + 현재/총 페이지 텍스트 만 (`Previous`, `Next` 버튼 + `3 / 12` 표기) |
| 응답 일관성 | API `OrderListResponse.totalPages` 그대로 사용. `totalElements` 는 § 4.4.3 미래 헤더 카운트에 활용 |

#### 6.2.9 에러 처리

§ 5.2.9 와 동일 정책. 401 / 403 / 토큰 갱신은 axios 인터셉터가 흡수, 페이지 코드는 4xx-other / 5xx / 네트워크 3종만.

| HTTP / 조건 | 처리 |
|---|---|
| 401 | 인터셉터 자동 처리 (`src/api/client.ts:68`) |
| 403 + `code: PROFILE_NOT_COMPLETED` | 인터셉터 자동 처리 (`src/api/client.ts:60`) |
| 4xx (그 외) | `useOrders` error 상태 → `TabErrorBox` |
| 5xx | 동일 |
| 네트워크 오류 | 동일 |
| 빈 응답 (`content: []`, `totalElements: 0`) | error 가 아닌 정상. `TabFetchState.empty.when` → `EmptyOrders` |
| 잘못된 `?page` (서버가 빈 `content` 반환 + `page > totalPages`) | 1차 PR — 빈 상태와 동일하게 처리. § 11 — `page=1` 자동 redirect 검토 |

### 6.3 상태 처리

`TabFetchState` (§ 4.2.2) 가 분기를 처리. URL `?page=N` 변경 → `useOrders(page)` 가 새 fetch.

| 상태 | 트리거 | 렌더 | 비고 |
|---|---|---|---|
| `loading` | 첫 fetch 또는 페이지 변경 직후 | `<OrdersSkeleton rows={8} />` | flat-card + 빈 `<tr>` 8행 + `TableHeader` 는 그대로 보임 (헤더는 정적이라 첫 렌더부터 노출) |
| `error` | 4xx-other / 5xx / 네트워크 | `<TabErrorBox onRetry={refetch} />` | flat-card 영역만 차지. 페이저 미렌더 |
| `empty` | `totalElements === 0` | `<EmptyOrders onBrowse={() => navigate('/')} />` | 페이저 미렌더. § 6.2.9 의 `page > totalPages` 도 같은 분기 |
| `ready` | 정상 응답 + 행 ≥ 1 | `<OrdersTable rows={...} />` + `<OrdersPager .../>` (totalPages > 1 일 때만) | 페이저는 행 데이터와 같은 응답에서 `page / totalPages` 직접 사용 |

#### 6.3.1 `useOrders()` 리턴 시그니처

```ts
// src/pages-v2/MyPage/tabs/Orders/hooks.ts
type OrdersData = {
  rows: OrderRowVM[];
  page: number;        // 1-base (UI 노출용)
  totalPages: number;
  totalElements: number;
};

export function useOrders(page: number /* 1-base */):
  FetchState<OrdersData> & { refetch: () => void };
```

- 내부에서 1-base → 0-base 변환 후 `getOrders({ page: page - 1, size: 20 })` 호출.
- `useEffect` 의존성 `[page]`. 페이지 변경 = 새 fetch (이전 데이터를 잠깐 노출하지 않고 즉시 `loading` 으로 — § 11 결정: keep-previous-data 패턴 도입 여부).
- 캐시 라이브러리 미도입(INVENTORY § 5)이므로 같은 페이지로 재방문 시 재호출. § 11 안건.

#### 6.3.2 `OrdersSkeleton` 형태

- `flat-card` + `<table>` + `<TableHeader/>` (실제 헤더 그대로) + `<tbody>` 안에 빈 `<tr>` 8개.
- 각 행의 `<td>` 4칸 안에 placeholder 막대 (mono displayId 자리 짧음, 금액 자리 중간, 상태 자리 chip 모양 둥근 막대, 날짜 자리 중간).
- 깜빡임 토큰 사용 정책은 § 5.3.2 와 동일 (§ 11 미정).

#### 6.3.3 빈 상태 카피

- 제목: `"주문 내역이 없습니다"`
- 메시지: `"이벤트 티켓을 구매해 첫 주문을 남겨보세요."`
- CTA: `<Button variant="primary">이벤트 둘러보기</Button>` → `/` (EventList).
- v1 의 카피("이벤트 티켓을 구매해보세요")와 톤 일치.

#### 6.3.4 에러 상태 카피

- 제목: `"주문 내역을 불러오지 못했습니다"`
- 메시지: `"네트워크 또는 서버 오류일 수 있어요. 잠시 후 다시 시도해주세요."`
- CTA: `<Button variant="primary">다시 시도</Button>` → `useOrders().refetch()` (현재 페이지 유지).
- 페이지 변경 후 에러: 에러 박스에서 `<Button variant="ghost">첫 페이지로</Button>` 보조 CTA 추가 — § 11.

#### 6.3.5 페이저 행동

- `OrdersPager` 의 `onPageChange(next)` → `OrdersTab` 이 `setSearchParams({ page: String(next) }, { replace: false })`.
- `replace: false` (push) — 사용자의 명시적 액션이라 history entry 1칸 사용. 뒤로가기로 직전 페이지 복원.
- 페이지 변경 직후 `window.scrollTo({ top: 0 })` — 표가 길어 다음 페이지 첫 행이 fold 밖에서 시작하는 어색함 방지. 단 1차 PR 에 적용할지 § 11.
- `totalPages === 1` 또는 `0` 이면 페이저 미렌더 (§ 6.3 표 `ready` 행).

#### 6.3.6 동시 상태 / 경합

- 1차 PR 범위는 조회 only. `cancelOrder` / `refundOrder` 같은 mutation 도입은 § 11.
- 빠른 페이지 연타로 인한 stale 응답 처리: 1차 PR 에서는 `useEffect` cleanup 으로 in-flight 요청 abort 표시만 하되 axios cancel 토큰 도입 여부는 § 11 (BE 가 빠르면 일반적으로 무해).

## 7. 탭 3: 예치금

`prototype/MyPage.jsx:133-147` (wallet 탭 본문). shell + 외부 자산은 § 3·§ 4. 이 절은 탭 본문만 다룬다.

### 7.1 컴포넌트 분해

#### 7.1.1 시각 구조 (프로토타입 매핑)

```
[탭 본문 영역]
 └─ flat-card (padding 28)
     ├─ 라벨 "예치금 잔액"     ← 13px / text-3 / mb 6
     ├─ 잔액 행 (huge number)  ← 38px / fontWeight 800 / letter-spacing -0.01em / mb 4
     │   ├─ "120,000"
     │   └─ <span> 원 </span>  ← 18px / fontWeight 600 / text-3 / margin-left 6
     ├─ 라스트업데이트 캡션     ← 12.5px / text-3 / mb 20  ★ 프로토타입 mock 라인 (§ 7.1.5)
     └─ 버튼 행 (gap 8)
         ├─ <Button variant="primary"><Icon name="plus" size=13/> 충전하기</Button>
         └─ <Button variant="ghost"><Icon name="wallet" size=13/> 출금 요청</Button>
```

#### 7.1.2 컴포넌트 표 — 1차 PR 범위

| 이름 | 역할 | 위치 | props | 의존 |
|---|---|---|---|---|
| `WalletTab` | 탭 진입점. `useWalletBalance()` (§ 3.3 페이지 내부 컨텍스트)로 상태/`refresh()` 획득 → `TabFetchState` 분기. `BalanceCard` 에 잔액 + 액션 콜백 prop drilling | `tabs/Wallet/WalletTab.tsx` | (라우트 element. props 없음) | `useWalletBalance` (§ 3.3 `MyPage/shared/walletBalance`), `TabFetchState` (§ 4.2.2), `BalanceCard`, `BalanceCardSkeleton`, `TabErrorBox` |
| `BalanceCard` | 큰 카드 1개. 라벨 + 잔액 분할 표기(38px 숫자 / 18px "원") + (선택) 마지막 갱신 캡션 + 충전/출금 버튼 행 | `tabs/Wallet/components/BalanceCard.tsx` | `{ balance: number; lastUpdatedAtLabel?: string \| null; onCharge(): void; onWithdraw(): void; chargePending?: boolean; withdrawPending?: boolean }` | Phase 0 `Card`(`variant='flat'`), Phase 0 `Button`, Phase 0 `Icon`, `formatBalanceParts` (§ 4.3.2) |
| `BalanceCardSkeleton` | placeholder. 같은 28 padding 카드 + 라벨 자리 / 잔액 자리(큰 막대) / 버튼 자리 빈 박스 2개 | `tabs/Wallet/components/BalanceCardSkeleton.tsx` | `{}` | Phase 0 `Card` |

#### 7.1.3 합성 결정 — `WalletTab` 이 데이터·콜백 보유, `BalanceCard` 는 시각만

- `WalletTab` 의 책임: `useWalletBalance()` 결과 분기 + 충전/출금 트리거 콜백 정의 (`onCharge`, `onWithdraw`). 충전/출금 동작 자체는 § 11 결정 후 합류 — 1차 PR 의 콜백은 **placeholder**(`alert('준비 중입니다')` 또는 toast).
- `BalanceCard` 는 `balance: number` 만 받아 표시. fetch / mutation 미관여. 이렇게 두면:
  - 향후 charge / withdraw 모달 도입(§ 11) 때 `BalanceCard` 본체 변경 0.
  - 스토리북/스냅샷에서 `balance: 0`, `balance: 1_234_567` 같은 케이스 단독 렌더 가능.
- `BalanceCard` 의 `chargePending` / `withdrawPending` prop 은 1차 PR 에서는 사용처 0 (콜백이 placeholder 라). 예약만 두고 § 11 도입 시 즉시 활용.

```tsx
// tabs/Wallet/WalletTab.tsx (요지)
function WalletTab() {
  const balance = useWalletBalance();  // FetchState<{ amount: number; lastFetchedAt: number }> & { refetch }
  return (
    <TabFetchState
      state={balance}
      skeleton={<BalanceCardSkeleton />}
      empty={undefined}                 // § 7.1.6 — 빈 상태 분기 없음
    >
      {(data) => (
        <BalanceCard
          balance={data.amount}
          lastUpdatedAtLabel={null}     // § 7.1.5 — 1차 PR 미노출
          onCharge={() => alert('충전 — 준비 중입니다')}
          onWithdraw={() => alert('출금 — 준비 중입니다')}
        />
      )}
    </TabFetchState>
  );
}
```

#### 7.1.4 잔액 분할 표기 — `formatBalanceParts`

§ 4.3.2 의 `formatBalanceParts(amount) → { value, unit: '원' }` 로 38px / 18px 두 단위를 분리 렌더:

```tsx
// tabs/Wallet/components/BalanceCard.tsx (요지)
const { value, unit } = formatBalanceParts(balance);
return (
  <Card variant="flat" className="balance-card">
    <div className="balance-label">예치금 잔액</div>
    <div className="balance-amount">
      {value}
      <span className="balance-unit">{unit}</span>
    </div>
    {lastUpdatedAtLabel && (
      <div className="balance-last-updated">최종 업데이트 · {lastUpdatedAtLabel}</div>
    )}
    <div className="balance-actions">
      <Button variant="primary" iconStart={<Icon name="plus" size={13} />} onClick={onCharge} loading={chargePending}>
        충전하기
      </Button>
      <Button variant="ghost" iconStart={<Icon name="wallet" size={13} />} onClick={onWithdraw} loading={withdrawPending}>
        출금 요청
      </Button>
    </div>
  </Card>
);
```

- 38px / 18px 사이즈는 page-local CSS (`.balance-amount` / `.balance-unit`) 로. SPEC § 0 "동적 값만 인라인 허용" 규칙에 맞춰 css class 가 사이즈를 가짐.
- shell `ProfileHeader` 메타 라인은 `fmtPrice(balance) → '120,000원'` 한 덩어리(§ 4.3.2). 동일 잔액이지만 표기 형태는 두 곳이 다르고 그게 의도.

#### 7.1.5 "최종 업데이트" 라인 — API 부재

- `WalletBalanceResponse { walletId: string; balance: number }` (`src/api/types.ts:522`) 에 timestamp 필드 **없음**. 프로토타입의 `"최종 업데이트 · 2026.04.18 10:23"` 은 mock 전용.
- 옵션:
  | 옵션 | 전략 | 평가 |
  |---|---|---|
  | 1. **삭제** | 라인 자체 미렌더 | 1차 PR. SPEC § 0 mock 금지 규칙 |
  | 2. 클라이언트 fetch 시각 사용 | `useWalletBalance` 가 `lastFetchedAt: number` 동시 노출 → `BalanceCard` 가 `timeAgo(lastFetchedAt)` 로 "방금 전" 표기 | `timeAgo` 가 v1 `src/utils/index.ts` 에는 있지만 v2 `src/lib/format.ts` 에 없음 (§ 4.3.3). 도입 결정은 § 11 |
  | 3. BE 변경 요청 | `WalletBalanceResponse` 에 `updatedAt: string` 추가 | 근본 해결. § 11 안건 |
- **1차 PR 결정 — 옵션 1**. `BalanceCard` 의 `lastUpdatedAtLabel` prop 은 시그니처에 두되 `null` 로 호출 → 마크업 미렌더. 옵션 2 또는 3 도착 시 prop 채워 즉시 노출.

#### 7.1.6 빈 상태 분기 없음

- 잔액 = 0 인 케이스도 카드는 보여야 함 ("0원" 표기). `EmptyWallet` 같은 빈 상태 컴포넌트 도입 X.
- API 가 정상 응답 + `balance: 0` 이면 `ready` 상태로 직진. `formatBalanceParts(0) → { value: '0', unit: '원' }`.
- 이 결정은 § 4.0 표("Wallet 은 빈 상태가 없음")와 일치.

#### 7.1.7 확장 후보 — § 11 안건 (1차 PR 범위 외)

| 후보 | 필요 자산 | API | 비고 |
|---|---|---|---|
| `TransactionList` + `TransactionRow` + `TransactionsSkeleton` | 거래내역 세로 스택, type 별 부호/색(`CHARGE` `+`, `USE/WITHDRAW` `-`, `REFUND` `+`) | `getWalletTransactions` (`src/api/wallet.api.ts`) → `WalletTransactionListResponse` (`types.ts:541`). 페이지네이션 별도 결정 | v1 MyPage.tsx:282 가 `{ page: 0, size: 20 }` 단일 호출 — 패턴 차용 가능 |
| `ChargeFlow` (모달 또는 별도 라우트) | 금액 입력 폼 + PG 진입(@tosspayments/tosspayments-sdk) + 성공/실패 결과 처리 | `startWalletCharge` (`POST /wallet/charge`) → `WalletChargeStartResponse` 로 PG 위젯 호출. 콜백 라우트 `/wallet/charge/success` 에서 `confirmWalletCharge` (기존 v1 페이지 그대로 활용 — INVENTORY § 7) | `idempotencyConfig()` 필수 — 중복 결제 방지 (`src/api/client.ts`) |
| `WithdrawFlow` (모달) | 금액 입력 + 비밀번호 / 본인 확인 + 출금 트리거 | `withdrawWallet` (`POST /wallet/withdraw`) → `WalletWithdrawResponse` (`status: 'SUCCESS' \| 'FAILED'`). `idempotencyConfig()` 필수 | 비밀번호/본인 확인 정책은 SPEC 미명시 — § 11 |
| `BalanceCard` 내부 mutation 피드백 | charge/withdraw 진행 중 버튼 disabled + spinner. 완료 후 `useWalletBalance().refresh()` 호출 | 위 두 hooks 의 결과를 `WalletTab` 에서 처리 | `chargePending` / `withdrawPending` prop 이 1차 PR 시그니처에 미리 마련됨 (§ 7.1.2) |

위 확장은 모두 **§ 7.1.2 의 컴포넌트 표를 변경하지 않고 추가만**으로 들어올 수 있게 1차 PR 시그니처를 설계했다 (`onCharge`/`onWithdraw` 콜백 + `*Pending` prop). 따라서 § 11 결정 후 BalanceCard 본체 수정 없이 합류 가능.

#### 7.1.8 Phase 0 자산 사용 — 신규 작성 X

| 자산 | 사용처 | API |
|---|---|---|
| `Card` | `BalanceCard`, `BalanceCardSkeleton` | `variant='flat'` (`padding=28` 은 className 으로 — page-local CSS 가 토큰 적용) |
| `Button` | `BalanceCard` 의 충전/출금 | `variant='primary'` / `'ghost'`, `iconStart`, `loading` |
| `Icon` | `BalanceCard` 의 버튼 아이콘 | `name='plus'`, `name='wallet'`, `size=13` |
| `EmptyState` | (사용 안 함 — § 7.1.6) | — |

#### 7.1.9 분해 원칙 (요약)

- 데이터 fetching 은 shell 의 `WalletBalanceProvider` (§ 3.3) 가 책임. `WalletTab` 은 그 hook 의 소비자일 뿐 fetch 로직 없음 → `ProfileHeader` 와 잔액이 자동 일치.
- `BalanceCard` 는 시각 prop 만 받음. 도메인 모델 모름. 충전·출금 모달이 추후 도입돼도 `BalanceCard` 시그니처 그대로.
- 1차 PR 의 충전/출금 버튼은 placeholder 콜백. 사용자 클릭은 안내 toast/alert 로만 처리하고 § 11 결정 후 실제 플로우 합류.
- 프로토타입의 인라인 `style={{}}` (padding 28, fontSize 38, letterSpacing -0.01em 등) 은 모두 page-local CSS class 로 이전. SPEC § 0 "동적 값만 인라인" 규칙 준수.
- "최종 업데이트" 라인은 mock 전용이라 1차 PR 에서 미노출. prop 자리만 마련.

### 7.2 API 매핑

#### 7.2.1 호출 함수 (1차 PR — 조회만)

```ts
// src/api/wallet.api.ts (기존, 수정 금지)
export const getWalletBalance = () =>
  apiClient.get<ApiResponse<WalletBalanceResponse>>('/wallet');
```

- 엔드포인트: `GET /wallet`. SPEC § 3 의 `/api/me/wallet` 표기는 baseURL `/api` 합성 후 동일.
- **`ApiResponse<T>` 래퍼 있음** → 어댑터에서 `unwrapApiData(res)` 또는 `res.data.data` 접근.
- 인증: axios 인터셉터 자동 주입 (INVENTORY § 4).
- 호출 위치는 § 3.3 결정대로 **shell 의 `WalletBalanceProvider`**. `WalletTab` 은 직접 호출 X — `useWalletBalance()` 훅 소비자.

#### 7.2.2 응답 타입 (실측)

```ts
// src/api/types.ts:522
interface WalletBalanceResponse {
  walletId: string;
  balance: number;        // 원 단위 정수
}
```

#### 7.2.3 응답 필드 매핑 (mock → API → VM)

| 프로토타입 mock 필드 | API 필드 | 실제 위치 | VM 필드 (`WalletBalanceVM`) | 변환 |
|---|---|---|---|---|
| `120,000` (잔액 큰 숫자) | `balance` (number) | `types.ts:524` | `amount: number` | passthrough. 표기 분리는 컴포넌트에서 `formatBalanceParts(amount)` (§ 4.3.2) |
| `원` (단위) | (클라이언트 상수) | — | (없음 — `formatBalanceParts.unit`) | 어댑터 단계에선 만들지 않음 |
| `최종 업데이트 · 2026.04.18 10:23` | **없음** | — | `lastFetchedAt: number` (Date.now()) | § 7.2.5 결정 |
| (없음) | `walletId` | `types.ts:523` | (VM 미포함) | 충전/출금 호출에서 직접 필요하지 않음 — drop. 향후 logging 등에 필요해지면 VM 에 추가 |

#### 7.2.4 `WalletBalanceVM` 시그니처

```ts
// src/pages-v2/MyPage/tabs/Wallet/types.ts
export interface WalletBalanceVM {
  amount: number;        // = api.balance
  lastFetchedAt: number; // 클라이언트 fetch 완료 시각 (Date.now())
}
```

- `lastFetchedAt` 은 § 7.1.5 옵션 2 가 활성화될 때를 위해 **VM 단계에서 미리 채워둠**. 컴포넌트에선 `lastUpdatedAtLabel: null` (1차 PR) → 옵션 2 도착 시 `timeAgo(vm.lastFetchedAt)` 한 줄로 노출. VM 자체 변경 없음.
- 어댑터 위치: `tabs/Wallet/adapters.ts` 의 `toWalletBalanceVM(api: WalletBalanceResponse): WalletBalanceVM`. `lastFetchedAt` 은 어댑터가 호출되는 순간의 `Date.now()` — fetch 직후 어댑터 호출 시점이 사실상 응답 수신 시점.

#### 7.2.5 "최종 업데이트" 라인 — § 7.1.5 결정 재확인

- 1차 PR: `BalanceCard` 의 `lastUpdatedAtLabel` prop = `null` → 라인 미렌더.
- VM 의 `lastFetchedAt` 만 채워두고, 옵션 결정(§ 11) 후 `WalletTab` 에서 한 줄로 prop 채움:
  ```tsx
  lastUpdatedAtLabel={timeAgo(data.lastFetchedAt)}  // 옵션 2 도입 후
  ```
- `timeAgo` 헬퍼 v2 도입(`src/lib/format.ts` 추가)도 § 11 안건.

#### 7.2.6 확장 — 충전 / 출금 / 거래내역 (§ 11 결정 후 합류)

본 표는 시그니처 사전조사. **1차 PR 호출 X**.

##### `POST /wallet/charge` — 충전 시작

```ts
export const startWalletCharge = (body: WalletChargeStartRequest) =>
  apiClient.post<WalletChargeStartResponse>('/wallet/charge', body, idempotencyConfig());
```
- **`ApiResponse<T>` 래퍼 없음** (`src/api/wallet.api.ts:11`). 응답이 직접 `WalletChargeStartResponse`.
- `idempotencyConfig()` 필수 (`src/api/client.ts`) — 중복 충전 방지.

| 필드 | 타입 | 용도 |
|---|---|---|
| 요청 `amount` | `number` | 충전 금액 (원) |
| 응답 `chargeId` | `string` | PG confirm 단계에서 `WalletChargeConfirmRequest` 에 사용 |
| 응답 `amount` | `number` | 검증용 (요청 amount 와 일치 확인) |
| 응답 `status` | `string` | PG 진입 가능 여부 (`PENDING` 등) |
| 응답 `createdAt` | `string` | logging |

##### `POST /wallet/charge/confirm` — PG 콜백 후 확정

```ts
export const confirmWalletCharge = (body: WalletChargeConfirmRequest) =>
  apiClient.post<WalletChargeConfirmResponse>('/wallet/charge/confirm', body, idempotencyConfig());
```
- 호출 위치는 **MyPage 가 아니라** 기존 `pages/WalletChargeSuccess.tsx` (INVENTORY § 1, § 7). MyPage 는 시작만 트리거. PG 결과 라우트는 v1 유지.
- `confirm` 후 `useWalletBalance().refresh()` 자동 트리거는 § 11 (기존 v1 페이지 → MyPage 로 deep-link 시 잔액 자동 갱신).

##### `POST /wallet/withdraw` — 출금

```ts
export const withdrawWallet = (body: WalletWithdrawRequest) =>
  apiClient.post<ApiResponse<WalletWithdrawResponse>>('/wallet/withdraw', body, idempotencyConfig());
```
- **`ApiResponse<T>` 래퍼 있음** → `unwrapApiData`.
- `WalletWithdrawResponse.status`: `'SUCCESS' | 'FAILED'` 두 값. `FAILED` 는 HTTP 200 + status='FAILED' 형태 가능 — **에러 분기를 HTTP 만으로 못 함**, 응답 status 도 함께 검사.

| 필드 | 타입 | 용도 |
|---|---|---|
| 요청 `amount` | `number` | 출금 금액 |
| 응답 `withdrawnAmount` | `number` | 실제 출금된 금액 |
| 응답 `balance` | `number` | 출금 후 잔액 — `useWalletBalance` 캐시 갱신용 |
| 응답 `status` | `'SUCCESS' \| 'FAILED'` | UI 분기 |
| 응답 `transactionId` | `string` | 거래내역 매핑 (확장 시) |

##### `GET /wallet/transactions` — 거래내역

```ts
export const getWalletTransactions = (params?: WalletTransactionListRequest) =>
  apiClient.get<ApiResponse<WalletTransactionListResponse>>('/wallet/transactions', { params });
```
- 페이지네이션 (`page`, `size`, `currentPage`, `totalElements`, `totalPages`).
- `WalletTransactionItem.type`: `'CHARGE' | 'USE' | 'REFUND' | 'WITHDRAW'` — 부호/색 매핑은 v1 `pages/MyPage.tsx:45-50` 그대로 차용 가능.

#### 7.2.7 에러 처리

§ 5.2.9 / § 6.2.9 와 동일 정책. 401 / 403 / 토큰 갱신은 axios 인터셉터가 흡수, 페이지 코드는 4xx-other / 5xx / 네트워크 3종만.

| HTTP / 조건 | 처리 |
|---|---|
| 401 | 인터셉터 자동 처리 (`src/api/client.ts:68`) |
| 403 + `code: PROFILE_NOT_COMPLETED` | 인터셉터 자동 처리 (`src/api/client.ts:60`) |
| 4xx (그 외) | `useWalletBalance` error 상태 → `TabErrorBox` (재시도 버튼) |
| 5xx | 동일 |
| 네트워크 오류 | 동일 |
| 빈 응답 (`balance: 0`) | error 가 아닌 정상. `EmptyState` 분기 없음(§ 7.1.6) — `BalanceCard` 가 "0원" 표기 |
| 잘못된 응답 (`balance: null`, 음수 등) | 어댑터에서 `Number.isFinite(api.balance) && api.balance >= 0` 검증 실패 시 error 로 던지기 — § 11 |

##### 충전/출금 에러 (확장 — § 11 후 합류)

| 케이스 | 처리 |
|---|---|
| `startWalletCharge` 4xx (잔액/한도 등) | 에러 메시지 toast + 모달 닫지 않음 (사용자 재시도 가능) |
| PG 위젯 fail | `WalletChargeFail` 라우트(기존 v1 페이지) 그대로 사용 |
| `confirmWalletCharge` fail | `WalletChargeFail` 라우트 처리 |
| `withdrawWallet` HTTP 200 + `status: 'FAILED'` | toast 또는 모달 인라인 에러. 잔액 미갱신 |
| `withdrawWallet` 4xx | toast |
| 동시 충전·출금 클릭 (`idempotencyConfig` 의 같은 키) | BE 가 동일 응답 반환 — 중복 차감 없음. UI 는 `chargePending` / `withdrawPending` prop 으로 버튼 disabled |

### 7.3 상태 처리

`useWalletBalance()` 의 `FetchState<WalletBalanceVM>` 를 `TabFetchState` (§ 4.2.2) 로 분기. § 3.3 결정대로 hook 은 **shell 의 컨텍스트** 가 owner — `WalletTab` 과 `ProfileHeader` 가 같은 인스턴스를 본다.

| 상태 | 트리거 | 렌더 | 비고 |
|---|---|---|---|
| `loading` | 첫 fetch 진행 중 | `<BalanceCardSkeleton />` | shell `ProfileHeader` 메타 라인은 같은 hook 결과를 따라 "예치금 -" placeholder (§ 3.3 `BalanceSlot.state='loading'`) |
| `error` | 4xx-other / 5xx / 네트워크 | `<TabErrorBox onRetry={refresh} />` | shell 메타 라인은 `'state: error'` 분기 — § 3.3 결정대로 라인 형태 미세조정은 § 11 |
| `empty` | (해당 없음) | — | § 7.1.6 — `balance: 0` 도 정상 ready |
| `ready` | 정상 응답 | `<BalanceCard balance={data.amount} ...>` | shell 메타 라인은 `'state: ready'` 분기로 같은 amount 노출 |

#### 7.3.1 `useWalletBalance()` 리턴 시그니처 (§ 3.3 합류)

```ts
// src/pages-v2/MyPage/shared/walletBalance.tsx
type WalletBalanceState =
  | { status: 'loading' }
  | { status: 'error'; error: Error; refresh: () => void }
  | { status: 'ready'; data: WalletBalanceVM; refresh: () => void };

export function useWalletBalance(): WalletBalanceState;
```

- shell 의 `<WalletBalanceProvider>` 가 마운트 시 `getWalletBalance()` 1회 호출 → context value 갱신.
- `refresh()` 호출 시 새 fetch (이전 데이터 즉시 폐기 + `loading` 으로 — keep-previous-data 도입은 § 11).
- `useEffect` cleanup 으로 unmount 후 setState 방지 (마운트 동안 axios cancel 토큰 도입 여부는 § 11).

#### 7.3.2 `BalanceCardSkeleton` 형태

- 같은 `flat-card` (`padding 28`) + 라벨 자리 짧은 막대 / 잔액 자리 큰 막대(38px 높이 흉내) / 캡션 자리 (1차 PR 미렌더라 비움) / 버튼 자리 둥근 박스 2개.
- 깜빡임 토큰은 § 5.3.2 / § 6.3.2 와 동일 정책.

#### 7.3.3 빈 상태 — 미적용

- § 7.1.6 / § 4.0 결정대로 빈 상태 분기 없음. `balance: 0` 도 `ready` 로 직진.
- `BalanceCard` 가 `formatBalanceParts(0) → { value: '0', unit: '원' }` 로 자연스럽게 "0원" 표기.

#### 7.3.4 에러 상태 카피

- 제목: `"예치금 정보를 불러오지 못했습니다"`
- 메시지: `"네트워크 또는 서버 오류일 수 있어요. 잠시 후 다시 시도해주세요."`
- CTA: `<Button variant="primary">다시 시도</Button>` → `useWalletBalance().refresh()`.

#### 7.3.5 충전 / 출금 액션 결과 — 1차 PR 동작

§ 7.1.3 결정대로 1차 PR 의 `onCharge` / `onWithdraw` 는 placeholder:

| 액션 | 1차 PR 동작 | § 11 후 동작 |
|---|---|---|
| 충전하기 클릭 | `alert('충전 — 준비 중입니다')` 또는 toast | 충전 모달 / 라우트 진입 → `startWalletCharge` → PG → 콜백 → `useWalletBalance().refresh()` |
| 출금 요청 클릭 | `alert('출금 — 준비 중입니다')` 또는 toast | 출금 모달 → 비밀번호 확인 → `withdrawWallet` → 결과 toast + `refresh()` |
| 트랜잭션 완료 후 잔액 갱신 | (해당 없음) | shell 의 `useWalletBalance().refresh()` 호출 1번으로 `ProfileHeader` + `BalanceCard` 동시 갱신 |
| 충전 진행 중 UI | (해당 없음) | `chargePending=true` → "충전하기" 버튼 disabled + spinner |
| 출금 진행 중 UI | (해당 없음) | `withdrawPending=true` → 동일 |
| 결과 toast | toast 컨테이너 — 기존 `src/contexts/ToastContext.tsx`(INVENTORY § 5) 그대로 사용 | 동일 |

#### 7.3.6 PR 범위 / § 11 / § 12 정합

다음 결정은 § 11 → § 12 로 흐름:

- 1차 PR 은 **잔액 조회 only**. 충전/출금/거래내역은 미포함.
- `BalanceCard` 시그니처(§ 7.1.2)는 **확장을 미리 흡수**하도록 작성됨 → § 11 결정 후 BalanceCard 본체 변경 없이 합류.
- `TransactionList` 도입 시점은 § 11 결정 후 § 12 의 PR 분할(추가 PR 또는 wallet PR 확장)에 반영.
- 충전/출금 모달 도입 시 `tabs/Wallet/components/` 에 `ChargeModal.tsx` / `WithdrawModal.tsx` 추가, `WalletTab` 은 모달 표시/숨김 상태만 보유 (`useState<'charge' | 'withdraw' | null>(null)`).
- 충전/출금 콜백은 결과를 toast 로 노출 + 성공 시 `refresh()` 호출 패턴. 모달 내부 폼/검증 로직은 § 11 결정 후 별도 plan.

## 8. 탭 4: 환불 내역

`prototype/MyPage.jsx:149-155` 는 **빈 상태만** 보여줌 (💳 + "환불 내역이 없습니다" + 안내). 실제 데이터 시각은 프로토타입에 없음.

### 시나리오 결정 — A (정상 구현)

- `src/api/refunds.api.ts` 의 `getRefunds({ page?, size? })` 존재 — `RefundListResponse { content: RefundItem[]; totalElements; totalPages }` 반환.
- v1 `src/pages/MyPage.tsx:457-505` 가 이미 정상 구현(테이블 + status enum 매핑 + 빈 상태). API 안정성 검증됨.
- INVENTORY § 9 의 메모도 같은 결론: "MyPage 환불 탭 — `src/api/refunds.api.ts` 활용하여 구현 가능".

→ **Scenario A 채택**. 1차 PR 에 조회/빈 상태/페이징 정상 구현. 환불 *요청* 동선은 § 11 별도(Tickets 탭 카드의 환불 버튼 + 모달). 본 탭은 *조회* 만.

### 8.1 컴포넌트 분해

#### 8.1.1 시각 구조 (v2 신규 — 프로토타입에 데이터 시각 없음)

프로토타입은 빈 상태뿐이므로 데이터 시각은 v1 의 테이블 구조를 토큰만 v2 로 갈아입혀 차용. Orders 탭(§ 6.1)과 동일한 `flat-card + <table>` 패턴 — 시각 일관성.

```
[탭 본문 영역]
 ├─ (ready 시) flat-card (padding 0 / overflow hidden)
 │   └─ <table>
 │       ├─ <thead surface-2>
 │       │   ├─ 환불번호
 │       │   ├─ 주문번호
 │       │   ├─ 환불 금액
 │       │   ├─ 상태
 │       │   └─ 요청일
 │       └─ <tbody>
 │           └─ <tr> × N (border-top)
 │               ├─ <td mono>{shortenedRefundId}</td>
 │               ├─ <td mono>{shortenedOrderId}</td>
 │               ├─ <td bold>{amountLabel}</td>
 │               ├─ <td><StatusChip variant=ok|end|sold>{label}</StatusChip></td>
 │               └─ <td text-3>{dateLabel}</td>
 └─ (empty 시) <EmptyState emoji="💳" title="환불 내역이 없습니다" message="환불은 내 티켓 탭에서 각 티켓의 환불 요청 버튼으로 시작할 수 있습니다." />
```

#### 8.1.2 컴포넌트 표 — 1차 PR 범위

| 이름 | 역할 | 위치 | props | 의존 |
|---|---|---|---|---|
| `RefundTab` | 탭 진입점. URL `?page=N` 동기화 + `useRefunds(page)` 호출 → `TabFetchState` 분기 | `tabs/Refund/RefundTab.tsx` | (라우트 element. props 없음) | `useRefunds` (§ 8.3), `TabFetchState` (§ 4.2.2), `RefundList`, `RefundsPager`, `EmptyRefunds`, `RefundsSkeleton`, `react-router-dom` `useSearchParams` |
| `RefundList` | `flat-card` 래퍼 + `<table>` 골격(`<RefundTableHeader/>` + `<tbody>` 슬롯). 행은 `rows.map` 으로 `<RefundRow/>` 렌더 | `tabs/Refund/components/RefundList.tsx` | `{ rows: RefundRowVM[] }` | Phase 0 `Card`(`variant='flat'`), `RefundTableHeader`, `RefundRow` |
| `RefundTableHeader` | `<thead>` 한 줄. 5개 컬럼 라벨을 `REFUND_COLUMNS` 상수에서 매핑 | `tabs/Refund/components/RefundTableHeader.tsx` | (props 없음 — 컬럼 고정) | `REFUND_COLUMNS` 상수 (`tabs/Refund/columns.ts`) |
| `RefundRow` | `<tr>` 1개. 5개 `<td>` 렌더. 상태 셀만 `<StatusChip/>`, 나머지 텍스트 | `tabs/Refund/components/RefundRow.tsx` | `{ row: RefundRowVM }` | Phase 0 `StatusChip` |
| `RefundsPager` | 페이지네이션 컨트롤. Orders 의 `OrdersPager`(§ 6.1) 와 동일 시그니처 | `tabs/Refund/components/RefundsPager.tsx` | `{ page: number; totalPages: number; onPageChange(next: number): void }` | Phase 0 `Button` |
| `EmptyRefunds` | 프로토타입 빈 상태 그대로. `EmptyState` thin wrapper — 이모지 💳 + 제목 + 환불 시작 안내 메시지 | `tabs/Refund/components/EmptyRefunds.tsx` | `{}` (CTA 없음 — § 8.1.5) | Phase 0 `EmptyState` |
| `RefundsSkeleton` | placeholder 6행. `RefundList` 와 같은 `flat-card` + `<table>` 안에 빈 `<tr>` 6개 | `tabs/Refund/components/RefundsSkeleton.tsx` | `{ rows?: number }` (기본 6) | Phase 0 `Card` |

`RefundRowVM` 시그니처는 § 8.2(API 매핑) 에서 확정. 본 표는 `{ refundId, displayRefundId, displayOrderId, amountLabel, statusVariant, statusLabel, dateLabel }` 형태가 들어온다고 가정.

#### 8.1.3 합성 결정 — Orders 패턴 복제

- `RefundList = RefundTableHeader + RefundRow[]` 로 § 6.1.3 의 Orders 합성과 동형.
- `RefundList` 본체:
  ```tsx
  <Card variant="flat" className="refunds-card">
    <table className="refunds-table">
      <RefundTableHeader />
      <tbody>
        {rows.map(row => <RefundRow key={row.refundId} row={row} />)}
      </tbody>
    </table>
  </Card>
  ```
- 페이저는 외부(자매 위치). `ready` + `totalPages > 1` 일 때만 마운트 — Orders 와 동일.
- 컬럼 정의(`REFUND_COLUMNS`)는 `tabs/Refund/columns.ts`:
  ```ts
  export const REFUND_COLUMNS = [
    { key: 'displayRefundId', label: '환불번호',  align: 'left' },
    { key: 'displayOrderId',  label: '주문번호',  align: 'left' },
    { key: 'amountLabel',     label: '환불 금액', align: 'left' },
    { key: 'statusLabel',     label: '상태',      align: 'left' },
    { key: 'dateLabel',       label: '요청일',    align: 'left' },
  ] as const;
  ```
- `RefundRow` 도 `OrderRow` 와 같은 정책 — 5칸 명시적 작성. 상태 셀만 `<StatusChip/>`. `REFUND_COLUMNS.map(...)` 으로 셀 생성 안 함(상태 셀이 텍스트가 아니라 일반화 어색).

#### 8.1.4 `MyPage/shared/DataTable` 승격은 1차 PR 보류

- 이제 표 패턴을 쓰는 탭이 **2개**(Orders + Refund) — § 4.4.3 / § 6.1.7 의 "사용처 ≥2 시 승격" 트리거에 해당.
- 1차 PR 에서는 **승격 보류**, 두 탭 모두 페이지 전용 컴포넌트로 복제 작성. 이유:
  1. Orders 의 컬럼 4개(§ 6.2.4 의 `eventTitle` drop) vs Refund 5개 — 컬럼 슬롯 일반화에는 cell-renderer 패턴이 필요해 PR 1개에 두 페이지 + 추상화까지 안고 가면 회귀 검출이 어려움.
  2. 두 탭의 status 매핑/페이저 모양/skeleton 행 수가 미세하게 다를 가능성 — 프로토타입 합류 시 안정화 후 공통점 좁히는 게 안전.
  3. shared-components.plan.md § 1.5 의 정신("우선 페이지에 두고 등장 시 승격") 그대로 적용.
- § 11 안건으로 등록: 두 탭 머지 후 `MyPage/shared/DataTable.tsx` 승격(컬럼 정의 prop + cell-renderer 패턴) — 별도 후속 PR.

#### 8.1.5 `EmptyRefunds` — 프로토타입 카피 그대로

```tsx
// tabs/Refund/components/EmptyRefunds.tsx
export function EmptyRefunds() {
  return (
    <EmptyState
      emoji="💳"
      title="환불 내역이 없습니다"
      message={
        <>환불은 <strong>내 티켓</strong> 탭에서 각 티켓의 환불 요청 버튼으로 시작할 수 있습니다.</>
      }
    />
  );
}
```

- CTA 없음 — Tickets 탭의 "환불 요청 버튼" 자체가 § 11 결정 대상이라 안내 메시지 안에 텍스트 강조만(`<strong>`).
- § 11 에서 Tickets 카드에 환불 버튼이 추가되면, 본 컴포넌트의 메시지 안 `<strong>내 티켓</strong>` 을 `<Link to="/mypage/tickets">내 티켓</Link>` 으로 교체 — 컴포넌트 표 변경 없음.
- 프로토타입의 `.stack-trace` 박스 외관은 v2 `EmptyState`(`src/components-v2/EmptyState/`)가 흡수했다고 가정 — 미흡 시 className 으로 보정(§ 11 시각 회귀 점검).

#### 8.1.6 Phase 0 자산 사용 — 신규 작성 X

| 자산 | 사용처 | API |
|---|---|---|
| `Card` | `RefundList`, `RefundsSkeleton` | `variant='flat'` |
| `StatusChip` | `RefundRow` | `variant='ok' / 'end' / 'sold'` 매핑 — § 8.2 |
| `Button` | `RefundsPager` (필요 시) | `variant='ghost'` |
| `EmptyState` | `EmptyRefunds` | § 4.2.1 |

#### 8.1.7 페이지 전용 신규 — 모두 `tabs/Refund/components/` 안

- 1탭 전용 컴포넌트만 존재. `MyPage/shared/` 승격 0 (§ 8.1.4 결론).
- 디렉토리 트리(§ 1)와 일치. 다만 § 1 의 `RefundList` 를 본 절에서 `RefundList` (테이블 컨테이너) + `RefundRow` (행) 로 분해 정의 — § 1 에는 둘 다 이미 명시.

#### 8.1.8 분해 원칙 (요약)

- 데이터 fetching 은 `RefundTab` 1곳. URL 의 `?page=N` 동기화도 `RefundTab` 책임 — Orders 와 동형.
- `RefundRow` 는 도메인 prop(`row: RefundRowVM`) 받지만, 자식 셀은 직접 작성. `<RefundCell/>` 추상화 안 함.
- Skeleton 행 6개 — 환불은 활동량이 적어 평균 표시 행 수가 Orders(8) 보다 적다는 가정. 첫 fold 채우기 충분.
- 모바일 카드 폴백, 환불 *요청* 버튼(Tickets 탭 합류), `MyPage/shared/DataTable.tsx` 승격, `refundRate`/`completedAt` 필드 노출은 모두 § 11 안건.
- 프로토타입의 인라인 `style={{}}` / 직접 호출 `r.refundAmount.toLocaleString()` / `slice(0, 12)` 직조립은 가져오지 않음 (SPEC § 0). 변환은 어댑터(§ 8.2)에서.

### 8.2 API 매핑
### 8.3 상태 처리

`useRefunds(page)` 의 `FetchState<RefundsData>` 를 `TabFetchState`(§ 4.2.2) 로 분기. URL `?page=N` owner 는 `RefundTab` (Orders 와 동형). § 8 시나리오 A 기준 — B / C 는 빈 상태 행 1줄만 노출 + 다른 분기 미적용.

| 상태 | 트리거 | 렌더 | 비고 |
|---|---|---|---|
| `loading` | 첫 fetch 또는 페이지 변경 직후 | `<RefundsSkeleton rows={6} />` | flat-card + `<RefundTableHeader/>` 그대로 + 빈 `<tr>` 6행. 헤더는 정적이라 첫 렌더부터 노출 |
| `error` | 4xx-other / 5xx / 네트워크 (§ 8.2 에러 정책) | `<TabErrorBox onRetry={refetch} />` | flat-card 영역만 차지. 페이저 미렌더 |
| `empty` | `totalElements === 0` (모든 시나리오 공통) | `<EmptyRefunds />` (§ 8.1.5) | 페이저 미렌더. 시나리오 A 의 정상 빈 상태 = 프로토타입의 의도와 동일. 시나리오 B/C 일 경우엔 fetch 자체 없이 즉시 이 분기 |
| `ready` | 정상 응답 + 행 ≥ 1 | `<RefundList rows={...} />` + `<RefundsPager .../>` (`totalPages > 1` 일 때만) | 페이저는 응답의 `page / totalPages` 직접 사용 |

#### 8.3.1 빈 상태 — 모든 시나리오 공통

§ 8.1.5 의 `EmptyRefunds` 가 세 시나리오에서 동일하게 등장:

| 시나리오 | 진입 경로 |
|---|---|
| **A — 정상 구현** | `getRefunds` 정상 응답 + `content: []` → `TabFetchState.empty` 분기 → `EmptyRefunds` |
| B — API 없음 | `RefundTab` 이 fetch 자체 안 함. 본문 첫 렌더부터 `EmptyRefunds` (loading/error 분기 미적용) |
| C — API 있는데 범위 밖 | B 와 동일 동작. § 11 메모로 "조회 미연결 — 후속 PR" 표시 |

본 plan 이 채택한 시나리오는 **A**. B / C 코드 분기는 작성하지 않음.

빈 상태의 메시지/이모지는 § 8.1.5 그대로 — 프로토타입의 카피·이모지 보존이 시나리오 A 의 디자인 의도.

#### 8.3.2 로딩 — `RefundsSkeleton`

- `flat-card` + `<table>` + `<RefundTableHeader/>` (실제 헤더 그대로) + `<tbody>` 안에 빈 `<tr>` 6개.
- 각 행의 `<td>` 5칸 안에 placeholder 막대 (mono ID 자리 짧음 ×2 / 금액 자리 중간 / 상태 자리 chip 모양 / 날짜 자리 중간).
- 행 수 6개 — § 8.1.8 결정대로 환불 활동량이 적다는 가정. 첫 fold 채우기 목적.
- 깜빡임 토큰 정책은 § 5.3.2 / § 6.3.2 와 동일.

#### 8.3.3 에러 — `TabErrorBox`

- 제목: `"환불 내역을 불러오지 못했습니다"`
- 메시지: `"네트워크 또는 서버 오류일 수 있어요. 잠시 후 다시 시도해주세요."`
- CTA: `<Button variant="primary">다시 시도</Button>` → `useRefunds().refetch()` (현재 페이지 유지).
- 페이지 변경 후 에러: `<Button variant="ghost">첫 페이지로</Button>` 보조 CTA — § 11.
- HTTP 상태별 카피 분기는 1차 PR 범위 외(§ 11). 한 가지 카피로 시작.

#### 8.3.4 페이징 — Orders 와 동형

§ 6.2.8 의 결정을 그대로 적용:

| 항목 | 값 |
|---|---|
| 페이지 사이즈 | `size = 20` (v1 호환 — `pages/MyPage.tsx:471` 의 `{ page: 0, size: 20 }`) |
| URL 동기화 | `/mypage/refund?page=N`. `RefundTab` 이 `useSearchParams` owner. `?page` 미존재 = 1로 처리 |
| 0-base / 1-base | URL 1-base / API 0-base 변환은 `RefundTab` 안에서 |
| `?page=1` 직접 노출 안 함 | Orders 와 동일 (§ 2 일관성) |
| 페이저 모양 | prev/next + `3 / 12` 표기 (1차 PR 미니멀) |
| `totalPages ≤ 1` | 페이저 미렌더 |

#### 8.3.5 `useRefunds()` 리턴 시그니처

```ts
// src/pages-v2/MyPage/tabs/Refund/hooks.ts
type RefundsData = {
  rows: RefundRowVM[];
  page: number;        // 1-base (UI 노출용)
  totalPages: number;
  totalElements: number;
};

export function useRefunds(page: number /* 1-base */):
  FetchState<RefundsData> & { refetch: () => void };
```

- 내부에서 1-base → 0-base 변환 후 `getRefunds({ page: page - 1, size: 20 })` 호출.
- `useEffect` 의존성 `[page]`. 페이지 변경 = 새 fetch (keep-previous-data 도입은 § 11).
- 캐시 라이브러리 미도입(INVENTORY § 5)이므로 같은 페이지 재방문 시 재호출. § 11 안건.

#### 8.3.6 페이저 행동 — Orders 와 동형

- `onPageChange(next)` → `RefundTab` 이 `setSearchParams({ page: String(next) }, { replace: false })`.
- `replace: false` (push) — 명시적 사용자 액션이라 history entry 1칸 사용.
- 페이지 변경 직후 `window.scrollTo({ top: 0 })` 도입 여부는 § 11 (Orders 와 동시 결정).

#### 8.3.7 동시 상태 / 경합

- 1차 PR 범위는 조회 only. 환불 *요청* mutation(`refundTicketByPg`, `refundOrder`)은 Tickets 탭(§ 11) 으로 이관.
- 환불 요청 성공 → 본 탭으로 deep-link(`/mypage/refund`) + 자동 refetch 는 § 11 안건. 1차 PR 에서는 사용자가 탭 클릭 시점에 새로 fetch 됨.
- 빠른 페이지 연타 stale 응답 처리 — Orders 와 동일 정책(§ 6.3.6). axios cancel 토큰 도입은 § 11.

#### 8.3.8 시나리오 B / C 후퇴 경로 (참고)

본 plan 채택은 A 이지만, 만약 향후 BE 스펙 변경으로 `getRefunds` 가 비활성화되거나 운영상 1차 PR 에서 제외하기로 하면:

| 후퇴 항목 | 변경 |
|---|---|
| `RefundTab` 본체 | `useRefunds` / `TabFetchState` 제거 → `<EmptyRefunds />` 직접 반환 |
| `RefundList` / `RefundRow` / `RefundTableHeader` / `RefundsPager` / `RefundsSkeleton` | 코드 유지 또는 미사용 export 정리 (cutover 시) |
| `tabs/Refund/hooks.ts` / `adapters.ts` / `types.ts` | unused — § 12 PR 분할에서 제외 |
| § 11 메모 | "환불 조회 — 다음 PR 에서 합류" 라인 추가 |

후퇴는 기존 컴포넌트 시그니처 변경 없이 마운트 분기만 빼는 형태 → 미래 재합류 시 비용 0.

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
