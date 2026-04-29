import { Button } from '@/components';

interface OrdersPagerProps {
  page: number;
  totalPages: number;
  onPageChange: (next: number) => void;
}

export function OrdersPager({
  page,
  totalPages,
  onPageChange,
}: OrdersPagerProps) {
  return (
    <div className="orders-pager">
      <Button
        variant="ghost"
        size="sm"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        이전
      </Button>
      <span className="orders-pager-info" aria-live="polite">
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
