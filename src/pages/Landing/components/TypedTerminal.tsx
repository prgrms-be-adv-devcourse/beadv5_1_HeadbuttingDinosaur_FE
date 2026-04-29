import { useEffect, useState } from 'react';
import { TypeAnimation } from 'react-type-animation';
import type { TerminalLine } from '../types';

/**
 * Landing Hero 우측 터미널 타이핑 데모.
 * Plan: docs/archive/v2-cutover/Landing.plan.md §3, §12.1.
 *
 * - 라이브러리: react-type-animation (SPEC §9 예외 도입).
 * - 접근성: 컨테이너 aria-hidden + sr-only 요약 1줄. 포커스 미부여.
 * - 모션: prefers-reduced-motion: reduce → 모든 라인 즉시 완성 정적 렌더 + 커서 정지.
 * - Visibility: hidden→visible 복귀 시 컴포넌트를 key 토글로 remount (라이브러리에 pause API 가
 *   없어 백그라운드 setTimeout 누적을 회피하기 위한 가벼운 우회 — Plan §3 합의).
 */

const DEFAULT_LINES: TerminalLine[] = [
  { prompt: '~', cmd: 'devticket search --stack=react --near=seoul', out: '→ 12개의 이벤트를 찾았어요' },
  { prompt: '~', cmd: 'devticket book "React Korea 18차 밋업"',       out: '✓ 티켓 1매가 발급되었습니다' },
];

const DEFAULT_ARIA_LABEL = '터미널 데모: 이벤트 검색 및 예매 명령 예시';

export interface TypedTerminalProps {
  lines?: TerminalLine[];
  typingSpeedMs?: number;
  outputDelayMs?: number;
  nextLineDelayMs?: number;
  restartDelayMs?: number;
  loop?: boolean;
  className?: string;
  /** sr-only 요약 텍스트 (Hero 카피와 중복되지 않도록 짧게) */
  ariaLabel?: string;
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

function useVisibilityRemountKey(): number {
  const [key, setKey] = useState(0);
  useEffect(() => {
    let wasHidden = false;
    const onChange = () => {
      if (document.visibilityState === 'hidden') {
        wasHidden = true;
      } else if (wasHidden) {
        wasHidden = false;
        setKey((k) => k + 1);
      }
    };
    document.addEventListener('visibilitychange', onChange);
    return () => document.removeEventListener('visibilitychange', onChange);
  }, []);
  return key;
}

function Chrome() {
  return (
    <div className="typed-terminal-bar">
      <span className="typed-terminal-dot typed-terminal-dot-close" />
      <span className="typed-terminal-dot typed-terminal-dot-min" />
      <span className="typed-terminal-dot typed-terminal-dot-max" />
      <span className="typed-terminal-title">devticket — zsh — 88×20</span>
    </div>
  );
}

function StaticLine({ line }: { line: TerminalLine }) {
  return (
    <div className="typed-terminal-line">
      <div>
        <span className="typed-terminal-prompt-mark">❯</span>{' '}
        <span className="typed-terminal-prompt">{line.prompt}</span>{' '}
        <span className="typed-terminal-cmd">{line.cmd}</span>
      </div>
      <div className="typed-terminal-out">{line.out}</div>
    </div>
  );
}

export function TypedTerminal(props: TypedTerminalProps) {
  const reduced = usePrefersReducedMotion();
  const visibilityKey = useVisibilityRemountKey();

  if (reduced) {
    return <ReducedTerminal {...props} />;
  }
  return <AnimatedTerminal key={visibilityKey} {...props} />;
}

function ReducedTerminal({
  lines = DEFAULT_LINES,
  className,
  ariaLabel = DEFAULT_ARIA_LABEL,
}: TypedTerminalProps) {
  const containerClass = ['typed-terminal', className].filter(Boolean).join(' ');
  return (
    <>
      <p className="sr-only">{ariaLabel}</p>
      <div className={containerClass} aria-hidden="true">
        <Chrome />
        <div className="typed-terminal-body">
          {lines.map((line, i) => (
            <StaticLine key={i} line={line} />
          ))}
        </div>
      </div>
    </>
  );
}

function AnimatedTerminal({
  lines = DEFAULT_LINES,
  typingSpeedMs = 38,
  outputDelayMs = 320,
  nextLineDelayMs = 1600,
  restartDelayMs = 2200,
  loop = true,
  className,
  ariaLabel = DEFAULT_ARIA_LABEL,
}: TypedTerminalProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [showCurrentOut, setShowCurrentOut] = useState(false);

  useEffect(() => {
    if (currentIdx < lines.length) return;
    if (!loop) return;
    const t = window.setTimeout(() => setCurrentIdx(0), restartDelayMs);
    return () => window.clearTimeout(t);
  }, [currentIdx, lines.length, loop, restartDelayMs]);

  const containerClass = ['typed-terminal', className].filter(Boolean).join(' ');
  const active = currentIdx < lines.length ? lines[currentIdx] : null;

  return (
    <>
      <p className="sr-only">{ariaLabel}</p>
      <div className={containerClass} aria-hidden="true">
        <Chrome />
        <div className="typed-terminal-body">
          {lines.slice(0, currentIdx).map((line, i) => (
            <StaticLine key={`done-${i}`} line={line} />
          ))}
          {active && (
            <div className="typed-terminal-line">
              <div>
                <span className="typed-terminal-prompt-mark">❯</span>{' '}
                <span className="typed-terminal-prompt">{active.prompt}</span>{' '}
                <TypeAnimation
                  key={`type-${currentIdx}`}
                  sequence={[
                    active.cmd,
                    outputDelayMs,
                    () => setShowCurrentOut(true),
                    nextLineDelayMs,
                    () => {
                      setShowCurrentOut(false);
                      setCurrentIdx((i) => i + 1);
                    },
                  ]}
                  wrapper="span"
                  cursor={false}
                  speed={{ type: 'keyStrokeDelayInMs', value: typingSpeedMs }}
                  className="typed-terminal-cmd"
                />
                <span className="typed-terminal-cursor" />
              </div>
              {showCurrentOut && (
                <div className="typed-terminal-out">{active.out}</div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
