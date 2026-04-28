# DevTicket v2 디자인 & API 스펙

리뉴얼 작업의 **단일 기준점**. 클로드코드 프롬프트에서 항상 이 문서를 참조.

---

## 0. 공통 규칙 (모든 페이지)

### 보존 vs 신규
| 보존 (재활용) | 신규 작성 |
|---|---|
| `src/api/` | 모든 페이지 컴포넌트 |
| `src/services/` | 모든 UI 컴포넌트 |
| `src/types/` (도메인 타입) | 페이지 내 상태/폼/인터랙션 |
| `src/lib/auth` | 스타일 시스템 전체 |
| `src/lib/utils` (단, prototype과 중복은 통합) | 라우팅 (필요 시) |
| 환경 변수, 빌드 설정 | 전역 상태 (필요 시) |

### 작업 위치
- 신규 코드: `src/pages-v2/`, `src/components-v2/`, `src/styles-v2/`
- 기존 코드: 건드리지 않음. cutover PR에서 일괄 삭제.

### UI 작업 원칙
- 프로토타입의 마크업/UX는 **충실히 재현**
- 단, 다음은 가져오지 않음:
  - 인라인 `style={{}}` 객체 (동적 값만 인라인 허용)
  - `window.*` 글로벌
  - `useStateA`, `useStateE` 같은 별칭
- 프로젝트 CSS 솔루션 (Tailwind / CSS Modules / styled-components 중 명시) 사용
- TypeScript 강제 (프로토타입은 jsx지만 v2는 tsx)

### 페이지 디렉토리 구조 (표준)
```
src/pages-v2/{Page}/
├── index.tsx           ← 페이지 컨테이너 (라우트 진입점)
├── {Page}.tsx          ← 프레젠테이션 (큰 페이지는 더 분해)
├── components/         ← 페이지 전용 서브 컴포넌트
├── adapters.ts         ← API ↔ VM 변환
├── hooks.ts            ← 데이터 페칭 훅 (useEvents 등)
└── types.ts            ← VM 타입
```

### 디자인 톤
"개발자를 위한 IDE/터미널 무드를 가진 단정한 커머스." 정보 밀도 높게, 모노스페이스 폰트로 메타정보 강조.

### 채택할 토큰 (prototype/tokens.css 기준)
- **폰트**: Geist (UI), Geist Mono (코드/메타)
- **Brand**: `#4F46E5` (indigo-600). hover `#4338CA`, light `#EEF2FF`
- **Accent palette** (이벤트별 회전): indigo / sky / emerald / amber / violet / pink / red — `prototype/common.jsx`의 `accent()` 매핑 그대로
- **Radius**: 6 / 8 / 12 / 16 / full
- **다크모드**: `[data-theme="dark"]` 셀렉터로 토큰 오버라이드

### 공용 컴포넌트 (Phase 1에서 모두 만들고 시작)
- **Eyebrow pill** (term-green-soft 배경, mono 11.5px, 좌측 dot)
- **StatusChip** (`ok` / `sold` / `free` / `end` variants, 좌측 dot)
- **Chip** (필터/태그용, active 상태 brand color)
- **Kbd** (키보드 단축키 표시)
- **SectionHead** (mono "// hint" + h2 + caption + action 슬롯)
- **Button** (primary / ghost / sm / lg / full variants)
- **Input** (label + error 포함)
- **Card** (flat-card 변형)
- **Icon** (prototype `common.jsx`의 lucide-style SVG 아이콘셋)
- **Layout chrome** (사이드바 / 탭 / 상태바 — Phase 0)

---

## 1. Login

**참고**: `prototype/Login.jsx`

### 레이아웃
- 카드 폭 460px, 화면 중앙
- 카드 위에 로고 + 서비스명 (DT 마크 36×36 brand bg, 흰 글씨, mono 14px "DT")
- 페이지 타이틀 22px semibold "로그인" + 서브카피 14px text-3
- 카드 padding 28px

### 인풋
- height 42, padding 0 14px, border 1px border-2, radius 8
- 에러 시 border `var(--danger)` + 하단 12px danger 텍스트 (`× 메시지` 형식)
- focus 시 border brand + soft glow

### 버튼
- 로그인: brand primary, full-width, lg
- 로딩 중: `◐` 회전 스피너 + "로그인 중..."
- 회원가입 링크: 카드 하단 구분선 아래, brand color, semibold

### API 연동
- POST `/api/auth/login` { email, password } → { accessToken, refreshToken, user }
- 성공 시 토큰 저장 + 리다이렉트 (메인 또는 returnTo)
- 401: "이메일 또는 비밀번호가 일치하지 않습니다"
- 422: 필드별 검증 에러 매핑
- 5xx: "일시적인 오류입니다. 잠시 후 다시 시도해주세요."
- 회원가입 링크는 임시로 `/signup` 라우트 (기존 페이지)로 연결, 또는 별도 신규 작업

---

## 2. Cart

**참고**: `prototype/Cart.jsx`

### 레이아웃
- h1 26px bold "장바구니" + 14px text-3 부제
- 2-column grid: `minmax(0,1fr) 320px`. 모바일은 stack
- 우측 주문 요약 카드 sticky (top 12)

### 빈 상태
- 가운데 정렬 카드 (40px padding)
- 큰 이모지 🛒 + 17px 안내문 + "이벤트 둘러보기" primary 버튼

### 아이템 카드
- padding 16, gap 14, flex
- 좌측 72×72 thumbnail: `linear-gradient(135deg, accent18, accent38)` + `</>` 글리프
- 중앙: 제목 15px semibold + 📅 날짜 + 수량 컨트롤 + 삭제 버튼
- 우측: 합계 금액 16px bold

### 수량 컨트롤
- 28×28 사각 버튼 (border-2, radius 6)
- `−` `숫자` `+` 형태

### 주문 요약
- 16px semibold 헤더 "주문 요약"
- Row: 상품 합계 / 수수료 / 할인 / (구분선) / 총 결제금액 (bold)
- "결제하기" primary full-width lg
- 하단 12px caption 약관 안내

### 상태 관리
- 장바구니는 **로컬 상태 + localStorage 동기화** (서버 저장 안 함, 기존 패턴 확인 필요)
- 결제 시점에 서버로 주문 생성

### API 연동
- POST `/api/orders` { items: [{ eventId, quantity }] } → { orderId }
- POST `/api/payments` { orderId, paymentMethod } → 결제 페이지 또는 완료 처리
- 결제 완료 시 장바구니 비우기 + 마이페이지 티켓 탭으로

---

## 3. MyPage

**참고**: `prototype/MyPage.jsx`

### 프로필 헤더
- 52×52 아바타 (brand bg, 흰 이니셜 mono 20px bold)
- 닉네임 22px bold + ONLINE 배지
- 가입일 / 예치금 잔액 한 줄
- 우측 "프로필 수정" ghost sm

### 탭 (segmented)
- 트랙: surface-2 배경, padding 4, radius 8, width fit-content
- active: editor-bg 흰 카드 + soft shadow + bold
- 4개 탭: 내 티켓 / 주문 내역 / 예치금 / 환불 내역 (각 좌측 13px 아이콘)

### 내 티켓 탭
- 헤더: 카운트 요약
- grid auto-fill `minmax(340px, 1fr)`, gap 12
- 카드: 좌측 56px accent gradient stripe + 점선 우측 보더
- API: GET `/api/me/tickets`

### 주문 내역 탭
- 깔끔한 테이블 (surface-2 헤더)
- 컬럼: 주문번호(mono brand색) / 이벤트 / 금액(bold) / 상태(chip) / 주문일시
- API: GET `/api/me/orders?page=N`
- 페이지네이션 또는 무한스크롤 추가

### 예치금 탭
- 큰 카드 padding 28
- "예치금 잔액" 라벨
- 38px black 숫자 + 단위 "원"
- 충전하기(primary) / 출금 요청(ghost) 버튼
- API: GET `/api/me/wallet`, POST `/api/me/wallet/charge`

### 환불 내역 탭
- 기존 API 존재 여부 확인 필요
- 없으면 빈 상태로 임시 처리 (프로토타입의 empty state)

---

## 4. EventDetail

**참고**: `prototype/EventDetail.jsx`

### 레이아웃
- breadcrumb: "이벤트 › 제목"
- 2-column grid: `minmax(0,1fr) 340px`, gap 28
- 우측 purchase panel sticky (top 12)

### 좌측: 콘텐츠
- **Hero banner**: height 240, radius 12
  - `linear-gradient(135deg, accent15 0%, accent35 100%)`
  - 가운데 거대한 `❯_` 글리프 (72px mono accent color, opacity 0.35)
- 카테고리 라벨 (mono 12px uppercase) + status chip
- 타이틀 28px bold
- 기술 스택 chip 그룹
- Info card: 일시 / 장소 / 주최 / 잔여 좌석 (이모지 + 라벨 + 값)
- 이벤트 소개 (h2 17px + 본문 + 불릿 리스트)

### 우측: Purchase Panel
- "티켓 가격" 라벨 + 30px black 가격 (무료면 term-green-dim)
- 수량 컨트롤 (price > 0 && canBuy)
- 합계 행
- "바로 구매하기" primary full lg + "장바구니 담기" ghost full
- 매진 시: disabled 버튼 "매진된 이벤트입니다"
- 안내 박스 (좌측 brand bar)

### API 연동
- GET `/api/events/:id` → 상세 정보
- "바로 구매": 인증 체크 → 장바구니 추가 후 cart 페이지로
- "장바구니 담기": 인증 체크 → 장바구니에 추가 (토스트 또는 인라인 피드백)
- 비로그인 시: 로그인 페이지로 (returnTo 파라미터)

### 상태
- 로딩 (스켈레톤 - hero + 텍스트 라인)
- 404 (이벤트 없음)
- 5xx (재시도 버튼)

---

## 5. EventList

**참고**: `prototype/EventList.jsx`

### Hero
- Eyebrow pill (term-green-soft)
- h1 34px black + subcopy 15px
- 키보드 힌트: `⌘K 검색` `/` `j k` `↵` (kbd 컴포넌트)

### 검색 + 필터
- 검색바 height 44, search 아이콘
- 카테고리 chip row + 기술 스택 chip row
- chip active: brand light 배경 + brand 텍스트

### Event Card 그리드
- auto-fill `minmax(280px, 1fr)`, gap 16
- 좌측 3px accent bar
- 상단 chrome (file tab 느낌): mono 11px `#카테고리 · 시각 · 우측 status chip`
- 본문: 제목 16px (2 line clamp) / 메타 라인 (일시/장소/주최) / 기술 스택 태그 (max 3개 + `+N`)
- 푸터 (border-top dashed): PRICE / STOCK 라벨 + 값
- hover: borderColor accent + translateY -2 + shadow
- focused: borderColor accent + ring

### 빈 상태
- stack-trace 박스 ("🔍 검색 결과가 없습니다") + 필터 초기화 버튼

### API 연동
- GET `/api/events?q={keyword}&category={cat}&stack={stack}&page={N}`
- URL 쿼리스트링과 필터 상태 동기화 (뒤로가기 작동)
- 검색어 디바운스 (300ms)
- 페이지네이션 또는 무한스크롤

### 신규 상태 (프로토타입에 없음)
- 로딩 스켈레톤 (카드 8개 placeholder)
- 검색어 있는 빈 상태 vs 없는 빈 상태 구분
- 네트워크 에러 → 재시도 버튼

---

## 6. Landing

**참고**: `prototype/Landing.jsx` — 가장 복잡. 마지막에 작업.

### Hero (2-column)
- 좌측: Eyebrow + h1 44px black + 본문 + CTA 버튼들 + 메타 코멘트
- 우측: TypedTerminal (별도 파일로 분리, 타이핑 애니메이션)

### Stats (4-column)
- 카드 padding `18px 20px` + mono hint + 30px black 숫자

### Categories (6-column)
- 타일 버튼 + 34×34 사각 아이콘 (약자) + 카테고리명 + 카운트

### Featured (5 rows)
- 행 grid `36px 56px 1fr auto`
- 순번 / 그라디언트 박스 / 정보 / 가격

### CTA 카드
- dashed border + brand-light 그라디언트 + 헤드라인 + 시작하기 버튼

### Section Head 패턴
- mono "// hint" + h2 20 + caption + 액션 슬롯, border-bottom

### API 연동
- GET `/api/events` → stats 계산용 (총 이벤트 수, 판매중, 잔여 좌석 합)
- GET `/api/events?featured=true&limit=5` → Featured 5 rows
- GET `/api/categories?withCounts=true` → Categories 카운트
- 캐싱 권장 (랜딩 트래픽 많음)

### 카테고리 클릭 시
- `/events?category=컨퍼런스` 식으로 라우팅 + EventList에서 필터 자동 적용

---

## 7. Layout / Chrome

**참고**: `prototype/Layout.jsx`, `prototype/ide-theme.css`, `prototype/DevTicket_IDE.html`

전체 IDE 컨셉 chrome 적용. Phase 0에서 가장 먼저 작업.

### 구성 (프로토타입 기준)
- 상단 타이틀바 (윈도우 컨트롤 + 서비스명 + 메뉴)
- 좌측 사이드바 (파일 트리 스타일 네비게이션)
- 탭바 (현재 열린 페이지)
- 본문 영역 (gutter 라인 번호 + 콘텐츠)
- 우측 미니맵 (선택)
- 하단 상태바 (브랜치명, 알림, 테마 토글 등)

### 의사결정 필요
프로토타입의 IDE 컨셉을 그대로 갈지, 컨셉만 차용하고 구조는 단순화할지 팀 논의:
- **Option A**: IDE 충실 재현 (사이드바 파일트리, 미니맵 등 모두)
- **Option B**: 컨셉만 (gutter, mono 폰트, 상태바) + 일반적인 nav 구조

기본 가정 **A**. 변경 시 SPEC 갱신.

### 라우팅 통합
- 사이드바 / 탭의 항목이 라우트와 동기화
- 현재 라우트 active 표시
- 인증 상태에 따라 표시 항목 변경

---

## 8. 토큰 머지 가이드

기존 `tokens.css`와 `prototype/tokens.css` 충돌 시:

1. **그대로 채택**: brand 계열, accent 팔레트, 폰트 (Geist 도입), radius, semantic colors
2. **머지 검토**: surface 계열, text 계열, border — 기존과 토큰명 다르면 alias 추가
3. **신규 추가**: IDE 전용 토큰 (`--editor-bg`, `--chrome`, `--gutter`, `--term-green` 등)

신규 토큰 위치: `src/styles-v2/tokens.css`. 컴포넌트 안에 박지 말 것.

---

## 9. 범위 밖 페이지 / 항목 (계속 갱신)

### 프로토타입에 없는 기존 페이지
작업 시작 전 매핑 테이블에 채워넣기:

| 기존 페이지 | 처리 방침 |
|---|---|
| /signup, /signup/complete | 기존 화면 유지 (Phase 0 범위 밖) |
| /oauth/callback, /social/profile-setup | 기존 소셜 로그인 플로우 유지 |
| /payment, /payment/complete, /payment/success, /payment/fail | 기존 결제 플로우 유지 (v2 페이지 작업 후 점진 이관) |
| /wallet/charge/success, /wallet/charge/fail | 기존 유지 |
| /seller-apply | 기존 유지 |
| /seller/* | 토큰만 자동 적용, 화면 구조는 판매자 영역 현행 유지 |
| /admin/* | 토큰만 자동 적용, 화면 구조는 관리자 영역 현행 유지 |
| /not-found(*) | 기존 유지 |

### 기존에 없는 프로토타입 항목
| 프로토타입 항목 | 처리 |
|---|---|
| Landing 페이지 | 신규 페이지로 작성 (현재 `/`는 EventList) |
| Landing TypedTerminal | 신규 컴포넌트로 작성 |
| IDE Layout chrome (타이틀바/사이드바/탭/상태바) | Phase 0 공용 레이아웃으로 신규 작성 |
| MyPage 환불 탭 | `src/api/refunds.api.ts` 활용하여 구현 가능 (빈 상태 포함) |

### 의사결정 보류
| 항목 | 상태 |
|---|---|
| Layout chrome A/B 선택 | **Option A 확정**: 프로토타입의 IDE chrome(사이드바/탭/상태바) 구조를 충실히 재현 |
| 장바구니 서버 저장 여부 | **서버 저장 확정**: `src/pages/Cart.tsx`가 `getCart/addCartItem/clearCart` 사용 |
| CSS 솔루션 | **기존 방식 유지 확정**: 전역 CSS(`src/styles/globals.css`) + 컴포넌트 `className` + 필요한 인라인 스타일 (Tailwind/CSS Modules/styled-components 미사용) |
| 데이터 페칭 라이브러리 | **추가 라이브러리 미도입 확정**: axios + `useEffect/useState` 기반 현행 패턴 유지 (React Query/SWR 미사용) |
| 애니메이션 라이브러리 (Landing TypedTerminal 한정) | **예외 도입 확정**: `react-type-animation` 도입 (gzip ~3KB). Landing.plan.md §11 #10 결정. 사용 범위는 `src/pages-v2/Landing/components/TypedTerminal.tsx` 단일 컴포넌트로 한정하며, 다른 위치에서 재사용 요청 발생 시 별도 검토 |
| TypeScript 강제 적용 여부 | **강제 적용 확정**: 현행 페이지/컴포넌트가 `.tsx` 기반이므로 v2도 TSX로 통일 |
| API/DTO 변경 허용 여부 | **변경 최소화 확정**: 기존 `src/api/*.ts` 계약을 유지하고 UI 계층에서만 변환 |

---

## 10. API 재활용 가이드

### 페이지별 의존 API (작업 전 실제 경로 확인하여 갱신)

| 페이지 | 사용 API | 위치 |
|---|---|---|
| Login (`prototype/Login.jsx`) | `login` | `src/api/auth.api.ts` |
| EventList (`prototype/EventList.jsx`) | `getEvents`, `searchEvents`, `getCategorySummary`, `recommendEvents`, `getTechStacks`, `extractTechStacks` | `src/api/events.api.ts`, `src/api/auth.api.ts`, `src/api/techStacks.ts` |
| EventDetail (`prototype/EventDetail.jsx`) | `getEventDetail`, `addCartItem` | `src/api/events.api.ts`, `src/api/cart.api.ts` |
| Cart (`prototype/Cart.jsx`) | `getCart`, `addCartItem`, `clearCart`, `createOrder`, `recommendEvents` | `src/api/cart.api.ts`, `src/api/orders.api.ts`, `src/api/events.api.ts` |
| MyPage (`prototype/MyPage.jsx`) | `getTickets`, `getOrders`, `cancelOrder`, `getWalletBalance`, `getWalletTransactions`, `startWalletCharge`, `withdrawWallet`, `getRefunds`, `getRefundInfo`, `refundTicketByPg`, `refundOrder`, `getTechStacks`, `updateProfile`, `changePassword`, `withdrawUser`, `extractTechStacks` | `src/api/tickets.api.ts`, `src/api/orders.api.ts`, `src/api/wallet.api.ts`, `src/api/refunds.api.ts`, `src/api/auth.api.ts`, `src/api/techStacks.ts` |
| Landing (`prototype/Landing.jsx`) | (신규 매핑 필요) `getEvents` 기반 통계/featured, 카테고리 API 유무 확인 후 확정 | 우선 `src/api/events.api.ts` |
| Layout (`prototype/Layout.jsx`) | `logout` (+ 인증 컨텍스트) | `src/api/auth.api.ts` |

### 어댑터 규칙 (필수)
- 모든 API 응답은 페이지 단위 `adapters.ts` 거쳐서 VM으로 변환
- 컴포넌트는 VM만 알고 API 형태는 모름
- VM 타입은 페이지 디렉토리의 `types.ts`에 정의

### 어댑터 예시
```ts
// src/pages-v2/EventList/types.ts
export type EventVM = {
  eventId: string;
  title: string;
  category: string;
  price: number;
  remainingQuantity: number;
  status: 'ON_SALE' | 'SOLD_OUT';
  eventDateTime: string;
  techStacks: string[];
  location: string;
  host: string;
};

// src/pages-v2/EventList/adapters.ts
import type { ApiEvent } from '@/types/api';
import type { EventVM } from './types';

export function toEventVM(api: ApiEvent): EventVM {
  return {
    eventId: api.id,
    title: api.title,
    category: api.category.name,
    price: api.price.amount,
    remainingQuantity: api.stock.remaining,
    status: api.saleStatus === 'OPEN' ? 'ON_SALE' : 'SOLD_OUT',
    eventDateTime: api.schedule.startAt,
    techStacks: api.tags.filter(t => t.type === 'tech').map(t => t.name),
    location: api.venue.address,
    host: api.organizer.name,
  };
}
```

### 데이터 페칭 훅
- React Query / SWR / 기존 패턴 확인 후 따름
- 로딩 / 에러 / 빈 상태 모두 처리
- 에러 시 재시도 가능

```ts
// src/pages-v2/EventList/hooks.ts
export function useEvents(params: EventListParams) {
  return useQuery({
    queryKey: ['events', params],
    queryFn: () => api.events.list(params),
    select: (res) => ({
      items: res.items.map(toEventVM),
      total: res.total,
      hasNext: res.hasNext,
    }),
  });
}
```

### plan에 반드시 포함
페이지별 plan 작성 시 API 매핑 테이블 필수:

```markdown
## API 매핑

| 프로토타입 mock 필드 | 실제 API 필드 | 비고 |
|---|---|---|
| event.eventId | event.id | 필드명 차이 |
| event.remainingQuantity | event.stock.remaining | 중첩 |
| event.status | event.saleStatus | 값 변환 (OPEN→ON_SALE) |
| event.techStacks | event.tags.filter(...) | 변환 로직 필요 |
```

### 신규로 처리해야 할 상태
프로토타입엔 없지만 실제 운영에 필요:
- 로딩 (스켈레톤 또는 스피너)
- API 에러 (재시도 가능)
- 빈 결과 (검색어 유무에 따라 메시지 다름)
- 권한 없음 (401 → 로그인 리다이렉트, 403 → 접근 불가 안내)
- 네트워크 끊김
- 페이지네이션 / 무한스크롤