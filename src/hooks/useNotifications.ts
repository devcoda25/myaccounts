
import { useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';

export interface Notification {
    id: string;
    title: string;
    description: string;
    type: 'SECURITY' | 'INFO' | 'SUCCESS' | 'WARNING';
    read: boolean;
    createdAt: string;
    data?: any;
}

export function useNotifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = useCallback(async () => {
        try {
            const data = await api.get<Notification[]>('/notifications');
            setNotifications(data);
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const markAsRead = async (id: string) => {
        try {
            await api.patch(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        } catch (error) {
            console.error('Failed to mark as read', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.patch('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (error) {
            console.error('Failed to mark all as read', error);
        }
    };

    const remove = async (id: string) => {
        try {
            await api.delete(`/notifications/${id}`);
            setNotifications(prev => prev.filter(n => n.id !== id));
        } catch (error) {
            console.error('Failed to remove notification', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Optional: Poll every 30s
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    return {
        notifications,
        loading,
        markAsRead,
        markAllAsRead,
        remove,
        refresh: fetchNotifications
    };
}
