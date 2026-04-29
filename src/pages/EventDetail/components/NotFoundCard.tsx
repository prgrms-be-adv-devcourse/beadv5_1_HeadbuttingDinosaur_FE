import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';

export function NotFoundCard() {
  const navigate = useNavigate();
  return (
    <EmptyState
      emoji="🔍"
      title="이벤트를 찾을 수 없습니다"
      message="이미 종료되었거나 존재하지 않는 이벤트입니다."
      action={
        <div className="ed-state-actions">
          <Button variant="primary" onClick={() => navigate('/')}>
            이벤트 목록으로
          </Button>
          <Button variant="ghost" onClick={() => navigate('/')}>
            메인으로
          </Button>
        </div>
      }
    />
  );
}

NotFoundCard.displayName = 'NotFoundCard';
