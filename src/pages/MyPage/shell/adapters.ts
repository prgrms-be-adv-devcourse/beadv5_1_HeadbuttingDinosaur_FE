import type { GetProfileResponse } from '@/api/types';
import type { ProfileVM } from '../shared/types';

export function toProfileVM(api: GetProfileResponse): ProfileVM {
  const nickname = api.nickname ?? '';
  const initial = nickname.length > 0 ? nickname.charAt(0).toUpperCase() : '?';
  return {
    initial,
    nickname,
    isOnline: api.status === 'ACTIVE',
    joinedAtLabel: null,
  };
}
