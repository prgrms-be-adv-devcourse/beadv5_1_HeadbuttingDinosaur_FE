import { Button, EmptyState } from '@/components';

interface EmptyOrdersProps {
  onBrowse: () => void;
}

export function EmptyOrders({ onBrowse }: EmptyOrdersProps) {
  return (
    <EmptyState
      emoji="📄"
      title="주문 내역이 없습니다"
      message="이벤트 티켓을 구매해 첫 주문을 남겨보세요."
      action={
        <Button variant="primary" onClick={onBrowse}>
          이벤트 둘러보기
        </Button>
      }
    />
  );
}
