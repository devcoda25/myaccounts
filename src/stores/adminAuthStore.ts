import { create } from 'zustand';
import { IUser } from '../utils/types';
import { api } from '../utils/api';

interface AdminAuthState {
    user: IUser | null;
    isLoading: boolean;
    login: (identifier: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
    checkPermission: (permission: string) => boolean;
    refreshAdmin: () => Promise<void>;
}

export const useAdminAuthStore = create<AdminAuthState>((set, get) => ({
    user: null,
    isLoading: true,

    refreshAdmin: async () => {
        console.log('[AdminAuthStore] refreshAdmin started');
        set({ isLoading: true });
        try {
            const data = await api<IUser>('/users/me');
            if (data.role === 'SUPER_ADMIN' || data.role === 'ADMIN') {
                set({ user: data, isLoading: false });
            } else {
                set({ user: null, isLoading: false });
            }
        } catch (err) {
            console.error('[AdminAuthStore] refreshAdmin error:', err);
            set({ user: null, isLoading: false });
        }
    },

    login: async (identifier: string, password: string) => {
        set({ isLoading: true });
        await api<void>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ identifier, password }),
        });

        const data = await api<IUser>('/users/me');
        if (data.role === 'SUPER_ADMIN' || data.role === 'ADMIN') {
            set({ user: data, isLoading: false });
            return true;
        } else {
            // Log out if they successfully authenticated but are not allowed here
            set({ user: null, isLoading: false });
            await api<void>('/auth/logout', { method: 'POST' }).catch(() => { });
            throw new Error('Access denied. This account does not have administrator privileges.');
        }
    },

    logout: async () => {
        set({ isLoading: true });
        try {
            await api<void>('/auth/logout', { method: 'POST' }).catch(() => { });
        } finally {
            set({ user: null, isLoading: false });
        }
    },

    checkPermission: (permission: string): boolean => {
        const { user } = get();
        if (!user) return false;
        if (user.role === 'SUPER_ADMIN') return true;

        // Permissions for regular Admins
        const adminAllowed = [
            'view_dashboard',
            'manage_users',
            'manage_orgs',
            'view_kyc',
            'view_wallets',
            'view_transactions',
            'view_disputes',
            'view_status'
        ];

        return adminAllowed.includes(permission);
    }
}));
