import { Link } from 'react-router-dom';
import { useState, type FormEvent } from 'react';
import { Card, Button, Input } from '@/components';
import type { LoginFieldErrors, LoginFormState } from './hooks';

export type LoginViewProps = {
  form: LoginFormState;
  errors: LoginFieldErrors;
  loading: boolean;
  onChangeEmail: (v: string) => void;
  onChangePassword: (v: string) => void;
  onSubmit: (e: FormEvent) => void;
  signupHref: string;
  googleOAuthUrl: string;
};

export default function LoginView({
  form,
  errors,
  loading,
  onChangeEmail,
  onChangePassword,
  onSubmit,
  signupHref,
  googleOAuthUrl,
}: LoginViewProps) {
  return (
    <div className="login-page">
      <div className="login-shell">
        <BrandHeader />
        <PageHeading />
        <Card padding={28}>
          <LoginForm
            email={form.email}
            password={form.password}
            errors={errors}
            loading={loading}
            onChangeEmail={onChangeEmail}
            onChangePassword={onChangePassword}
            onSubmit={onSubmit}
          />
          <SocialLoginBlock googleOAuthUrl={googleOAuthUrl} disabled={loading} />
          <SignupCallout href={signupHref} disabled={loading} />
        </Card>
      </div>
    </div>
  );
}

function BrandHeader() {
  return (
    <div className="login-brand">
      <span className="login-brand-mark" aria-hidden="true">DT</span>
      <span className="login-brand-word">DevTicket</span>
    </div>
  );
}

function PageHeading() {
  return (
    <div className="login-heading">
      <h1 className="login-title">로그인</h1>
      <p className="login-subcopy">계정에 로그인하여 티켓을 관리하세요</p>
    </div>
  );
}

type LoginFormBlockProps = {
  email: string;
  password: string;
  errors: LoginFieldErrors;
  loading: boolean;
  onChangeEmail: (v: string) => void;
  onChangePassword: (v: string) => void;
  onSubmit: (e: FormEvent) => void;
};

function LoginForm({
  email,
  password,
  errors,
  loading,
  onChangeEmail,
  onChangePassword,
  onSubmit,
}: LoginFormBlockProps) {
  // 토글은 폼 로컬 상태 — 로그인 실패로 errors.form 이 갱신돼도 영향 없음.
  const [showPw, setShowPw] = useState(false);
  return (
    <form className="login-form" onSubmit={onSubmit} noValidate>
      {errors.form && (
        <div className="login-form-error" role="alert">
          <span aria-hidden="true">×</span> {errors.form}
        </div>
      )}
      <Input
        label="이메일"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        value={email}
        onChange={e => onChangeEmail(e.target.value)}
        error={errors.email}
        disabled={loading}
      />
      <Input
        label="비밀번호"
        type={showPw ? 'text' : 'password'}
        autoComplete="current-password"
        placeholder="비밀번호 입력"
        value={password}
        onChange={e => onChangePassword(e.target.value)}
        error={errors.password}
        disabled={loading}
        hintEnd={
          <button
            type="button"
            className="login-pw-toggle"
            onClick={() => setShowPw((v) => !v)}
            disabled={loading}
            aria-pressed={showPw}
            aria-label={showPw ? '비밀번호 숨기기' : '비밀번호 보기'}
          >
            {showPw ? '숨기기' : '보기'}
          </button>
        }
      />
      <Button
        type="submit"
        variant="primary"
        size="lg"
        full
        loading={loading}
        aria-busy={loading}
      >
        {loading ? '로그인 중...' : '로그인'}
      </Button>
    </form>
  );
}

function SocialLoginBlock({
  googleOAuthUrl,
  disabled,
}: {
  googleOAuthUrl: string;
  disabled: boolean;
}) {
  return (
    <div className="login-social">
      <div className="login-divider" role="separator">
        <span className="login-divider-label">또는</span>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="lg"
        full
        disabled={disabled}
        iconStart={<GoogleIcon />}
        onClick={() => {
          window.location.href = googleOAuthUrl;
        }}
      >
        Google로 로그인
      </Button>
    </div>
  );
}

function SignupCallout({ href, disabled }: { href: string; disabled: boolean }) {
  return (
    <div className="login-signup-callout">
      아직 계정이 없으신가요?{' '}
      <Link
        to={href}
        className="login-signup-link"
        aria-disabled={disabled || undefined}
        tabIndex={disabled ? -1 : undefined}
      >
        회원가입
      </Link>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.332 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" fill="#FFC107" />
      <path d="M6.306 14.691l6.571 4.819C14.655 15.108 19 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" fill="#FF3D00" />
      <path d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.316 0-9.828-3.417-11.402-8.162l-6.515 5.021C9.505 39.556 16.227 44 24 44z" fill="#4CAF50" />
      <path d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571.001-.001.002-.001.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" fill="#1976D2" />
    </svg>
  );
}
