/**
 * Validation Constants
 * Configuration constants for validation rules
 */

/**
 * Maximum field length limits (matching backend DTO constraints)
 */
export const MAX_LENGTHS = {
    firstName: 100,
    lastName: 100,
    otherNames: 100,
    email: 255,
    phone: 20,
    subject: 200,
    description: 2000,
    organizationName: 200,
    walletDescription: 500,
} as const;

/**
 * Allowed MIME types for file uploads
 */
export const ALLOWED_FILE_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
] as const;

/**
 * Maximum file size for uploads (10MB)
 */
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Minimum password strength score required for submission
 */
export const MIN_PASSWORD_SCORE = 3;

/**
 * Minimum password length requirement
 */
export const MIN_PASSWORD_LENGTH = 8;

/**
 * OTP code length
 */
export const OTP_LENGTH = 6;
