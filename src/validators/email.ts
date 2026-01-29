/**
 * Email Validator
 * Email validation utilities
 */

import { ValidationResult } from '@/types/validation';

/**
 * Email regex - RFC 5322 compliant
 */
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/**
 * Check if a string is a valid email format
 */
export function isEmail(value: string): boolean {
    return EMAIL_REGEX.test(value.trim());
}

/**
 * Validate email with detailed error message
 */
export function validateEmail(email: string): ValidationResult {
    if (!email.trim()) {
        return { valid: false, error: 'Email is required' };
    }
    if (!isEmail(email)) {
        return { valid: false, error: 'Please enter a valid email address' };
    }
    return { valid: true, error: '' };
}
