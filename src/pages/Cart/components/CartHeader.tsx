import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';

export interface CartHeaderProps {
  itemCount: number;
  onClearAll?: () => void;
  clearing?: boolean;
}

export function CartHeader({ itemCount, onClearAll, clearing = false }: CartHeaderProps) {
  return (
    <header className="cart-header">
      <div className="cart-header__row">
        <div>
          <h1 className="cart-header__title">장바구니</h1>
          <p className="cart-header__subtitle">
            담긴 티켓 {itemCount}개 · 결제 전 최종 수량을 확인해주세요.
          </p>
        </div>
        {itemCount > 0 && onClearAll && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            disabled={clearing}
            iconStart={<Icon name="trash" size={12} />}
          >
            {clearing ? '비우는 중...' : '전체 삭제'}
          </Button>
        )}
      </div>
    </header>
  );
}
