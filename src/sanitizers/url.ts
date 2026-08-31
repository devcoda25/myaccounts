/**
 * URL Sanitizer
 * URL validation and sanitization utilities
 */

/**
 * Validate URL is safe and allowed
 */
export function isValidUrl(url: string): boolean {
    if (!url) return false;

    // Always strip whitespace characters first
    url = url.replace(/[\n\r\t]/g, '').trim();

    try {
        const parsed = new URL(url);

        // Strict protocol allowlist
        if (!['https:', 'http:'].includes(parsed.protocol)) {
            return false;
        }

        // Strict hostname validation
        return parsed.hostname === 'evzone.com' || parsed.hostname.endsWith('.evzone.com');
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

    // Always strip whitespace characters first
    url = url.replace(/[\n\r\t]/g, '').trim();

    // Allow safe relative paths
    if (url.startsWith('/') && !url.startsWith('//') && !url.startsWith('/\\') || url.startsWith('?') || url.startsWith('#')) {
        return url;
    }

    try {
        const parsed = new URL(url);

        // Protocol allowlist
        if (!['http:', 'https:', 'mailto:', 'tel:'].includes(parsed.protocol)) {
            return '';
        }

        // Only allow HTTPS for production
        if (parsed.protocol === 'http:' && (parsed.hostname === 'evzone.com' || parsed.hostname.endsWith('.evzone.com'))) {
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
