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

        // If body is a string, and no contentType is set, assume JSON
        if (typeof config.data === 'string' && !config.headers?.['Content-Type']) {
            config.headers = { ...config.headers, 'Content-Type': 'application/json' };
        }

        const response = await instance(config);
        return response.data;
    } catch (error: unknown) {
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
