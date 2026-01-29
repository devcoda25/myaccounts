/**
 * Validation Types
 * Type definitions for validation utilities
 */

/**
 * Result of a validation operation
 */
export interface ValidationResult {
    valid: boolean;
    error: string;
}

/**
 * Password strength evaluation result
 */
export interface PasswordStrength {
    score: number; // 0-5
    label: 'Very Weak' | 'Weak' | 'Fair' | 'Good' | 'Strong' | 'Very Strong';
    requirements: {
        met: boolean;
        label: string;
    }[];
}

/**
 * Password requirement for display
 */
export interface PasswordRequirement {
    met: boolean;
    label: string;
}
