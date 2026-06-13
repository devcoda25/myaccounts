/**
 * URL Sanitizer
 * URL validation and sanitization utilities
 */

/**
 * Validate if hostname is a trusted EVzone domain
 */
function isTrustedDomain(hostname: string): boolean {
    const trustedDomains = ['evzone.com', 'evzone.app'];
    return trustedDomains.some(domain =>
        hostname === domain || hostname.endsWith(`.${domain}`)
    );
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
 * Ensures HTTPS for production domains and rejects unsafe protocols
 */
export function sanitizeUrl(url: string): string {
    if (!url) return '';

    try {
        const parsed = new URL(url);

        // Explicitly block dangerous non-HTTP/HTTPS protocols
        if (!['https:', 'http:'].includes(parsed.protocol)) {
            return '';
        }

        // Only allow HTTPS for production
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
