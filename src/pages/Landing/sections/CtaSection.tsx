/**
 * CTA 섹션 — dashed border + brand-light 그라디언트 카드.
 * PR 4 (CTA + 통합 + 라우터) — Landing.plan.md §12.4 / §2 / §6.5.
 *
 * 좌측 헤드라인 / 서브카피, 우측 primary lg "시작하기 →".
 * 정적 컴포넌트 — 로딩 / 에러 / 동적 데이터 없음 (§6.5).
 *
 * 카피는 컴포넌트에 하드코딩 (§2). 다국어/원격화 시 props 로 승격.
 * 다만 헤드라인 / 서브카피는 props 로 override 가능 — A/B 테스트나
 * 후속 캠페인 카피 교체에 대비.
 *
 * 접근성:
 * - <section aria-labelledby> 로 헤드라인을 landmark 라벨로 사용.
 * - "// get started" 는 시각적 eyebrow 일 뿐이므로 aria-hidden.
 *   스크린리더는 h3 → 서브카피 → 버튼 순서로만 읽음.
 * - 모션 없음. landing.css 의 @media (prefers-reduced-motion: reduce)
 *   guard 는 다른 섹션과 일괄 정의되며 본 카드에는 transition 자체가 없음.
 */

export interface CtaSectionProps {
  onStart: () => void;
  /** 헤드라인 override. 기본: "지금 바로 다음 컨퍼런스를 예약하세요" */
  headline?: string;
  /** 서브카피 override. 기본: "회원가입은 30초면 끝나요. ..." */
  subcopy?: string;
  /** 버튼 라벨 override. 기본: "시작하기 →" */
  ctaLabel?: string;
}

const DEFAULT_HEADLINE = '지금 바로 다음 컨퍼런스를 예약하세요';
const DEFAULT_SUBCOPY =
  '회원가입은 30초면 끝나요. 신용카드, 계좌이체, 예치금 모두 지원합니다.';
const DEFAULT_CTA_LABEL = '시작하기';

export function CtaSection({
  onStart,
  headline = DEFAULT_HEADLINE,
  subcopy = DEFAULT_SUBCOPY,
  ctaLabel = DEFAULT_CTA_LABEL,
}: CtaSectionProps) {
  return (
    <section className="cta-section" aria-labelledby="cta-section__headline">
      <div className="cta-section__copy">
        <div className="cta-section__eyebrow" aria-hidden="true">
          // get started
        </div>
        <h3 id="cta-section__headline" className="cta-section__headline">
          {headline}
        </h3>
        <p className="cta-section__subcopy">{subcopy}</p>
      </div>
      <button
        type="button"
        className="btn btn-primary btn-lg cta-section__button"
        onClick={onStart}
      >
        {ctaLabel} <span aria-hidden="true">→</span>
      </button>
    </section>
  );
}
