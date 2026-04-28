/**
 * Landing 페이지 라우트 진입점.
 * PR 4 (CTA + 통합 + 라우터) — Landing.plan.md §12.4 / §1 / §7.
 *
 * 책임:
 * - useNavigate 콜백 합성 (Hero / CTA → `/events?v=2`).
 * - 3 데이터 훅 (`useLandingStats / useLandingCategories / useFeaturedEvents`)
 *   호출 → `<Landing>` 에 props 주입.
 * - HeroSection 의 `useFirstPage` 는 내부 호출 (모듈 캐시 + in-flight 공유로
 *   네트워크 1회 — §5.5). 본 컨테이너는 Hero 데이터 의존이 없으므로 미주입.
 *
 * 미결선 (의도):
 * - `onOpenPalette`: PR 0 (⌘K 팔레트) 머지 후 결선. 현재 미주입 →
 *   HeroSection 이 `onBrowseEvents` 로 fallback (§7.2).
 * - 로그인 분기 (#8): `useFeaturedEvents` 가 향후 useAuth 분기 도입 예정
 *   (별 커밋). 본 컨테이너 변화는 hooks.ts 가 흡수하므로 zero diff.
 */

import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { Landing } from './Landing';
import {
  useFeaturedEvents,
  useLandingCategories,
  useLandingStats,
} from './hooks';

export default function LandingPage() {
  const navigate = useNavigate();
  const statsQuery = useLandingStats();
  const categoriesQuery = useLandingCategories();
  const featuredQuery = useFeaturedEvents();

  const goEvents = useCallback(() => {
    navigate('/events?v=2');
  }, [navigate]);

  return (
    <Landing
      onBrowseEvents={goEvents}
      onStart={goEvents}
      statsQuery={statsQuery}
      categoriesQuery={categoriesQuery}
      featuredQuery={featuredQuery}
    />
  );
}
