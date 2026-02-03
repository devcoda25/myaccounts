// Types for administrators module

import { AdminRole } from '@/types';

export interface AdminMember {
    id: string;
    name: string;
    email: string;
    role: AdminRole;
    lastActive: string;
    status: 'Active' | 'Invited';
}

export interface NotificationOptions {
    type: 'warning' | 'success' | 'error' | 'info';
    title: string;
    message: string;
    actionText?: string;
    loading?: boolean;
    onAction?: () => void;
}
