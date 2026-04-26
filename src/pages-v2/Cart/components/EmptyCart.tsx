/**
 * 장바구니 빈 상태 카드.
 *
 * 공용 `EmptyState` + `Button` 조합. 네비게이션은 호출자가 `onBrowse`로 주입
 * (페이지 컴포넌트가 react-router의 `useNavigate`를 보유하므로 leaf는 무지).
 *
 * § 9.2-10 결정으로 variant 분기 없이 단일 메시지. 결제 직후 빈 상태
 * 시나리오는 결제 완료 페이지 흐름으로 흡수됨.
 */

import { Button } from '@/components-v2/Button';
import { EmptyState } from '@/components-v2/EmptyState';

export interface EmptyCartProps {
  onBrowse: () => void;
}

export function EmptyCart({ onBrowse }: EmptyCartProps) {
  return (
    <EmptyState
      className="cart-empty"
      emoji="🛒"
      title="장바구니가 비어있습니다"
      message="마음에 드는 이벤트를 찾아 티켓을 담아보세요."
      action={
        <Button variant="primary" onClick={onBrowse}>
          이벤트 둘러보기
        </Button>
      }
    />
  );
}
