import { create } from 'zustand';
import { IUser } from "@/types";
import { api } from '../utils/api';

interface AuthState {
    user: IUser | null;
    isLoading: boolean;
    login: (identifier: string, password: string) => Promise<void>;
    socialLogin: (provider: 'google' | 'apple', token: string) => Promise<void>;
    register: (data: Record<string, unknown>) => Promise<unknown>;
    verifyEmail: (email: string, code: string) => Promise<void>;
    requestPhoneVerification: (identifier: string, deliveryMethod: 'sms_code' | 'whatsapp_code') => Promise<unknown>;
    verifyPhone: (identifier: string, code: string) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    isLoading: true,

    refreshUser: async () => {
        set({ isLoading: true });
        try {
            const data = await api('/users/me') as IUser;
            set({ user: data, isLoading: false });
        } catch (err) {
            set({ user: null, isLoading: false });
        }
    },

    login: async (identifier: string, password: string) => {
        set({ isLoading: true });
        try {
            await api('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ identifier, password }),
            });
            await get().refreshUser();
        } finally {
            set({ isLoading: false });
        }
    },

    socialLogin: async (provider: 'google' | 'apple', token: string) => {
        set({ isLoading: true });
        try {
            await api(`/auth/${provider}`, {
                method: 'POST',
                body: JSON.stringify({ token }),
            });
            await get().refreshUser();
        } finally {
            set({ isLoading: false });
        }
    },

    register: async (data: Record<string, unknown>) => {
        return await api('/users', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    verifyEmail: async (email: string, code: string) => {
        await api('/auth/verify-email', {
            method: 'POST',
            body: JSON.stringify({ identifier: email, code }),
        });
        await get().refreshUser();
    },

    requestPhoneVerification: async (identifier: string, deliveryMethod: 'sms_code' | 'whatsapp_code') => {
        return await api('/auth/request-phone-verification', {
            method: 'POST',
            body: JSON.stringify({ identifier, deliveryMethod }),
        });
    },

    verifyPhone: async (identifier: string, code: string) => {
        await api('/auth/verify-phone', {
            method: 'POST',
            body: JSON.stringify({ identifier, code }),
        });
        await get().refreshUser();
    },

    logout: async () => {
        set({ isLoading: true });
        try {
            await api('/auth/logout', { method: 'POST' }).catch(() => { });
        } finally {
            set({ user: null, isLoading: false });
        }
    },
}));
