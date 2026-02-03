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
        return ['https:', 'http:'].includes(parsed.protocol) &&
            parsed.hostname.includes('evzone.com');
    } catch {
        return false;
    }
}

/**
 * Sanitize URL for avatar/documents
 * Ensures HTTPS for production domains
 * Blocks non-http/https protocols (like javascript:)
 * Allows safe relative URLs
 */
export function sanitizeUrl(url: string): string {
    if (!url) return '';

    // Handle relative URLs (must start with / or .)
    // This assumes they are relative to the current origin
    if (url.startsWith('/') || url.startsWith('.')) {
        return url;
    }

    try {
        const parsed = new URL(url);

        // Strict protocol check - block javascript:, vbscript:, data:, etc.
        if (!['http:', 'https:'].includes(parsed.protocol)) {
            return '';
        }

        // Only allow HTTPS for production
        if (parsed.protocol !== 'https:' && parsed.hostname.includes('evzone')) {
            parsed.protocol = 'https:';
        }
        return parsed.toString();
    } catch {
        // If it fails parsing as URL, it might be a relative path without leading /
        // e.g. "foo/bar"
        // But it could also be a malformed URL or a dangerous scheme that URL parser didn't like?
        // To be safe, we check if it looks like it has a protocol
        if (/^[a-zA-Z0-9.+-]+:/.test(url)) {
            // It has a scheme but failed parsing or we just want to be careful
            return '';
        }
        // No scheme, assume relative path
        return url;
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
