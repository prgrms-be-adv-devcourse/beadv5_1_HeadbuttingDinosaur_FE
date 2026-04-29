/**
 * Landing 페이지 컨테이너 — 5 섹션 세로 조합.
 * PR 4 (CTA + 통합 + 라우터) — Landing.plan.md §12.4 / §1 / §6.6.
 *
 * editor-scroll / gutter / editor-body chrome 안에 Hero → Stats →
 * Categories → Featured → CTA 순. 자체 상태 / 데이터 페치 없음 — 모든
 * 데이터는 컨테이너 (`index.tsx`) 가 hooks 로 채워 props 로 전달 (§1, §6.6).
 *
 * 단, Hero 우측 TypedTerminal 의 카운트 합성을 위해 HeroSection 이
 * 내부적으로 `useFirstPage()` 를 직접 호출 (PR 2 결정 — 모듈 캐시 + in-flight
 * 공유로 네트워크 1회). 그 외 Stats / Categories / Featured 는 query 패스스루.
 *
 * Props 튜닝:
 * - TypedTerminal 타이밍 (typingSpeedMs / outputDelayMs / nextLineDelayMs /
 *   restartDelayMs / loop): HeroSection 으로 forward.
 * - gutter 줄 수 (gutterLineCount): 기본 80 (프로토타입). 화면 비율이 맞지
 *   않으면 컨테이너에서 override.
 * - CTA 카피 override (ctaHeadline / ctaSubcopy / ctaButtonLabel).
 *
 * 접근성:
 * - gutter 는 장식 — aria-hidden="true" (chrome 컨벤션).
 * - 각 섹션은 자체 aria-label + aria-busy 를 가짐 (PR 2/3 에서 처리).
 * - prefers-reduced-motion: 모션은 TypedTerminal / Categories / Featured 가
 *   각자 가드. 컨테이너 자체에 모션 없음.
 */

import { CategoriesSection } from './sections/CategoriesSection';
import { CtaSection } from './sections/CtaSection';
import { FeaturedSection } from './sections/FeaturedSection';
import { HeroSection } from './sections/HeroSection';
import { StatsSection } from './sections/StatsSection';
import type {
  UseFeaturedEventsReturn,
  UseLandingCategoriesReturn,
  UseLandingStatsReturn,
} from './hooks';

export interface LandingProps {
  /** Hero "이벤트 둘러보기 →" 핸들러. 보통 `/events?v=2` navigate. */
  onBrowseEvents: () => void;
  /** Hero "빠른 검색 ⌘K" 핸들러. 미주입 시 onBrowseEvents 로 fallback (§7.2). */
  onOpenPalette?: () => void;
  /** CTA "시작하기 →" 핸들러. 보통 `/events?v=2` navigate. */
  onStart: () => void;

  statsQuery: UseLandingStatsReturn;
  categoriesQuery: UseLandingCategoriesReturn;
  featuredQuery: UseFeaturedEventsReturn;

  /** TypedTerminal 라인별 cmd 타이핑 ms */
  typingSpeedMs?: number;
  /** cmd 완료 후 out 노출까지 ms */
  outputDelayMs?: number;
  /** out 완료 후 다음 라인 시작까지 ms */
  nextLineDelayMs?: number;
  /** 마지막 라인 후 처음으로 돌아가기까지 ms */
  restartDelayMs?: number;
  /** TypedTerminal 루프 여부 */
  loop?: boolean;

  /** gutter 라인 수. 기본 80 (프로토타입) */
  gutterLineCount?: number;

  /** CTA 카피 override */
  ctaHeadline?: string;
  ctaSubcopy?: string;
  ctaButtonLabel?: string;
}

const DEFAULT_GUTTER_LINE_COUNT = 80;

export function Landing({
  onBrowseEvents,
  onOpenPalette,
  onStart,
  statsQuery,
  categoriesQuery,
  featuredQuery,
  typingSpeedMs,
  outputDelayMs,
  nextLineDelayMs,
  restartDelayMs,
  loop,
  gutterLineCount = DEFAULT_GUTTER_LINE_COUNT,
  ctaHeadline,
  ctaSubcopy,
  ctaButtonLabel,
}: LandingProps) {
  return (
    <div className="editor-scroll">
      <div className="gutter" aria-hidden="true">
        {Array.from({ length: gutterLineCount }, (_, i) => (
          <span key={i} className={`ln${i === 0 ? ' active' : ''}`}>
            {i + 1}
          </span>
        ))}
      </div>
      <div className="editor-body landing-page">
        <HeroSection
          onBrowseEvents={onBrowseEvents}
          onOpenPalette={onOpenPalette}
          typingSpeedMs={typingSpeedMs}
          outputDelayMs={outputDelayMs}
          nextLineDelayMs={nextLineDelayMs}
          restartDelayMs={restartDelayMs}
          loop={loop}
        />
        <StatsSection query={statsQuery} />
        <CategoriesSection query={categoriesQuery} />
        <FeaturedSection query={featuredQuery} />
        <CtaSection
          onStart={onStart}
          headline={ctaHeadline}
          subcopy={ctaSubcopy}
          ctaLabel={ctaButtonLabel}
        />
      </div>
    </div>
  );
}
