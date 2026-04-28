import { Button, Card, Icon } from '@/components-v2';
import { formatBalanceParts } from '../../../shared/currency';

interface BalanceCardProps {
  balance: number;
  lastUpdatedAtLabel?: string | null;
  onCharge: () => void;
  onWithdraw: () => void;
  chargePending?: boolean;
  withdrawPending?: boolean;
}

export function BalanceCard({
  balance,
  lastUpdatedAtLabel = null,
  onCharge,
  onWithdraw,
  chargePending = false,
  withdrawPending = false,
}: BalanceCardProps) {
  const { value, unit } = formatBalanceParts(balance);
  return (
    <Card variant="solid" padding={28} className="balance-card">
      <div className="balance-label">예치금 잔액</div>
      <div className="balance-amount">
        {value}
        <span className="balance-unit">{unit}</span>
      </div>
      {lastUpdatedAtLabel && (
        <div className="balance-last-updated">
          최종 업데이트 · {lastUpdatedAtLabel}
        </div>
      )}
      <div className="balance-actions">
        <Button
          variant="primary"
          iconStart={<Icon name="plus" size={13} />}
          onClick={onCharge}
          loading={chargePending}
        >
          충전하기
        </Button>
        <Button
          variant="ghost"
          iconStart={<Icon name="wallet" size={13} />}
          onClick={onWithdraw}
          loading={withdrawPending}
        >
          출금 요청
        </Button>
      </div>
    </Card>
  );
}
