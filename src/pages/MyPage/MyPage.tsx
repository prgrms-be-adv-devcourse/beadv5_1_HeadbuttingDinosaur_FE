import { Outlet, useMatch, useNavigate } from 'react-router-dom';
import { ProfileHeader } from './shell/ProfileHeader';
import { ProfileHeaderSkeleton } from './shell/ProfileHeaderSkeleton';
import { TabNav } from './shell/TabNav';
import { isTabKey, TABS, DEFAULT_TAB } from './shared/tabs';
import { useMyProfile } from './shared/useMyProfile';
import {
  WalletBalanceProvider,
  useWalletBalance,
  type WalletBalanceState,
} from './shared/walletBalance';
import type { BalanceSlot, TabKey } from './shared/types';

function toBalanceSlot(state: WalletBalanceState): BalanceSlot {
  if (state.status === 'loading') return { state: 'loading' };
  if (state.status === 'error') return { state: 'error' };
  return { state: 'ready', amount: state.data.amount };
}

function MyPageShell() {
  const match = useMatch('/mypage/:tab');
  const tabParam = match?.params.tab;
  const activeTab: TabKey = isTabKey(tabParam) ? tabParam : DEFAULT_TAB;
  const navigate = useNavigate();

  const profileState = useMyProfile();
  const balance = toBalanceSlot(useWalletBalance());

  const handleEditProfile = () => {
    navigate('/mypage/settings');
  };

  return (
    <div className="mypage-shell">
      {profileState.status === 'ready' ? (
        <ProfileHeader
          profile={profileState.profile}
          balance={balance}
          onEditProfile={handleEditProfile}
        />
      ) : (
        <ProfileHeaderSkeleton />
      )}
      <TabNav active={activeTab} tabs={TABS} />
      <div className="mypage-tab-panel">
        <Outlet />
      </div>
    </div>
  );
}

export function MyPage() {
  return (
    <WalletBalanceProvider>
      <MyPageShell />
    </WalletBalanceProvider>
  );
}
