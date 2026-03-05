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
        // Security: Use exact match or suffix to prevent evzone.com.evil.com bypass
        const isEvzone = parsed.hostname === 'evzone.com' || parsed.hostname.endsWith('.evzone.com');
        return ['https:', 'http:'].includes(parsed.protocol) && isEvzone;
    } catch {
        return false;
    }
}

/**
 * Sanitize URL for avatar/documents
 * Ensures HTTPS for production domains and blocks dangerous protocols
 */
export function sanitizeUrl(url: string): string {
    if (!url) return '';

    try {
        // Handle both relative and absolute URLs
        const parsed = new URL(url, 'http://localhost');

        // Security: Block dangerous protocols (XSS)
        if (!['http:', 'https:'].includes(parsed.protocol)) {
            return '';
        }

        // Only enforce HTTPS for actual production EVzone domains
        if (parsed.protocol === 'http:') {
            const isEvzone = parsed.hostname === 'evzone.com' || parsed.hostname.endsWith('.evzone.com');
            if (isEvzone) {
                parsed.protocol = 'https:';
            }
        }

        // If it was originally a relative URL, return relative
        if (url.startsWith('/')) {
             return parsed.pathname + parsed.search + parsed.hash;
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
