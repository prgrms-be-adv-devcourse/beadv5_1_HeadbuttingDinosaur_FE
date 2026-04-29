export interface ResultHeaderProps {
  filteredCount: number;
  totalCount: number;
}

export function ResultHeader({ filteredCount, totalCount }: ResultHeaderProps) {
  return (
    <div className="el-result-header">
      <div className="el-result-header__count">
        이벤트 <span>{filteredCount.toLocaleString()}개</span>
      </div>
      <div className="el-result-header__total">
        전체 {totalCount.toLocaleString()}개 중
      </div>
    </div>
  );
}
