import { Button } from '@/components/Button';

export interface EmptyStackTraceProps {
  hasActiveFilters: boolean;
  onReset: () => void;
}

export function EmptyStackTrace({
  hasActiveFilters,
  onReset,
}: EmptyStackTraceProps) {
  return (
    <div className="el-empty">
      <div className="el-empty__title">검색 결과가 없습니다</div>
      <div className="el-empty__message">
        {hasActiveFilters
          ? '적용된 필터에 해당하는 이벤트를 찾지 못했어요.'
          : '아직 등록된 이벤트가 없어요.'}
      </div>
      {hasActiveFilters && (
        <div className="el-empty__action">
          <Button variant="primary" size="sm" onClick={onReset}>
            필터 초기화
          </Button>
        </div>
      )}
    </div>
  );
}
