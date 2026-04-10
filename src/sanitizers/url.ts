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
        const isSafeProtocol = ['https:', 'http:'].includes(parsed.protocol);
        const isSafeDomain = parsed.hostname === 'evzone.com' ||
                             parsed.hostname.endsWith('.evzone.com') ||
                             parsed.hostname === 'evzone.app' ||
                             parsed.hostname.endsWith('.evzone.app');
        return isSafeProtocol && isSafeDomain;
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

        // Strict protocol allowlist
        if (!['http:', 'https:'].includes(parsed.protocol)) {
            return '';
        }

        // Only allow HTTPS for production domains
        const isEvzoneDomain = parsed.hostname === 'evzone.com' ||
                               parsed.hostname.endsWith('.evzone.com') ||
                               parsed.hostname === 'evzone.app' ||
                               parsed.hostname.endsWith('.evzone.app');

        if (parsed.protocol !== 'https:' && isEvzoneDomain) {
            parsed.protocol = 'https:';
        }
        return parsed.toString();
    } catch {
        // If parsing fails, but it starts with a single / (safe relative path)
        if (url.startsWith('/') && !url.startsWith('//')) {
            return url;
        }
        return '';
    }
}

/**
 * Check if a URL is a safe redirect destination
 * Allows safe relative paths or explicitly validated URLs
 */
export function isSafeRedirect(url: string | null | undefined): boolean {
    if (!url) return false;

    // Allow safe relative paths
    if (url.startsWith('/') && !url.startsWith('//') && !url.startsWith('/\\')) {
        return true;
    }

    return isValidUrl(url);
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
