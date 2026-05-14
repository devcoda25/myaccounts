/**
 * URL Sanitizer
 * URL validation and sanitization utilities
 */

/**
 * Helper to check if a hostname belongs to an allowed domain
 */
function isAllowedDomain(hostname: string): boolean {
    return hostname === 'evzone.com' || hostname.endsWith('.evzone.com') ||
           hostname === 'evzone.app' || hostname.endsWith('.evzone.app');
}

/**
 * Validate URL is safe and allowed
 */
export function isValidUrl(url: string): boolean {
    try {
        const parsed = new URL(url);
        return ['https:', 'http:'].includes(parsed.protocol) && isAllowedDomain(parsed.hostname);
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

        // Explicitly allow only http: and https: protocols
        if (!['https:', 'http:'].includes(parsed.protocol)) {
            return '';
        }

        // Only allow HTTPS for production
        if (parsed.protocol === 'http:' && isAllowedDomain(parsed.hostname)) {
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
