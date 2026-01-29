/**
 * Phone Masking
 * Utilities for masking phone numbers for display
 */

/**
 * Mask phone number for display
 * Shows last 4 digits with asterisks
 * Example: +256701234567 → ****4567
 */
export function maskPhone(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length < 4) {
        return '****';
    }
    return '****' + cleaned.slice(-4);
}

/**
 * Mask phone showing country code and last digits
 * Example: +256701234567 → +256 ****4567
 */
export function maskPhoneWithCountry(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length <= 4) {
        return phone;
    }

    const countryCode = cleaned.slice(0, cleaned.length - 4);
    const lastFour = cleaned.slice(-4);

    return `${countryCode} ****${lastFour}`;
}

/**
 * Mask phone for partial display
 * Shows first and last 2 digits
 * Example: +256701234567 → +2****45
 */
export function maskPhonePartial(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length <= 4) {
        return '****';
    }

    const first = cleaned.slice(0, 2);
    const last = cleaned.slice(-2);
    const middle = '*'.repeat(Math.min(cleaned.length - 4, 8));

    return `${first}${middle}${last}`;
}
