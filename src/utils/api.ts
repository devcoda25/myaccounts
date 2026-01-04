import axios, { AxiosRequestConfig } from 'axios';
import { getFriendlyMessage } from '../components/errors/ApiErrorCatalog';

const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api';

const instance = axios.create({
    baseURL: baseUrl,
    withCredentials: true, // Important for HttpOnly cookies
});

export interface ApiOptions extends AxiosRequestConfig {
    body?: any;
}

export interface ApiFunction {
    (path: string, options?: ApiOptions): Promise<any>;
    get: (path: string, config?: AxiosRequestConfig) => Promise<any>;
    post: (path: string, data?: any, config?: AxiosRequestConfig) => Promise<any>;
    put: (path: string, data?: any, config?: AxiosRequestConfig) => Promise<any>;
    patch: (path: string, data?: any, config?: AxiosRequestConfig) => Promise<any>;
    delete: (path: string, config?: AxiosRequestConfig) => Promise<any>;
}

const apiBase: any = async (path: string, options: ApiOptions = {}) => {
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
    } catch (error: any) {
        throw new Error(getFriendlyMessage(error));
    }
};

export const api = apiBase as ApiFunction;

// Helper methods for compatibility and convenience
api.get = (path: string, config?: AxiosRequestConfig) => api(path, { ...config, method: 'GET' });
api.post = (path: string, data?: any, config?: AxiosRequestConfig) => api(path, { ...config, method: 'POST', data });
api.put = (path: string, data?: any, config?: AxiosRequestConfig) => api(path, { ...config, method: 'PUT', data });
api.patch = (path: string, data?: any, config?: AxiosRequestConfig) => api(path, { ...config, method: 'PATCH', data });
api.delete = (path: string, config?: AxiosRequestConfig) => api(path, { ...config, method: 'DELETE' });
