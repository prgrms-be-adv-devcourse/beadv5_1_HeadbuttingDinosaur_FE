import { Button } from '@/components';

interface TicketsPagerProps {
  page: number;
  totalPages: number;
  onPageChange: (next: number) => void;
}

export function TicketsPager({
  page,
  totalPages,
  onPageChange,
}: TicketsPagerProps) {
  return (
    <div className="tickets-pager">
      <Button
        variant="ghost"
        size="sm"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        이전
      </Button>
      <span className="tickets-pager-info" aria-live="polite">
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
