/**
 * 임시 dev 라우트 (`/_dev/landing-hero-stats`).
 * Landing.plan.md §12.2 검증 절차 A~D 를 라이브로 확인하기 위한 마운트 셸.
 * 실제 API 와 결선된 <HeroSection> + <StatsSection> 단독 렌더.
 *
 * - onBrowseEvents 는 alert stub. 실제 navigate 는 PR 4 통합 단계에서 연결.
 * - onOpenPalette 미주입 → §7.2 fallback (onBrowseEvents 동일 동작) 검증.
 *
 * cutover 또는 PR 4 cleanup 커밋에서 제거 예정.
 */

import { HeroSection } from '../Landing/sections/HeroSection';
import { StatsSection } from '../Landing/sections/StatsSection';
import { useLandingStats } from '../Landing/hooks';

export default function HeroStatsShowcase() {
  const stats = useLandingStats();
  const onBrowseEvents = () => {
    alert('onBrowseEvents → /events?v=2 (stub)');
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 24px 64px' }}>
      <header style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 18, margin: 0 }}>Landing Hero + Stats — dev showcase</h1>
        <p style={{ fontSize: 12, color: 'var(--text-3)', margin: '4px 0 0' }}>
          Landing.plan.md §12.2 검증. <code>/_dev/landing-hero-stats</code>
        </p>
      </header>

      <HeroSection onBrowseEvents={onBrowseEvents} />
      <StatsSection query={stats} />
    </div>
  );
}
