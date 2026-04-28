import { EmptyState } from '@/components-v2';

export function EmptyTransactions() {
  return (
    <EmptyState
      emoji="📒"
      title="거래내역이 없습니다"
      message="충전/사용/환불 내역이 여기에 표시돼요."
    />
  );
}
