import { Card } from '@/components-v2/Card';

import type { EventDetailVM } from '../types';
import { InfoRow } from './InfoRow';

export interface InfoCardProps {
  vm: EventDetailVM;
}

export function InfoCard({ vm }: InfoCardProps) {
  const seatValue = vm.isSoldOut ? (
    <span className="ed-seat-sold">매진되었습니다</span>
  ) : (
    `${vm.remainingQuantity.toLocaleString()}석`
  );

  return (
    <Card padding="none" className="ed-info-card">
      <InfoRow
        icon="📅"
        label="일시"
        value={`${vm.dateLabel} ${vm.timeLabel}`}
      />
      <InfoRow icon="📍" label="장소" value={vm.location} />
      <InfoRow icon="👤" label="주최" value={vm.sellerNickname} />
      <InfoRow icon="🎫" label="잔여 좌석" value={seatValue} />
    </Card>
  );
}

InfoCard.displayName = 'InfoCard';
