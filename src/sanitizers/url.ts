/**
 * URL Sanitizer
 * URL validation and sanitization utilities
 */

/**
 * Check if a hostname belongs to trusted ecosystem domains
 */
function isTrustedDomain(hostname: string): boolean {
    return hostname === 'evzone.com' || hostname.endsWith('.evzone.com') ||
           hostname === 'evzone.app' || hostname.endsWith('.evzone.app');
}

/**
 * Validate URL is safe and allowed
 */
export function isValidUrl(url: string): boolean {
    try {
        const parsed = new URL(url);
        return ['https:', 'http:'].includes(parsed.protocol) &&
            isTrustedDomain(parsed.hostname);
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

        // Reject unapproved protocols (e.g. javascript:, data:, etc)
        if (!['https:', 'http:'].includes(parsed.protocol)) {
            return '';
        }

        // Ensure HTTPS for trusted domains
        if (parsed.protocol !== 'https:' && isTrustedDomain(parsed.hostname)) {
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
