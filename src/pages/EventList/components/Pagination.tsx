import { Button } from '@/components/Button';

export interface PaginationProps {
  page: number;
  totalPages: number;
  hasNext: boolean;
  onPageChange: (next: number) => void;
}

export function Pagination({
  page,
  totalPages,
  hasNext,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;
  return (
    <div className="el-pagination" role="navigation" aria-label="페이지 이동">
      <Button
        variant="ghost"
        size="sm"
        disabled={page <= 0}
        onClick={() => onPageChange(page - 1)}
      >
        이전
      </Button>
      <span className="el-pagination__page" aria-live="polite">
        {page + 1} / {totalPages}
      </span>
      <Button
        variant="ghost"
        size="sm"
        disabled={!hasNext}
        onClick={() => onPageChange(page + 1)}
      >
        다음
      </Button>
    </div>
  );
}
