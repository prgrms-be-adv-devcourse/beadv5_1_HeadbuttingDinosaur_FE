import { Avatar, Button, TermDot } from '@/components';
import { formatBalanceParts } from '../shared/currency';
import type { BalanceSlot, ProfileVM } from '../shared/types';

export interface ProfileHeaderProps {
  profile: ProfileVM;
  balance: BalanceSlot;
  onEditProfile: () => void;
}

function balanceLineText(balance: BalanceSlot): string | null {
  if (balance.state === 'loading') return '예치금 -';
  if (balance.state === 'error') return null;
  const { value, unit } = formatBalanceParts(balance.amount);
  return `예치금 ${value}${unit}`;
}

export function ProfileHeader({ profile, balance, onEditProfile }: ProfileHeaderProps) {
  const balanceText = balanceLineText(balance);

  return (
    <div className="mypage-profile-header">
      <Avatar initial={profile.initial} size="md" />
      <div className="mypage-profile-text">
        <div className="mypage-profile-name-row">
          <span className="mypage-profile-name">{profile.nickname}</span>
          {profile.isOnline && (
            <span className="mypage-profile-online" aria-label="온라인">
              <TermDot size={6} tone="term-green" />
              <span>ONLINE</span>
            </span>
          )}
        </div>
        {balanceText && <div className="mypage-profile-meta">{balanceText}</div>}
      </div>
      <Button variant="ghost" size="sm" onClick={onEditProfile}>
        프로필 수정
      </Button>
    </div>
  );
}
