import { useEffect, useRef } from 'react';
import { useAuthStore } from '../stores/authStore';

/**
 * Automatically logs out the user after a period of inactivity.
 * Default timeout: 30 minutes.
 */
export function useIdleTimer(timeoutMinutes = 30) {
    const { user, logout } = useAuthStore();

    // Store last activity timestamp in a ref to avoid re-renders
    const lastActivity = useRef(Date.now());

    useEffect(() => {
        // Only run if user is logged in
        if (!user) return;

        const handleActivity = () => {
            lastActivity.current = Date.now();
        };

        // Events that constitute "activity"
        const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];

        // Add passive listeners where possible for performance
        events.forEach(event => {
            window.addEventListener(event, handleActivity, { passive: true });
        });

        // Check for inactivity every 1 minute
        const intervalId = setInterval(() => {
            const now = Date.now();
            const timeSinceLastActivity = now - lastActivity.current;
            const timeoutMs = timeoutMinutes * 60 * 1000;

            if (timeSinceLastActivity > timeoutMs) {
                // Log out
                logout();
            }
        }, 60 * 1000);

        return () => {
            events.forEach(event => {
                window.removeEventListener(event, handleActivity);
            });
            clearInterval(intervalId);
        };
    }, [user, logout, timeoutMinutes]);
}
