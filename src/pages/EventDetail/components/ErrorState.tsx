import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';

export interface ErrorStateProps {
  title: string;
  message: string;
  onRetry: () => void;
}

export function ErrorState({ title, message, onRetry }: ErrorStateProps) {
  const navigate = useNavigate();
  return (
    <EmptyState
      emoji="⚠️"
      title={title}
      message={message}
      action={
        <div className="ed-state-actions">
          <Button variant="primary" onClick={onRetry}>
            다시 시도
          </Button>
          <Button variant="ghost" onClick={() => navigate('/')}>
            이벤트 목록으로
          </Button>
        </div>
      }
    />
  );
}

ErrorState.displayName = 'ErrorState';
