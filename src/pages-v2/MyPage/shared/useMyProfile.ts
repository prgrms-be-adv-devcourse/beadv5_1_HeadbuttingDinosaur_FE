import { useAuth } from '@/contexts/AuthContext';
import { toProfileVM } from '../shell/adapters';
import type { ProfileVM } from './types';

export type MyProfileState =
  | { status: 'loading'; profile: null }
  | { status: 'guest'; profile: null }
  | { status: 'ready'; profile: ProfileVM };

export function useMyProfile(): MyProfileState {
  const { user, isLoading, isLoggedIn } = useAuth();
  if (isLoading) return { status: 'loading', profile: null };
  if (!isLoggedIn || !user) return { status: 'guest', profile: null };
  return { status: 'ready', profile: toProfileVM(user) };
}
