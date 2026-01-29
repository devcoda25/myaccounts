/**
 * File Validator
 * File upload validation utilities
 */

import { ValidationResult } from '@/types/validation';
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from '@/constants/validation';

/**
 * Validate file type and size for uploads
 */
export function validateFileUpload(file: File): ValidationResult {
    if (!ALLOWED_FILE_TYPES.includes(file.type as typeof ALLOWED_FILE_TYPES[number])) {
        return {
            valid: false,
            error: `File type "${file.type}" not allowed. Allowed: images, PDF, DOC, TXT`,
        };
    }

    if (file.size > MAX_FILE_SIZE) {
        const maxMB = MAX_FILE_SIZE / 1024 / 1024;
        return {
            valid: false,
            error: `File size exceeds ${maxMB}MB limit`,
        };
    }

    return { valid: true, error: '' };
}

/**
 * Check if a file type is allowed
 */
export function isAllowedFileType(mimeType: string): boolean {
    return ALLOWED_FILE_TYPES.includes(mimeType as typeof ALLOWED_FILE_TYPES[number]);
}

/**
 * Check if file size is within limit
 */
export function isValidFileSize(size: number): boolean {
    return size <= MAX_FILE_SIZE;
}
