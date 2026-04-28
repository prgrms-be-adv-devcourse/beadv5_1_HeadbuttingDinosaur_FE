import { Button } from '@/components-v2';

interface RefundsPagerProps {
  page: number;
  totalPages: number;
  onPageChange: (next: number) => void;
}

export function RefundsPager({
  page,
  totalPages,
  onPageChange,
}: RefundsPagerProps) {
  return (
    <div className="refunds-pager">
      <Button
        variant="ghost"
        size="sm"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        이전
      </Button>
      <span className="refunds-pager-info" aria-live="polite">
        {page} / {totalPages}
      </span>
      <Button
        variant="ghost"
        size="sm"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        다음
      </Button>
    </div>
  );
}
