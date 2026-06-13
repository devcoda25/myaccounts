/**
 * Common Helper Functions
 * Shared utilities extracted from multiple Index.tsx files
 */

import { isEmail, maskEmail } from './validation';

/**
 * Check if value looks like an email
 * @deprecated Use validators/email.ts isEmail instead
 */
export function isEmailValue(v: string): boolean {
    return isEmail(v);
}

/**
 * Check if value looks like a phone number
 */
export function isPhoneValue(v: string): boolean {
    const cleaned = v.replace(/\D/g, '');
    return cleaned.length >= 7 && cleaned.length <= 15;
}

/**
 * Mask identifier (email or phone) for display
 * @deprecated Use masks/email.ts maskEmail instead
 */
export function maskIdentifier(v: string): string {
    const trimmed = v.trim();
    if (!trimmed) return '';

    if (isEmail(trimmed)) {
        return maskEmail(trimmed);
    }

    // For phone numbers, show last 4 digits
    const cleaned = trimmed.replace(/\D/g, '');
    if (cleaned.length < 4) return '****';
    return `****${cleaned.slice(-4)}`;
}

/**
 * Check if WebAuthn/Passkeys is supported
 */
export function supportsPasskeys(): boolean {
    try {
        const w = window as unknown as { PublicKeyCredential?: unknown };
        return !!w.PublicKeyCredential;
    } catch {
        return false;
    }
}

/**
 * Generate cryptographically secure random bytes
 */
export function safeRandomBytes(n: number): Uint8Array {
    if (typeof window === 'undefined' || !window.crypto || !window.crypto.getRandomValues) {
        throw new Error('Secure random number generation is not supported in this environment');
    }
    const out = new Uint8Array(n);
    window.crypto.getRandomValues(out);
    return out;
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date | string | number): string {
    const now = new Date();
    const target = new Date(date);
    const diffMs = now.getTime() - target.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;

    return target.toLocaleDateString();
}

/**
 * Capitalize first letter of string
 */
export function capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Truncate string to specified length
 */
export function truncate(str: string, maxLength: number): string {
    if (str.length <= maxLength) return str;
    return `${str.slice(0, maxLength - 3)}...`;
}

/**
 * Generate a unique ID
 */
export function generateId(prefix: string = 'id'): string {
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
    fn: T,
    delay: number
): (...args: Parameters<T>) => void {
    let timeoutId: ReturnType<typeof setTimeout>;
    return (...args: Parameters<T>) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), delay);
    };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
    fn: T,
    limit: number
): (...args: Parameters<T>) => void {
    let inThrottle = false;
    return (...args: Parameters<T>) => {
        if (!inThrottle) {
            fn(...args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
}

/**
 * Deep clone object
 */
export function deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Check if object is empty
 */
export function isEmpty(obj: object): boolean {
    return Object.keys(obj).length === 0;
}

/**
 * Get nested property safely
 */
export function getNestedValue<T>(obj: T, path: string): unknown {
    return path.split('.').reduce((curr: unknown, key) => {
        return curr && typeof curr === 'object' ? (curr as Record<string, unknown>)[key] : undefined;
    }, obj);
}

/**
 * Class names helper (similar to cn from tailwind-merge)
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
    return classes.filter(Boolean).join(' ');
}
