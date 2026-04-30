import { Card } from '@/components/Card';

import type { EventDetailVM } from '../types';
import { InfoRow } from './InfoRow';

export interface InfoCardProps {
  vm: EventDetailVM;
}

const seatLabel = (vm: InfoCardProps['vm']) => {
  if (vm.isScheduled) return <span className="ed-seat-sold">판매 예정</span>;
  if (vm.status === 'CANCELLED')
    return <span className="ed-seat-sold">취소되었습니다</span>;
  if (vm.status === 'ENDED' || vm.status === 'SALE_ENDED')
    return <span className="ed-seat-sold">판매 종료</span>;
  if (vm.isSoldOut) return <span className="ed-seat-sold">매진되었습니다</span>;
  return `${vm.remainingQuantity.toLocaleString()}석`;
};

export function InfoCard({ vm }: InfoCardProps) {
  return (
    <Card padding="none" className="ed-info-card">
      <InfoRow
        icon="📅"
        label="일시"
        value={`${vm.dateLabel} ${vm.timeLabel}`}
      />
      <InfoRow icon="📍" label="장소" value={vm.location} />
      <InfoRow icon="👤" label="주최" value={vm.sellerNickname} />
      <InfoRow icon="🎫" label="잔여 좌석" value={seatLabel(vm)} />
    </Card>
  );
}

InfoCard.displayName = 'InfoCard';
