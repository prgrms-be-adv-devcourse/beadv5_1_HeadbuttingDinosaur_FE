import type { ReactElement } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Loading from '@/components/Loading';

interface RequireAuthV2Props {
  children: ReactElement;
}

export function RequireAuthV2({ children }: RequireAuthV2Props) {
  const { isLoggedIn, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <Loading fullscreen />;

  if (!isLoggedIn) {
    const returnTo = location.pathname + location.search;
    const safe = encodeURIComponent(returnTo);
    return <Navigate to={`/login?returnTo=${safe}`} replace />;
  }

  return children;
}
