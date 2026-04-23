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
        const host = parsed.hostname;
        const validProtocol = ['https:', 'http:'].includes(parsed.protocol);
        const isEvzone = host === 'evzone.com' || host.endsWith('.evzone.com') ||
                         host === 'evzone.app' || host.endsWith('.evzone.app');
        return validProtocol && isEvzone;
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

        // Explicitly reject unsupported protocols to prevent XSS (e.g. javascript:)
        if (!['https:', 'http:'].includes(parsed.protocol)) {
            return '';
        }

        const host = parsed.hostname;
        const isEvzone = host === 'evzone.com' || host.endsWith('.evzone.com') ||
                         host === 'evzone.app' || host.endsWith('.evzone.app');

        // Only allow HTTPS for production
        if (parsed.protocol !== 'https:' && isEvzone) {
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
