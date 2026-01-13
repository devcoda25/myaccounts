import axios, { AxiosRequestConfig } from 'axios';
import { getFriendlyMessage } from '../components/errors/ApiErrorCatalog';

const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api';

const instance = axios.create({
    baseURL: baseUrl,
    withCredentials: true, // Important for HttpOnly cookies
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
    // Helper to get OIDC token from storage
    // Key format: oidc.user:<authority>:<client_id>
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
    let authority = apiBaseUrl;
    try {
        authority = new URL(apiBaseUrl).origin;
    } catch { /* ignore */ }

    const storageKey = `oidc.user:${authority}:evzone-portal`;

    try {
        // Compatibility with fetch-style 'body'
        const { body, ...axiosOptions } = options;
        const config: AxiosRequestConfig = {
            url: path,
            ...axiosOptions,
            data: axiosOptions.data || body,
            headers: {
                ...axiosOptions.headers,
            },
        };

        // We match the logic in oidcConfig.ts
        const oidcStorage = sessionStorage.getItem(storageKey);

        // Debug Log
        // console.log(`[API] Looking for token with key: ${storageKey}. Found: ${!!oidcStorage}`);

        if (oidcStorage) {
            try {
                const user = JSON.parse(oidcStorage);
                if (user?.access_token) {
                    config.headers = {
                        ...config.headers,
                        'Authorization': `Bearer ${user.access_token}`
                    };
                }
            } catch { /* ignore invalid json */ }
        }

        // If body is a string, and no contentType is set, assume JSON
        if (typeof config.data === 'string' && !config.headers?.['Content-Type']) {
            config.headers = { ...config.headers, 'Content-Type': 'application/json' };
        }

        const response = await instance(config);
        return response.data;
    } catch (error: unknown) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
            // Token is invalid or expired, but OIDC thinks we are logged in.
            // Clear storage to break the loop and force re-login.
            console.warn("[API] 401 Unauthorized. Clearing OIDC session to break loop.");
            sessionStorage.removeItem(storageKey);

            // Notify UI to clear in-memory state
            window.dispatchEvent(new Event('auth:logout'));
        }

        if (axios.isAxiosError(error)) {
            throw new Error(getFriendlyMessage(error));
        }
        throw new Error(error instanceof Error ? error.message : 'An unexpected error occurred');
    }
};

export const api = apiBase as ApiFunction;

// Helper methods for compatibility and convenience
api.get = <T>(path: string, config?: AxiosRequestConfig) => api<T>(path, { ...config, method: 'GET' });
api.post = <T>(path: string, data?: unknown, config?: AxiosRequestConfig) => api<T>(path, { ...config, method: 'POST', data });
api.put = <T>(path: string, data?: unknown, config?: AxiosRequestConfig) => api<T>(path, { ...config, method: 'PUT', data });
api.patch = <T>(path: string, data?: unknown, config?: AxiosRequestConfig) => api<T>(path, { ...config, method: 'PATCH', data });
api.delete = <T>(path: string, config?: AxiosRequestConfig) => api<T>(path, { ...config, method: 'DELETE' });
