/* global URL */
/**
 * URL Sanitizer
 * URL validation and sanitization utilities
 */

/**
 * Validate URL is safe and allowed
 */
export function isValidUrl(url: string): boolean {
    try {
        const parsed = new URL(url);
        const isEvzone = parsed.hostname === 'evzone.com' || parsed.hostname.endsWith('.evzone.com');
        return ['https:', 'http:'].includes(parsed.protocol) && isEvzone;
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
        const parsed = new URL(url);

        // Explicitly allowlist only HTTP and HTTPS
        if (!['http:', 'https:'].includes(parsed.protocol)) {
            return '';
        }

        // Only allow HTTPS for production domains
        const isEvzone = parsed.hostname === 'evzone.com' || parsed.hostname.endsWith('.evzone.com');
        if (parsed.protocol === 'http:' && isEvzone) {
            // Re-create as HTTPS instead of mutating protocol on the URL object directly
            parsed.protocol = 'https:'; // mutating http->https is safe, but we'll return a new string just to be explicit
            return parsed.toString();
        }
        return parsed.toString();
    } catch {
        // Fallback for safe relative URLs
        if (url.startsWith('/') && !url.startsWith('//') && !url.startsWith('/\\')) {
            return url;
        }
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
