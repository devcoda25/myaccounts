/**
 * Phone Validator
 * Phone number validation utilities
 */

import { ValidationResult } from '@/types/validation';

/**
 * Phone regex - E.164 format support
 * Supports international phone numbers with optional + prefix
 */
const PHONE_REGEX = /^\+?[1-9]\d{1,14}$/;

/**
 * Check if a string is a valid phone number format
 */
export function isPhoneNumber(value: string): boolean {
    return PHONE_REGEX.test(value.replace(/\s/g, ''));
}

/**
 * Validate phone number with detailed error message
 */
export function validatePhone(phone: string): ValidationResult {
    if (!phone.trim()) {
        return { valid: false, error: 'Phone number is required' };
    }
    if (!isPhoneNumber(phone)) {
        return { valid: false, error: 'Please enter a valid phone number' };
    }
    return { valid: true, error: '' };
}
