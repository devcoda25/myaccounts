/**
 * URL Sanitizer
 * URL validation and sanitization utilities
 */

// URL globals are flagged by ESLint browser config, use inline suppression for parsing
/* global URL */

// Trusted domains allowed for redirect and sanitization
const TRUSTED_DOMAIN_REGEX = /^([a-z0-9-]+\.)*(evzone\.com|evzone\.app|evzonemarketplace\.com)$/i;

/**
 * Validate URL is safe and allowed
 */
export function isValidUrl(url: string): boolean {
    if (!url) return false;

    // Strip whitespace to prevent newline/tab injection
    const cleanUrl = url.replace(/[\n\r\t]/g, '');

    // Allow safe relative paths
    if (cleanUrl.startsWith('/') && !cleanUrl.startsWith('//') && !cleanUrl.startsWith('/\\')) {
        return true;
    }

    try {
        const parsed = new URL(cleanUrl);
        return ['https:', 'http:'].includes(parsed.protocol) &&
            TRUSTED_DOMAIN_REGEX.test(parsed.hostname);
    } catch {
        return false;
    }
}

/**
 * Sanitize URL for avatar/documents
 * Ensures HTTPS for production domains
 */
export function sanitizeUrl(url: string): string {
    if (!url) return '';

    // Strip whitespace to prevent newline/tab injection
    const cleanUrl = url.replace(/[\n\r\t]/g, '');

    try {
        const parsed = new URL(cleanUrl);

        // Strict protocol allowlist for sanitized links
        if (!['https:', 'http:', 'mailto:', 'tel:'].includes(parsed.protocol)) {
            return '';
        }

        // Only allow HTTPS for trusted production domains
        if (parsed.protocol !== 'https:' && TRUSTED_DOMAIN_REGEX.test(parsed.hostname)) {
            parsed.protocol = 'https:';
        }
        return parsed.toString();
    } catch {
        return '';
    }
}

/**
 * Extract hostname from URL safely
 */
export function extractHostname(url: string): string {
    try {
        return new URL(url).hostname;
    } catch {
        return '';
    }
}

/**
 * Check if URL is absolute (has protocol)
 */
export function isAbsoluteUrl(url: string): boolean {
    return /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(url);
}

/**
 * Resolve relative URL against base URL
 */
export function resolveRelativeUrl(baseUrl: string, relativeUrl: string): string {
    try {
        return new URL(relativeUrl, baseUrl).toString();
    } catch {
        return relativeUrl;
    }
}
