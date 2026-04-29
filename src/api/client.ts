import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

/**
 * 백엔드가 프로필 미완성 사용자에게 반환하는 403 에러 코드.
 * 백엔드 ErrorCode enum 값과 일치해야 함.
 */
const PROFILE_INCOMPLETE_CODE = 'PROFILE_NOT_COMPLETED';

/** 403 응답이 "프로필 미완성" 에러인지 판별 */
function isProfileIncomplete(error: AxiosError): boolean {
  const data = error.response?.data as { code?: string } | undefined;
  return data?.code === PROFILE_INCOMPLETE_CODE;
}

/** 비로그인 사용자도 자유롭게 접근 가능한 공개 라우트 (RequireAuth 미적용). */
const PUBLIC_PATH_PATTERNS: RegExp[] = [
  /^\/$/,
  /^\/events\/?$/,
  /^\/events\/[^/]+\/?$/,
  /^\/login\/?$/,
  /^\/signup(\/.*)?$/,
  /^\/oauth\/callback\/?$/,
  /^\/social\/profile-setup\/?$/,
];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATH_PATTERNS.some((re) => re.test(pathname));
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: "/api",
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
  paramsSerializer: (params) => {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null) continue;
      if (Array.isArray(value)) {
        value.forEach((v) => searchParams.append(key, String(v)));
      } else {
        searchParams.append(key, String(value));
      }
    }
    return searchParams.toString();
  },
});

// ── Request: access token 주입 ──────────────────────────────────────────────
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('accessToken');
  const userId = localStorage.getItem('userId');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (userId) config.headers['X-User-Id'] = userId;
  return config;
});

// ── Response: 401 → 토큰 재발급 후 원본 요청 재시도 ──────────────────────────
let isRefreshing = false;
let failedQueue: Array<{ resolve: (v: string) => void; reject: (e: unknown) => void }> = [];

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve(token!)));
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // 403 + PROFILE_NOT_COMPLETED: 프로필 미완성 → 프로필 설정 페이지로 리다이렉트
    // 다른 이유의 403(권한 부족, 비즈니스 규칙 등)은 여기서 처리하지 않음
    if (error.response?.status === 403 && isProfileIncomplete(error)) {
      const currentPath = window.location.pathname;
      if (currentPath !== '/social/profile-setup' && currentPath !== '/oauth/callback') {
        window.location.href = '/social/profile-setup';
      }
      return Promise.reject(error);
    }

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // 비로그인 상태에서 발생한 401 은 단순히 "이 API 는 인증이 필요하다"는
    // 신호일 뿐이므로 강제 로그인 리다이렉트하지 않는다. 호출 측이 catch 해서
    // 자체 처리(섹션 숨김 등) 하도록 그대로 reject.
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return apiClient(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const { data } = await axios.post(`${BASE_URL}/auth/reissue`, { refreshToken });
      const newAccessToken: string = data.data.accessToken;

      localStorage.setItem('accessToken', newAccessToken);
      apiClient.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
      processQueue(null, newAccessToken);
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userId');
      // 공개 라우트(홈, 이벤트 둘러보기/상세 등) 에서는 로그인 페이지로
      // 강제 이동하지 않는다. 보호된 라우트(RequireAuth) 는 토큰이 사라진
      // 다음 렌더에서 RequireAuth 가 알아서 /login 으로 보낸다.
      if (!isPublicPath(window.location.pathname)) {
        window.location.href = '/login';
      }
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

/** 공통 응답 래퍼 – 서버가 { code, message, data } 구조를 반환한다고 가정 */
export interface ApiResponse<T> {
  code: string;
  message: string;
  data: T;
}

/**
 * 백엔드 응답이 `{ code, message, data }` 래퍼이거나 raw payload일 수 있어
 * 두 케이스를 모두 안전하게 언랩합니다.
 */
export function unwrapApiData<T>(payload: ApiResponse<T> | T): T {
  if (
    payload !== null &&
    typeof payload === 'object' &&
    'data' in (payload as Record<string, unknown>)
  ) {
    return (payload as ApiResponse<T>).data;
  }
  return payload as T;
}

/** 멱등성 키 헤더를 포함한 axios config를 반환합니다. */
export function idempotencyConfig() {
  const key = (() => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }

    if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
      const bytes = new Uint8Array(16);
      crypto.getRandomValues(bytes);
      bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
      bytes[8] = (bytes[8] & 0x3f) | 0x80; // RFC 4122 variant
      const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
      return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
    }

    const fallback = `${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}`;
    return `fallback-${fallback}`;
  })();

  return {
    headers: { 'Idempotency-Key': key },
  };
}

/** 페이지네이션 공통 타입 */
export interface Page<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
