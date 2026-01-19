import axios, { AxiosRequestConfig, AxiosError, InternalAxiosRequestConfig } from 'axios';
import axiosRetry from 'axios-retry';
import { getFriendlyMessage } from '../components/errors/ApiErrorCatalog';

const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api';

// [Quality] Strict Typed Error Class
export class AppApiError extends Error {
    public status: number;
    public code?: string;
    public originalError: unknown;

    constructor(message: string, status: number = 500, code?: string, original?: unknown) {
        super(message);
        this.name = 'AppApiError';
        this.status = status;
        this.code = code;
        this.originalError = original;
    }
}

const instance = axios.create({
    baseURL: baseUrl,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    }
});

// [Resilience] Exponential Backoff for 5xx errors
axiosRetry(instance, {
    retries: 3,
    retryDelay: axiosRetry.exponentialDelay,
    retryCondition: (error) => {
        // Retry on 503 (Service Unavailable) or Network Errors
        return axiosRetry.isNetworkOrIdempotentRequestError(error) || (error.response?.status === 503);
    }
});

// [Security] Auth Interceptor (OIDC)
// [Security] Auth Interceptor (OIDC)
import { userManager } from '../auth/oidcConfig';

instance.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
    try {
        // [DEBUG] Log existing headers
        // console.log("[API Interceptor] Before: ", config.headers);

        const user = await userManager.getUser();

        // [DEBUG] Log user check
        // console.log(`[API Interceptor] UserManager User found: ${!!user}`);

        if (user?.access_token) {
            // Only set if not already set? Or overwrite? 
            // If we passed explicit token, it should be in config.headers.Authorization already.
            if (!config.headers.Authorization) {
                config.headers.Authorization = `Bearer ${user.access_token}`;
            }
        }
    } catch { /* ignore */ }
    return config;
});


export interface ApiOptions extends AxiosRequestConfig {
    body?: unknown;
}

export interface ApiFunction {
    <T>(path: string, options?: ApiOptions): Promise<T>;
    get: <T>(path: string, config?: AxiosRequestConfig) => Promise<T>;
    post: <T>(path: string, data?: unknown, config?: AxiosRequestConfig) => Promise<T>;
    put: <T>(path: string, data?: unknown, config?: AxiosRequestConfig) => Promise<T>;
    patch: <T>(path: string, data?: unknown, config?: AxiosRequestConfig) => Promise<T>;
    delete: <T>(path: string, config?: AxiosRequestConfig) => Promise<T>;
}

const apiBase = async <T>(path: string, options: ApiOptions = {}): Promise<T> => {
    try {
        const { body, ...axiosOptions } = options;
        const config: AxiosRequestConfig = {
            url: path,
            ...axiosOptions,
            data: axiosOptions.data || body,
        };

        const response = await instance(config);
        return response.data;
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            // [Security] Handle 401 Session Expiry
            if (error.response?.status === 401) {
                console.warn("[API] 401 Unauthorized. Session might be expired or invalid.");
                // [DEBUG] Disable auto-logout to trace the "Ghost 401"
                // const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
                // const isProd = import.meta.env.PROD;
                // const authority = isProd ? 'https://accounts.evzone.app/oidc' : `${new URL(apiBaseUrl).origin}/oidc`;
                // const storageKey = `oidc.user:${authority}:evzone-portal`;
                // sessionStorage.removeItem(storageKey);
                // window.dispatchEvent(new Event('auth:logout'));
            }

            const msg = getFriendlyMessage(error as AxiosError); // Cast safe due to guard
            throw new AppApiError(msg, error.response?.status || 500, error.code, error);
        }
        throw new AppApiError(error instanceof Error ? error.message : 'Unknown Error', 500, 'UNKNOWN', error);
    }
};

export const api = apiBase as ApiFunction;

// Helper methods
api.get = <T>(path: string, config?: AxiosRequestConfig) => api<T>(path, { ...config, method: 'GET' });
api.post = <T>(path: string, data?: unknown, config?: AxiosRequestConfig) => api<T>(path, { ...config, method: 'POST', data });
api.put = <T>(path: string, data?: unknown, config?: AxiosRequestConfig) => api<T>(path, { ...config, method: 'PUT', data });
api.patch = <T>(path: string, data?: unknown, config?: AxiosRequestConfig) => api<T>(path, { ...config, method: 'PATCH', data });
api.delete = <T>(path: string, config?: AxiosRequestConfig) => api<T>(path, { ...config, method: 'DELETE' });
