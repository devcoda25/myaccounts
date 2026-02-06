// api.ts
import axios, { AxiosRequestConfig, AxiosError, InternalAxiosRequestConfig } from "axios";
import axiosRetry from "axios-retry";
import { getFriendlyMessage, ApiError } from "../components/errors/ApiErrorCatalog";
import { userManager } from "../auth/oidcConfig";

const baseUrl = import.meta.env.VITE_API_BASE_URL || "/api/v1";
const CSRF_TOKEN_KEY = 'x-csrf-token';
const CSRF_COOKIE_KEY = 'evzone-csrf';

/**
 * [Security] Generate a random CSRF token
 */
function generateCsrfToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * [Security] Get CSRF token from cookie or generate new one
 */
function getCsrfToken(): string {
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === CSRF_COOKIE_KEY) return value;
  }
  // If no token exists, generate one
  const newToken = generateCsrfToken();
  // Set cookie with SameSite=Strict for maximum CSRF protection
  document.cookie = `${CSRF_COOKIE_KEY}=${newToken}; path=/; SameSite=Strict; Secure`;
  return newToken;
}

export class AppApiError extends Error {
  public status: number;
  public code?: string;
  public originalError: unknown;

  constructor(message: string, status: number = 500, code?: string, original?: unknown) {
    super(message);
    this.name = "AppApiError";
    this.status = status;
    this.code = code;
    this.originalError = original;
  }
}

const instance = axios.create({
  baseURL: baseUrl,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
  // [Security] Configure CSRF protection
  xsrfCookieName: CSRF_COOKIE_KEY,
  xsrfHeaderName: CSRF_TOKEN_KEY,
});

axiosRetry(instance, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) =>
    axiosRetry.isNetworkOrIdempotentRequestError(error) || error.response?.status === 503,
});

// Attach access token and CSRF token for state-changing requests
instance.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  try {
    const user = await userManager.getUser();
    console.log("[API] User from OIDC:", user ? { isAuthenticated: !!user.access_token, hasToken: !!user.access_token } : null);
    if (user?.access_token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${user.access_token}`;
    }
  } catch {
    console.error("[API] Error getting user from OIDC:");
  }

  // [Security] Add CSRF token for state-changing methods
  const isStateChanging = ['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase() || '');
  if (isStateChanging && !config.headers[CSRF_TOKEN_KEY]) {
    const csrfToken = getCsrfToken();
    config.headers[CSRF_TOKEN_KEY] = csrfToken;
  }

  // Don't set Content-Type for FormData - let axios set it with boundary
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  return config;
});

export interface ApiOptions extends AxiosRequestConfig {
  body?: unknown; // object, not string
}

export interface ApiFunction {
  <T>(path: string, options?: ApiOptions): Promise<T>;
  get: <T>(path: string, config?: AxiosRequestConfig) => Promise<T>;
  post: <T>(path: string, data?: unknown, config?: AxiosRequestConfig) => Promise<T>;
  put: <T>(path: string, data?: unknown, config?: AxiosRequestConfig) => Promise<T>;
  patch: <T>(path: string, data?: unknown, config?: AxiosRequestConfig) => Promise<T>;
  delete: <T>(path: string, config?: AxiosRequestConfig) => Promise<T>;
}

// Debug helper - check cookies
function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

console.log("[API] Cookies:", {
  hasEvzoneToken: !!getCookie('evzone_token'),
  hasCsrfToken: !!getCookie('evzone-csrf'),
});

const apiBase = async <T>(path: string, options: ApiOptions = {}): Promise<T> => {
  try {
    const { body, ...axiosOptions } = options;

    const config: AxiosRequestConfig = {
      url: path,
      ...axiosOptions,
      // ✅ prefer explicit data, else use body
      data: axiosOptions.data ?? body,
    };

    const response = await instance(config);
    return response.data as T;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        console.warn("[API] 401 Unauthorized. Session might be expired or invalid.");
      }

      const msg = getFriendlyMessage({
        response: {
          status: error.response?.status,
          data: error.response?.data as { message?: string } | undefined,
        },
        message: error.message,
      });
      throw new AppApiError(msg, error.response?.status || 500, error.code, error);
    }

    throw new AppApiError(error instanceof Error ? error.message : "Unknown Error", 500, "UNKNOWN", error);
  }
};

export const api = apiBase as ApiFunction;

api.get = <T>(path: string, config?: AxiosRequestConfig) => api<T>(path, { ...config, method: "GET" });
api.post = <T>(path: string, data?: unknown, config?: AxiosRequestConfig) => api<T>(path, { ...config, method: "POST", data });
api.put = <T>(path: string, data?: unknown, config?: AxiosRequestConfig) => api<T>(path, { ...config, method: "PUT", data });
api.patch = <T>(path: string, data?: unknown, config?: AxiosRequestConfig) => api<T>(path, { ...config, method: "PATCH", data });
api.delete = <T>(path: string, config?: AxiosRequestConfig) => api<T>(path, { ...config, method: "DELETE" });
