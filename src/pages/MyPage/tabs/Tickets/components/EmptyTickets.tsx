import { Button, EmptyState } from '@/components';

interface EmptyTicketsProps {
  onBrowse: () => void;
}

export function EmptyTickets({ onBrowse }: EmptyTicketsProps) {
  return (
    <EmptyState
      emoji="🎫"
      title="보유한 티켓이 없습니다"
      message="마음에 드는 이벤트를 찾아 첫 티켓을 만들어보세요."
      action={
        <Button variant="primary" onClick={onBrowse}>
          이벤트 둘러보기
        </Button>
      }
    />
  );
}
