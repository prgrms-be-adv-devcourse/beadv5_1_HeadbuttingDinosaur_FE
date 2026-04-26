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
(작성 예정)

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
