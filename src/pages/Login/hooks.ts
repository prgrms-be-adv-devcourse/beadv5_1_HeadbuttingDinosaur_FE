import { useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { login as loginApi } from '@/api/auth.api';
import { unwrapApiData } from '@/api/client';
import { useAuth } from '@/contexts/AuthContext';

const GOOGLE_OAUTH_URL =
  import.meta.env.VITE_GOOGLE_OAUTH_URL ?? 'http://localhost:8080/oauth2/authorization/google';

const SIGNUP_HREF = '/signup';

export type LoginFormState = {
  email: string;
  password: string;
};

export type LoginFieldErrors = {
  email?: string;
  password?: string;
  form?: string;
};

const EMAIL_REGEX = /\S+@\S+\.\S+/;

export function validate(form: LoginFormState): LoginFieldErrors {
  const errors: LoginFieldErrors = {};
  if (!form.email) {
    errors.email = '이메일을 입력하세요';
  } else if (!EMAIL_REGEX.test(form.email)) {
    errors.email = '올바른 이메일 형식이 아닙니다';
  }
  if (!form.password) {
    errors.password = '비밀번호를 입력하세요';
  }
  return errors;
}

// §5.4 화이트리스트: 외부 도메인/프로토콜 우회 차단. `/` 시작 + `//` 비시작만 통과.
export function safeReturnTo(raw: string | null | undefined): string {
  if (!raw) return '/';
  if (!raw.startsWith('/')) return '/';
  if (raw.startsWith('//')) return '/';
  return raw;
}

// §3 에러 매핑 표 + D-2: 422 응답이 `errors: { email?, password? }` 또는
// `errors: [{ field, message }]` 두 형태 모두 들어올 수 있어 양쪽 수용.
export function mapLoginError(err: unknown): LoginFieldErrors {
  if (axios.isAxiosError(err)) {
    if (!err.response) {
      return { form: '네트워크 연결을 확인해주세요. 연결 후 다시 시도해주세요.' };
    }
    const status = err.response.status;
    if (status === 400) {
      return { form: '요청 형식이 올바르지 않습니다.' };
    }
    if (status === 401) {
      return { form: '이메일 또는 비밀번호가 일치하지 않습니다.' };
    }
    if (status === 403) {
      return { form: '계정이 잠겼거나 비활성화되었습니다. 관리자에게 문의하세요.' };
    }
    if (status === 422) {
      return mapValidationErrors(err.response.data);
    }
    if (status === 429) {
      return { form: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' };
    }
    if (status >= 500 && status < 600) {
      return { form: '일시적인 오류입니다. 잠시 후 다시 시도해주세요.' };
    }
  }
  return { form: '로그인에 실패했습니다. 잠시 후 다시 시도해주세요.' };
}

function mapValidationErrors(data: unknown): LoginFieldErrors {
  const errors = (data as { errors?: unknown } | null)?.errors;
  const result: LoginFieldErrors = {};

  if (Array.isArray(errors)) {
    for (const item of errors as Array<{ field?: string; message?: string }>) {
      if (!item || typeof item.message !== 'string') continue;
      if (item.field === 'email') result.email = item.message;
      else if (item.field === 'password') result.password = item.message;
    }
  } else if (errors && typeof errors === 'object') {
    const obj = errors as { email?: unknown; password?: unknown };
    if (typeof obj.email === 'string') result.email = obj.email;
    if (typeof obj.password === 'string') result.password = obj.password;
  }

  if (result.email || result.password) return result;
  return { form: '입력값을 확인해주세요.' };
}

export function useLoginForm() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [form, setForm] = useState<LoginFormState>({ email: '', password: '' });
  const [errors, setErrors] = useState<LoginFieldErrors>({});
  const [loading, setLoading] = useState(false);

  const onChangeEmail = (v: string) => {
    setForm(f => ({ ...f, email: v }));
    setErrors(e => ({ ...e, email: undefined, form: undefined }));
  };

  const onChangePassword = (v: string) => {
    setForm(f => ({ ...f, password: v }));
    setErrors(e => ({ ...e, password: undefined, form: undefined }));
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const fieldErrors = validate(form);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const res = await loginApi(form);
      const { accessToken, refreshToken } = unwrapApiData(res.data);
      await auth.login(accessToken, refreshToken);
      navigate(safeReturnTo(searchParams.get('returnTo')), { replace: true });
    } catch (err) {
      setErrors(mapLoginError(err));
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    errors,
    loading,
    onChangeEmail,
    onChangePassword,
    onSubmit,
    signupHref: SIGNUP_HREF,
    googleOAuthUrl: GOOGLE_OAUTH_URL,
  };
}
