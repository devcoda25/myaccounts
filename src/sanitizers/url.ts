/**
 * URL Sanitizer
 * URL validation and sanitization utilities
 */
/* global URL */

// Allowed domains for trusted redirects
const TRUSTED_DOMAINS = /^([a-z0-9-]+\.)*(evzone\.com|evzone\.app|evzonemarketplace\.com)$/i;

/**
 * Validate URL is safe and allowed
 */
export function isValidUrl(url: string): boolean {
    if (!url) return false;
    // Prevent javascript: protocol injection via newline/tab bytes
    const cleanUrl = url.replace(/[\n\r\t]/g, '');
    try {
        const parsed = new URL(cleanUrl);
        return ['https:', 'http:'].includes(parsed.protocol) &&
            TRUSTED_DOMAINS.test(parsed.hostname);
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
    // Prevent javascript: protocol injection via newline/tab bytes
    const cleanUrl = url.replace(/[\n\r\t]/g, '');

    // Allow internal relative routes
    if (cleanUrl.startsWith('/') && !cleanUrl.startsWith('//') && !cleanUrl.startsWith('/\\')) {
        return cleanUrl;
    }

    try {
        const parsed = new URL(cleanUrl);

        // Strict protocol validation
        if (!['http:', 'https:', 'mailto:', 'tel:'].includes(parsed.protocol)) {
            return '';
        }

        // Only allow HTTPS for production
        if (parsed.protocol === 'http:' && TRUSTED_DOMAINS.test(parsed.hostname)) {
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
