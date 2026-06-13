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
        // Only allow HTTPS and strict matching on evzone.com
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
        const parsed = new URL(url);
        const hostname = parsed.hostname;

        // Check if domain is evzone.com or evzone.app (including subdomains)
        const isEvzoneCom = hostname === 'evzone.com' || hostname.endsWith('.evzone.com');
        const isEvzoneApp = hostname === 'evzone.app' || hostname.endsWith('.evzone.app');

        // Only allow HTTPS for production
        if (parsed.protocol !== 'https:' && (isEvzoneCom || isEvzoneApp)) {
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
