import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { AdminUser, AdminRole } from '../utils/types';
import { useNavigate } from 'react-router-dom';

interface AdminAuthContextType {
    user: AdminUser | null;
    isAuthenticated: boolean;
    login: (email: string) => Promise<boolean>;
    logout: () => void;
    checkPermission: (permission: string) => boolean;
}

export const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const MOCK_ADMINS: Record<string, AdminUser> = {
    'admin@evzone.com': {
        id: 'adm_001',
        email: 'admin@evzone.com',
        name: 'System Admin',
        role: 'SuperAdmin',
        avatar: 'S'
    },
    'staff@evzone.com': {
        id: 'adm_002',
        email: 'staff@evzone.com',
        name: 'Staff Member',
        role: 'Admin',
        avatar: 'M'
    }
};

export function AdminAuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AdminUser | null>(null);
    const navigate = useNavigate();

    // Load from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem('evzone_admin_user');
        if (stored) {
            try {
                setUser(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse admin session");
                localStorage.removeItem('evzone_admin_user');
            }
        }
    }, []);

    const login = async (email: string): Promise<boolean> => {
        // Mock login logic
        const admin = MOCK_ADMINS[email];
        if (admin) {
            setUser(admin);
            localStorage.setItem('evzone_admin_user', JSON.stringify(admin));
            return true;
        }
        return false;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('evzone_admin_user');
        navigate('/admin/auth/login');
    };

    const checkPermission = (permission: string): boolean => {
        if (!user) return false;
        if (user.role === 'SuperAdmin') return true;

        // Permissions for regular Admins
        const adminAllowed = [
            'view_dashboard',
            'manage_users',
            'manage_orgs',
            'view_kyc',
            'view_wallets',
            'view_transactions',
            'view_status'
        ];

        return adminAllowed.includes(permission);
    };

    return (
        <AdminAuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, checkPermission }}>
            {children}
        </AdminAuthContext.Provider>
    );
}
