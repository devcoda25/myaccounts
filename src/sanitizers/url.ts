/**
 * URL Sanitizer
 * URL validation and sanitization utilities
 */

/**
 * Validate URL is safe and allowed
 */
export function isValidUrl(url: string): boolean {
    try {
        // Explicitly strip whitespace, enforce protocol allowlist, and strictly match hostname to prevent bypasses
        const cleanUrl = url.replace(/[\n\r\t]/g, '').trim();
        const parsed = new URL(cleanUrl);
        return ['https:', 'http:'].includes(parsed.protocol) &&
            (parsed.hostname === 'evzone.com' || parsed.hostname.endsWith('.evzone.com'));
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
        // Strip whitespace, enforce protocol allowlist, and strictly match hostname
        const cleanUrl = url.replace(/[\n\r\t]/g, '').trim();
        const parsed = new URL(cleanUrl);

        if (!['https:', 'http:'].includes(parsed.protocol)) {
            return '';
        }

        // Only allow HTTPS for production
        if (parsed.protocol !== 'https:' && (parsed.hostname === 'evzone.com' || parsed.hostname.endsWith('.evzone.com'))) {
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
        // Strip whitespace and enforce protocol allowlist before extracting hostname
        const cleanUrl = url.replace(/[\n\r\t]/g, '').trim();
        const parsed = new URL(cleanUrl);

        if (!['https:', 'http:'].includes(parsed.protocol)) {
            return '';
        }

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
        return new URL(relativeUrl, baseUrl).toString();
    } catch {
        return relativeUrl;
    }
}
