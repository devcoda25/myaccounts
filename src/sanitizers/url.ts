/**
 * URL Sanitizer
 * URL validation and sanitization utilities
 */

/**
 * Validate URL is safe and allowed
 */
export function isValidUrl(url: string): boolean {
    try {
        const cleanUrl = url.replace(/[\n\r\t]/g, '').trim();
        // eslint-disable-next-line no-undef
        const parsed = new URL(cleanUrl);
        return ['https:', 'http:'].includes(parsed.protocol) &&
            parsed.hostname.includes('evzone.com');
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

    try {
        const cleanUrl = url.replace(/[\n\r\t]/g, '').trim();
        // eslint-disable-next-line no-undef
        const parsed = new URL(cleanUrl);
        if (!['http:', 'https:'].includes(parsed.protocol)) return '';
        // Only allow HTTPS for production
        if (parsed.protocol !== 'https:' && parsed.hostname.includes('evzone')) {
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
        const cleanUrl = url.replace(/[\n\r\t]/g, '').trim();
        // eslint-disable-next-line no-undef
        const parsed = new URL(cleanUrl);
        if (!['http:', 'https:'].includes(parsed.protocol)) return '';
        return parsed.hostname;
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
        const cleanUrl = relativeUrl.replace(/[\n\r\t]/g, '').trim();
        // eslint-disable-next-line no-undef
        const parsed = new URL(cleanUrl, baseUrl);
        if (!['http:', 'https:'].includes(parsed.protocol)) return baseUrl;
        return parsed.toString();
    } catch {
        return relativeUrl;
    }
}
