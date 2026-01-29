/**
 * Common Validators
 * General purpose validation utilities
 */

import { ValidationResult } from '@/types/validation';
import { OTP_LENGTH } from '@/constants/validation';

/**
 * Validate field doesn't exceed max length
 */
export function validateMaxLength(
    value: string,
    maxLength: number
): ValidationResult {
    if (value.length > maxLength) {
        return { valid: false, error: `Must be under ${maxLength} characters` };
    }
    return { valid: true, error: '' };
}

/**
 * Validate OTP code format (6 digits)
 */
export function isValidOtp(code: string): boolean {
    return /^\d{6}$/.test(code);
}

/**
 * Validate string is not empty after trimming
 */
export function isNotEmpty(value: string): boolean {
    return value.trim().length > 0;
}

/**
 * Validate minimum length
 */
export function validateMinLength(
    value: string,
    minLength: number
): ValidationResult {
    if (value.trim().length < minLength) {
        return { valid: false, error: `Must be at least ${minLength} characters` };
    }
    return { valid: true, error: '' };
}

/**
 * Validate strings match (e.g., password confirmation)
 */
export function validateMatch(
    value1: string,
    value2: string,
    fieldName: string = 'Fields'
): ValidationResult {
    if (value1 !== value2) {
        return { valid: false, error: `${fieldName} do not match` };
    }
    return { valid: true, error: '' };
}
