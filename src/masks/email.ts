/**
 * Email Masking
 * Utilities for masking email addresses for display
 */

import { isEmail } from '@/validators/email';

/**
 * Mask email address for display
 * Shows first 2 characters and domain
 * Example: john.doe@example.com → jo***@example.com
 */
export function maskEmail(email: string): string {
    const trimmedEmail = email.trim();
    if (!isEmail(trimmedEmail)) {
        return trimmedEmail;
    }

    const [user, domain] = trimmedEmail.split('@');
    const safeUser =
        user.length <= 2 ? user[0] + '*' : user.slice(0, 2) + '***';

    return `${safeUser}@${domain}`;
}

/**
 * Mask email showing first character and domain
 * Example: john.doe@example.com → j***@example.com
 */
export function maskEmailMinimal(email: string): string {
    const trimmedEmail = email.trim();
    if (!isEmail(trimmedEmail)) {
        return trimmedEmail;
    }

    const [user, domain] = trimmedEmail.split('@');
    const safeUser = user[0] + '***';

    return `${safeUser}@${domain}`;
}
