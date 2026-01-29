/**
 * Password Validator
 * Password strength evaluation utilities
 */

import {
    PasswordStrength,
    PasswordRequirement,
} from '@/types/validation';
import { MIN_PASSWORD_LENGTH, MIN_PASSWORD_SCORE } from '@/constants/validation';

/**
 * Evaluate password strength
 */
export function evaluatePassword(password: string): PasswordStrength {
    const requirements: PasswordRequirement[] = [
        {
            met: password.length >= MIN_PASSWORD_LENGTH,
            label: `At least ${MIN_PASSWORD_LENGTH} characters`,
        },
        { met: /[A-Z]/.test(password), label: 'One uppercase letter' },
        { met: /[a-z]/.test(password), label: 'One lowercase letter' },
        { met: /\d/.test(password), label: 'One number' },
        { met: /[^A-Za-z0-9]/.test(password), label: 'One symbol' },
    ];

    const score = requirements.filter((r) => r.met).length;

    let label: PasswordStrength['label'];
    if (score <= 1) label = 'Very Weak';
    else if (score === 2) label = 'Weak';
    else if (score === 3) label = 'Fair';
    else if (score === 4) label = 'Strong';
    else label = 'Very Strong';

    return { score, label, requirements };
}

/**
 * Check if password meets minimum strength requirement
 */
export function isStrongPassword(password: string): boolean {
    const strength = evaluatePassword(password);
    return strength.score >= MIN_PASSWORD_SCORE;
}

/**
 * Get password strength label without full evaluation
 */
export function getPasswordStrengthLabel(
    password: string
): PasswordStrength['label'] {
    const strength = evaluatePassword(password);
    return strength.label;
}
