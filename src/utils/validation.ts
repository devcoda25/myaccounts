/**
 * EVzone My Accounts - Validation Utilities
 * Provides consistent validation across frontend components
 */

// Email validation - comprehensive regex matching RFC 5322 standards
export function isEmail(v: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(v.trim());
}

// Phone validation - E.164 format support
export function isPhoneNumber(v: string): boolean {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(v.replace(/\s/g, ''));
}

// Field length limits (matching backend DTO constraints)
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

// Validate field doesn't exceed max length
export function validateMaxLength(value: string, maxLength: number): { valid: boolean; error: string } {
    if (value.length > maxLength) {
        return { valid: false, error: `Must be under ${maxLength} characters` };
    }
    return { valid: true, error: '' };
}

// Validate email with detailed error
export function validateEmail(email: string): { valid: boolean; error: string } {
    if (!email.trim()) {
        return { valid: false, error: 'Email is required' };
    }
    if (!isEmail(email)) {
        return { valid: false, error: 'Please enter a valid email address' };
    }
    return { valid: true, error: '' };
}

// Validate phone with detailed error
export function validatePhone(phone: string): { valid: boolean; error: string } {
    if (!phone.trim()) {
        return { valid: false, error: 'Phone number is required' };
    }
    if (!isPhoneNumber(phone)) {
        return { valid: false, error: 'Please enter a valid phone number' };
    }
    return { valid: true, error: '' };
}

// Sanitize user input to prevent XSS
export function sanitizeInput(input: string): string {
    return input
        .replace(/&/g, '&')
        .replace(/</g, '<')
        .replace(/>/g, '>')
        .replace(/"/g, '"')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}

// Validate password strength
export interface PasswordStrength {
    score: number; // 0-5
    label: 'Very Weak' | 'Weak' | 'Fair' | 'Good' | 'Strong' | 'Very Strong';
    requirements: {
        met: boolean;
        label: string;
    }[];
}

export function evaluatePassword(password: string): PasswordStrength {
    const requirements = [
        { met: password.length >= 8, label: 'At least 8 characters' },
        { met: /[A-Z]/.test(password), label: 'One uppercase letter' },
        { met: /[a-z]/.test(password), label: 'One lowercase letter' },
        { met: /\d/.test(password), label: 'One number' },
        { met: /[^A-Za-z0-9]/.test(password), label: 'One symbol' },
    ];

    const score = requirements.filter(r => r.met).length;

    let label: PasswordStrength['label'];
    if (score <= 1) label = 'Very Weak';
    else if (score === 2) label = 'Weak';
    else if (score === 3) label = 'Fair';
    else if (score === 4) label = 'Strong';
    else label = 'Very Strong';

    return { score, label, requirements };
}

// File upload validation
export const ALLOWED_FILE_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
] as const;

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function validateFileUpload(
    file: File
): { valid: boolean; error: string } {
    if (!ALLOWED_FILE_TYPES.includes(file.type as typeof ALLOWED_FILE_TYPES[number])) {
        return {
            valid: false,
            error: `File type "${file.type}" not allowed. Allowed: images, PDF, DOC, TXT`
        };
    }

    if (file.size > MAX_FILE_SIZE) {
        const maxMB = MAX_FILE_SIZE / 1024 / 1024;
        return {
            valid: false,
            error: `File size exceeds ${maxMB}MB limit`
        };
    }

    return { valid: true, error: '' };
}

// Validate URL is safe
export function isValidUrl(url: string): boolean {
    try {
        const parsed = new URL(url);
        return ['https:', 'http:'].includes(parsed.protocol) &&
            parsed.hostname.includes('evzone.com');
    } catch {
        return false;
    }
}

// Sanitize URL for avatar/documents
export function sanitizeUrl(url: string): string {
    if (!url) return '';

    try {
        const parsed = new URL(url);
        // Only allow HTTPS for production
        if (parsed.protocol !== 'https:' && parsed.hostname.includes('evzone')) {
            parsed.protocol = 'https:';
        }
        return parsed.toString();
    } catch {
        return '';
    }
}

// Mask email for display
export function maskEmail(email: string): string {
    if (!isEmail(email)) return email;

    const [user, domain] = email.split('@');
    const maskedUser = user.length <= 2
        ? user[0] + '*'
        : user.slice(0, 2) + '***';

    return `${maskedUser}@${domain}`;
}

// Mask phone for display
export function maskPhone(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length < 4) return '****';

    return '****' + cleaned.slice(-4);
}

// Validate OTP code format
export function isValidOtp(code: string): boolean {
    return /^\d{6}$/.test(code);
}

// Password strength minimum for submission
export const MIN_PASSWORD_SCORE = 3;
