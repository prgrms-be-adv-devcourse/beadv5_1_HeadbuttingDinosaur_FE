import { Button } from '@/components/Button';

export interface ErrorStateProps {
  message?: string;
  onRetry: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="el-error">
      <div className="el-error__title">이벤트를 불러올 수 없습니다</div>
      <div className="el-error__message">
        {message ?? '잠시 후 다시 시도해주세요.'}
      </div>
      <div className="el-error__action">
        <Button variant="primary" size="sm" onClick={onRetry}>
          다시 시도
        </Button>
      </div>
    </div>
  );
}
