import { Card } from '@/components/Card';

export interface RefundPolicyProps {
  eventDateTime: string;
}

type Stage = 'full' | 'partial' | 'none';

const MS_PER_DAY = 86_400_000;

function daysUntil(eventDateTime: string): number | null {
  const t = new Date(eventDateTime).getTime();
  if (Number.isNaN(t)) return null;
  // 일 단위 floor — 같은 날 서로 다른 시각의 미세한 차이로 단계가 바뀌는 걸 막는다.
  const diff = t - Date.now();
  return Math.floor(diff / MS_PER_DAY);
}

function stageOf(days: number | null): Stage | null {
  if (days === null) return null;
  if (days >= 7) return 'full';
  if (days >= 3) return 'partial';
  return 'none';
}

const ROWS: { stage: Stage; label: string; rate: string }[] = [
  { stage: 'full', label: '행사 7일 전까지', rate: '100% 환불' },
  { stage: 'partial', label: '행사 3일 전까지', rate: '50% 환불' },
  { stage: 'none', label: '행사 3일 이내', rate: '환불 불가' },
];

export function RefundPolicy({ eventDateTime }: RefundPolicyProps) {
  const current = stageOf(daysUntil(eventDateTime));
  return (
    <Card padding="lg" className="ed-refund-policy">
      <div className="ed-refund-policy__head">
        <span className="ed-refund-policy__icon" aria-hidden="true">💸</span>
        <h2 className="ed-refund-policy__title">환불 정책</h2>
      </div>
      <ul className="ed-refund-policy__list">
        {ROWS.map((row) => (
          <li
            key={row.stage}
            className={`ed-refund-policy__row${
              current === row.stage ? ' is-current' : ''
            }`}
          >
            <span className="ed-refund-policy__label">{row.label}</span>
            <span className="ed-refund-policy__rate">{row.rate}</span>
          </li>
        ))}
      </ul>
      <p className="ed-refund-policy__note">
        환불 기준일은 행사 시작일을 기준으로 산정되며, 결제 수단에 따라 환불
        처리에 영업일이 추가로 소요될 수 있습니다.
      </p>
    </Card>
  );
}

RefundPolicy.displayName = 'RefundPolicy';
