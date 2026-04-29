import { EmptyState } from '@/components';

export function EmptyRefunds() {
  return (
    <EmptyState
      emoji="💳"
      title="환불 내역이 없습니다"
      message={
        <>
          환불은 <strong>내 티켓</strong> 탭에서 각 티켓의 환불 요청 버튼으로
          시작할 수 있습니다.
        </>
      }
    />
  );
}
