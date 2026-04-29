interface TicketsHeaderProps {
  total: number;
  validCount: number;
  usedCount: number;
}

export function TicketsHeader({
  total,
  validCount,
  usedCount,
}: TicketsHeaderProps) {
  return (
    <div className="tickets-header">
      <h2 className="tickets-header-title">티켓 {total}개</h2>
      <p className="tickets-header-counts">
        사용 가능 {validCount} · 사용 완료 {usedCount}
      </p>
    </div>
  );
}
