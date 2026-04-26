import { useNavigate } from 'react-router-dom';

import { Button } from '@/components-v2/Button';
import { EmptyState } from '@/components-v2/EmptyState';

export interface ForbiddenCardProps {
  message?: string;
}

const DEFAULT_MESSAGE = '비공개 이벤트이거나 접근 권한이 없습니다.';

export function ForbiddenCard({ message }: ForbiddenCardProps) {
  const navigate = useNavigate();
  return (
    <EmptyState
      emoji="🔒"
      title="이 이벤트에 접근할 수 없습니다"
      message={message ?? DEFAULT_MESSAGE}
      action={
        <div className="ed-state-actions">
          <Button variant="primary" onClick={() => navigate('/')}>
            이벤트 목록으로
          </Button>
        </div>
      }
    />
  );
}

ForbiddenCard.displayName = 'ForbiddenCard';
