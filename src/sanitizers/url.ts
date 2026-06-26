/**
 * URL Sanitizer
 * URL validation and sanitization utilities
 */

/* global URL */

const ALLOWED_DOMAINS_REGEX = /^([a-z0-9-]+\.)*(evzone\.com|evzone\.app|evzonemarketplace\.com)$/i;

/**
 * Validate URL is safe and allowed
 */
export function isValidUrl(url: string): boolean {
    if (!url) return false;
    const cleanUrl = url.replace(/[\n\r\t]/g, '');

    if (cleanUrl.startsWith('/') && !cleanUrl.startsWith('//') && !cleanUrl.startsWith('/\\')) {
        return true;
    }

    try {
        const parsed = new URL(cleanUrl);
        return ['https:', 'http:'].includes(parsed.protocol) &&
            ALLOWED_DOMAINS_REGEX.test(parsed.hostname);
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
    const cleanUrl = url.replace(/[\n\r\t]/g, '');

    if (cleanUrl.startsWith('/') && !cleanUrl.startsWith('//') && !cleanUrl.startsWith('/\\')) {
        return cleanUrl;
    }

    try {
        const parsed = new URL(cleanUrl);

        if (!['https:', 'http:', 'mailto:', 'tel:'].includes(parsed.protocol)) {
            return '';
        }

        if (parsed.protocol === 'http:' && ALLOWED_DOMAINS_REGEX.test(parsed.hostname)) {
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
