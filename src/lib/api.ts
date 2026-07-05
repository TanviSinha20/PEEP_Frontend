import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// ============================================================
// Base URL — all calls go to the Go backend only
// ============================================================
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api/v1';

// Token store reference (lazy import to avoid circular dep)
let getAuthState: (() => {
  access_token: string | null;
  refresh_token: string | null;
  token_expires_at: number | null;
  setTokens: (access_token: string, expires_in: number) => void;
  clearAuth: () => void;
}) | null = null;

export function registerAuthStore(fn: typeof getAuthState) {
  getAuthState = fn;
}

// ============================================================
// Axios Instance
// ============================================================
export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// ============================================================
// Request Interceptor — attach Bearer token, silent refresh
// ============================================================
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    if (!getAuthState) return config;

    const auth = getAuthState();
    if (!auth.access_token) return config;

    const aboutToExpire =
      auth.token_expires_at !== null &&
      Date.now() > auth.token_expires_at - 60_000; // 1 min buffer

    if (aboutToExpire && auth.refresh_token) {
      try {
        // Silent token refresh — use raw axios to avoid recursive interceptor
        const res = await axios.post(`${BASE_URL}/auth/refresh`, {
          refresh_token: auth.refresh_token,
        });
        const { access_token, expires_in } = res.data;
        auth.setTokens(access_token, expires_in);
        config.headers.Authorization = `Bearer ${access_token}`;
      } catch {
        // Refresh failed — let 401 response interceptor handle logout
        config.headers.Authorization = `Bearer ${auth.access_token}`;
      }
    } else {
      config.headers.Authorization = `Bearer ${auth.access_token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ============================================================
// Response Interceptor — handle 401 force logout
// ============================================================
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401 && getAuthState) {
      getAuthState().clearAuth();
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

// ============================================================
// Unauthenticated client — for public endpoints (hospitals list)
// ============================================================
export const publicClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// ============================================================
// Error message extractor helper
// ============================================================
export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong.'): string {
  if (axios.isAxiosError(error)) {
    return (
      (error.response?.data as { message?: string })?.message ||
      error.message ||
      fallback
    );
  }
  return fallback;
}
