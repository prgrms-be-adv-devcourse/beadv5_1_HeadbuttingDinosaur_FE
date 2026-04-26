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
(작성 예정)

## 5. 탭 1: 내 티켓
(작성 예정)
### 5.1 컴포넌트 분해
### 5.2 API 매핑
### 5.3 상태 처리

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
