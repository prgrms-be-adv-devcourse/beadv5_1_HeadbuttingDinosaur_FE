export function EventCardSkeleton() {
  return (
    <div className="el-card el-card--skeleton" aria-hidden="true">
      <div className="el-card__accent" />
      <div className="el-card__chrome">
        <span className="el-skeleton-line" style={{ width: 60 }} />
        <span className="el-card__chrome-spacer" />
        <span className="el-skeleton-line" style={{ width: 50 }} />
      </div>
      <div className="el-card__body">
        <span className="el-skeleton-line" style={{ width: '90%', height: 16 }} />
        <span className="el-skeleton-line" style={{ width: '70%', height: 16 }} />
        <span className="el-skeleton-line" style={{ width: '60%', height: 12 }} />
        <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between' }}>
          <span className="el-skeleton-line" style={{ width: 60, height: 20 }} />
          <span className="el-skeleton-line" style={{ width: 40, height: 16 }} />
        </div>
      </div>
    </div>
  );
}
