import { useEffect, useState } from 'react';

interface SaleCountdownProps {
  targetIso: string;
  onElapsed?: () => void;
}

const pad2 = (n: number) => String(n).padStart(2, '0');

const computeRemaining = (target: number) => {
  const ms = target - Date.now();
  if (ms <= 0) return null;
  const total = Math.floor(ms / 1000);
  const days = Math.floor(total / 86_400);
  const hours = Math.floor((total % 86_400) / 3_600);
  const minutes = Math.floor((total % 3_600) / 60);
  const seconds = total % 60;
  return { days, hours, minutes, seconds };
};

export function SaleCountdown({ targetIso, onElapsed }: SaleCountdownProps) {
  const target = new Date(targetIso).getTime();
  const valid = Number.isFinite(target);
  const [remaining, setRemaining] = useState(() =>
    valid ? computeRemaining(target) : null,
  );

  useEffect(() => {
    if (!valid) return;
    const tick = () => {
      const next = computeRemaining(target);
      setRemaining(next);
      if (next === null) onElapsed?.();
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [target, valid, onElapsed]);

  if (!valid || !remaining) return null;
  const { days, hours, minutes, seconds } = remaining;

  return (
    <div className="ed-countdown" role="timer" aria-label="판매 시작까지 남은 시간">
      <span className="ed-countdown__cell">
        <span className="ed-countdown__num">{days}</span>
        <span className="ed-countdown__unit">일</span>
      </span>
      <span className="ed-countdown__cell">
        <span className="ed-countdown__num">{pad2(hours)}</span>
        <span className="ed-countdown__unit">시</span>
      </span>
      <span className="ed-countdown__cell">
        <span className="ed-countdown__num">{pad2(minutes)}</span>
        <span className="ed-countdown__unit">분</span>
      </span>
      <span className="ed-countdown__cell">
        <span className="ed-countdown__num">{pad2(seconds)}</span>
        <span className="ed-countdown__unit">초</span>
      </span>
    </div>
  );
}
