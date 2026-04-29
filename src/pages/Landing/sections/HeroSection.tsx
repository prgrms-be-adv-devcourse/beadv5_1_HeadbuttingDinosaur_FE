/**
 * Hero 섹션 — 좌(카피·CTA·메타) + 우(TypedTerminal).
 * PR 2 (Hero + Stats) — Landing.plan.md §12.2 / §6.1 / §7.
 *
 * - 좌측: 정적 컨텐츠. 로딩/에러 상태 없음 (LCP 즉시).
 * - 우측: TypedTerminal. 라인 1 의 카운트만 totalElements 로 동적 합성 (§11 #1).
 *   카운트 미수신 시 buildTerminalLines 가 '다양한' fallback (§6.1 보강).
 * - prefers-reduced-motion / Page Visibility 처리는 TypedTerminal 자체 책임 (PR 1).
 *
 * CTA props (§7.5):
 * - onBrowseEvents: 필수. '/events?v=2' navigate 핸들러.
 * - onOpenPalette: 선택. 미주입 시 onBrowseEvents 로 fallback (§7.2).
 *
 * tuning props (typingSpeedMs/outputDelayMs/...) 는 TypedTerminal 로 그대로 forward.
 */

import { useFirstPage } from '../hooks';
import { buildTerminalLines } from '../adapters';
import { TypedTerminal } from '../components/TypedTerminal';

export interface HeroSectionProps {
  onBrowseEvents: () => void;
  onOpenPalette?: () => void;
  /** TypedTerminal 라인별 cmd 타이핑 ms. 기본은 TypedTerminal 내부 default 사용 */
  typingSpeedMs?: number;
  /** cmd 완료 후 out 노출까지 ms */
  outputDelayMs?: number;
  /** out 완료 후 다음 라인 시작까지 ms */
  nextLineDelayMs?: number;
  /** 마지막 라인 후 처음으로 돌아가기까지 ms */
  restartDelayMs?: number;
  /** TypedTerminal 루프 여부. default true */
  loop?: boolean;
}

const META_NOTES = ['// 키보드 친화적', '// 수수료 없음', '// 즉시 환불'];

export function HeroSection({
  onBrowseEvents,
  onOpenPalette,
  typingSpeedMs,
  outputDelayMs,
  nextLineDelayMs,
  restartDelayMs,
  loop,
}: HeroSectionProps) {
  const firstPage = useFirstPage();
  // success / loading-with-previous / error-with-previous 모두에서 카운트 노출.
  // 미수신 시 undefined → buildTerminalLines 가 '다양한' fallback.
  const totalCount =
    firstPage.status === 'success'
      ? firstPage.data.totalElements
      : 'previous' in firstPage && firstPage.previous
        ? firstPage.previous.totalElements
        : undefined;
  const lines = buildTerminalLines(totalCount);

  // §7.2 fallback: onOpenPalette 미주입 시 onBrowseEvents 동일 동작.
  const onPalette = onOpenPalette ?? onBrowseEvents;

  return (
    <section className="hero-section" aria-label="개발자 이벤트 플랫폼 소개">
      <div className="hero-section__left">
        <div className="hero-section__eyebrow">
          <span className="hero-section__eyebrow-dot" aria-hidden="true" />
          v1.0 · 베타 서비스 운영 중
        </div>

        <h1 className="hero-section__h1">
          개발자의 다음 한 줄을 바꿀
          <br />
          <span className="hero-section__h1-accent">이벤트와 티켓</span>, 한 곳에서.
        </h1>

        <p className="hero-section__subcopy">
          컨퍼런스부터 밋업·해커톤·스터디까지. 관심 있는 기술 스택으로 바로 찾고,
          몇 번의 클릭으로 티켓을 예매하세요.
        </p>

        <div className="hero-section__cta">
          <button
            type="button"
            className="btn btn-primary btn-lg"
            onClick={onBrowseEvents}
          >
            이벤트 둘러보기 <span aria-hidden="true">→</span>
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-lg hero-section__cta-palette"
            onClick={onPalette}
          >
            빠른 검색{' '}
            <kbd className="hero-section__kbd" aria-label="단축키 커맨드 K">
              ⌘K
            </kbd>
          </button>
        </div>

        <div className="hero-section__meta" aria-hidden="true">
          {META_NOTES.map((note) => (
            <span key={note} className="hero-section__meta-item">
              {note}
            </span>
          ))}
        </div>
      </div>

      <div className="hero-section__right">
        <TypedTerminal
          lines={lines}
          typingSpeedMs={typingSpeedMs}
          outputDelayMs={outputDelayMs}
          nextLineDelayMs={nextLineDelayMs}
          restartDelayMs={restartDelayMs}
          loop={loop}
        />
      </div>
    </section>
  );
}
