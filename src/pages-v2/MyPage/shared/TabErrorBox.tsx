import { Button, EmptyState } from '@/components-v2';

interface TabErrorBoxProps {
  onRetry: () => void;
  title?: string;
  message?: string;
}

export function TabErrorBox({
  onRetry,
  title = '불러오지 못했습니다',
  message = '잠시 후 다시 시도해 주세요.',
}: TabErrorBoxProps) {
  return (
    <EmptyState
      emoji="⚠️"
      title={title}
      message={message}
      action={
        <Button variant="primary" size="sm" onClick={onRetry}>
          다시 시도
        </Button>
      }
    />
  );
}
