export function ProfileHeaderSkeleton() {
  return (
    <div className="mypage-profile-header is-skeleton" aria-busy="true" aria-live="polite">
      <div className="mypage-profile-avatar-skeleton" />
      <div className="mypage-profile-text">
        <div className="mypage-skeleton-bar mypage-skeleton-bar-title" />
        <div className="mypage-skeleton-bar mypage-skeleton-bar-meta" />
      </div>
    </div>
  );
}
