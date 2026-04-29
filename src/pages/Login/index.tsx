import { Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoginView from './Login';
import { safeReturnTo, useLoginForm } from './hooks';

export default function LoginPage() {
  const auth = useAuth();
  const [searchParams] = useSearchParams();
  const formProps = useLoginForm();

  // §5.4 인증 게이트 — 부트스트랩 중에는 카드를 그리지 않아 깜빡임 방지.
  // (D-1: 별도 fullscreen Loading 컴포넌트 도입 안 함 — null 유지.)
  if (auth.isLoading) return null;

  // 이미 로그인된 사용자가 /login 으로 직접 진입한 경우 즉시 리다이렉트.
  if (auth.isLoggedIn) {
    return <Navigate to={safeReturnTo(searchParams.get('returnTo'))} replace />;
  }

  return <LoginView {...formProps} />;
}
