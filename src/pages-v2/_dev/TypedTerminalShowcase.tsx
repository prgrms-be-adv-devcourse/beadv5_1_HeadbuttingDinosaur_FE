import { useMemo, useState } from 'react';
import { TypedTerminal } from '../Landing/components/TypedTerminal';
import type { TerminalLine } from '../Landing/types';

/**
 * 임시 dev 라우트 (`/_dev/typed-terminal`).
 * Plan §12.1 검증 절차 A 1~8 을 라이브로 확인하기 위한 컨트롤 패널.
 * cutover 또는 PR 4 cleanup 커밋에서 제거 예정.
 */

const PRESETS: Record<string, TerminalLine[]> = {
  default: [
    { prompt: '~', cmd: 'devticket search --stack=react --near=seoul', out: '→ 12개의 이벤트를 찾았어요' },
    { prompt: '~', cmd: 'devticket book "React Korea 18차 밋업"',       out: '✓ 티켓 1매가 발급되었습니다' },
  ],
  short: [
    { prompt: '~', cmd: 'ls', out: 'a.txt b.txt' },
  ],
  long: [
    { prompt: '~', cmd: 'devticket search --stack=react --near=seoul --keyword="open source contributors meetup"', out: '→ 1,247개의 이벤트를 찾았어요 (정렬: 마감 임박)' },
    { prompt: '~', cmd: 'devticket book "Cloud Native Korea 2026 Spring"', out: '✓ 1매 발급 완료 — 결제 영수증 #DT-2026-04-28-00917 (KRW 89,000)' },
    { prompt: '~', cmd: 'devticket logout',                                out: '✓ 로그아웃 되었습니다' },
  ],
};

export default function TypedTerminalShowcase() {
  const [preset, setPreset] = useState<keyof typeof PRESETS>('default');
  const [typingSpeedMs, setTypingSpeedMs] = useState(38);
  const [outputDelayMs, setOutputDelayMs] = useState(320);
  const [nextLineDelayMs, setNextLineDelayMs] = useState(1600);
  const [restartDelayMs, setRestartDelayMs] = useState(2200);
  const [loop, setLoop] = useState(true);
  const [mounted, setMounted] = useState(true);

  const lines = useMemo(() => PRESETS[preset], [preset]);

  return (
    <div style={{ maxWidth: 880, margin: '40px auto', padding: 24, display: 'grid', gap: 24 }}>
      <header>
        <h1 style={{ fontSize: 22, marginBottom: 4 }}>TypedTerminal — dev showcase</h1>
        <p style={{ fontSize: 13, color: 'var(--text-3)', margin: 0 }}>
          Landing.plan.md §12.1 검증 절차 A. <code>/_dev/typed-terminal</code>
        </p>
      </header>

      <section
        aria-label="controls"
        style={{
          display: 'grid', gap: 12, padding: 16,
          border: '1px solid var(--border)', borderRadius: 8, background: 'var(--surface)',
        }}
      >
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ fontSize: 13 }}>preset</label>
          {(Object.keys(PRESETS) as Array<keyof typeof PRESETS>).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setPreset(k)}
              style={{
                padding: '4px 10px', fontSize: 12,
                border: '1px solid var(--border)', borderRadius: 6,
                background: preset === k ? 'var(--surface-2)' : 'transparent',
                cursor: 'pointer',
              }}
            >
              {k}
            </button>
          ))}
        </div>

        <Slider label="typingSpeedMs" value={typingSpeedMs} min={5} max={200} onChange={setTypingSpeedMs} />
        <Slider label="outputDelayMs" value={outputDelayMs} min={0} max={2000} onChange={setOutputDelayMs} />
        <Slider label="nextLineDelayMs" value={nextLineDelayMs} min={0} max={5000} onChange={setNextLineDelayMs} />
        <Slider label="restartDelayMs" value={restartDelayMs} min={0} max={5000} onChange={setRestartDelayMs} />

        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ fontSize: 13, display: 'flex', gap: 6, alignItems: 'center' }}>
            <input type="checkbox" checked={loop} onChange={(e) => setLoop(e.target.checked)} />
            loop
          </label>
          <button
            type="button"
            onClick={() => setMounted((m) => !m)}
            style={{ padding: '4px 10px', fontSize: 12, border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer' }}
          >
            {mounted ? 'unmount' : 'mount'}
          </button>
          <span style={{ fontSize: 12, color: 'var(--text-3)' }}>
            (visibility 검증: 다른 탭으로 전환 후 5초 뒤 복귀)
          </span>
        </div>
      </section>

      <section aria-label="preview" style={{ display: 'grid', gap: 8 }}>
        <div style={{ fontSize: 12, color: 'var(--text-3)' }}>preview</div>
        {mounted ? (
          <TypedTerminal
            lines={lines}
            typingSpeedMs={typingSpeedMs}
            outputDelayMs={outputDelayMs}
            nextLineDelayMs={nextLineDelayMs}
            restartDelayMs={restartDelayMs}
            loop={loop}
          />
        ) : (
          <div style={{ padding: 16, color: 'var(--text-3)', fontSize: 13 }}>(unmounted)</div>
        )}
      </section>
    </div>
  );
}

function Slider({
  label, value, min, max, onChange,
}: {
  label: string; value: number; min: number; max: number; onChange: (v: number) => void;
}) {
  return (
    <label style={{ display: 'grid', gridTemplateColumns: '160px 1fr 80px', gap: 12, alignItems: 'center', fontSize: 13 }}>
      <span>{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{value}</span>
    </label>
  );
}
