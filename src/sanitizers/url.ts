/**
 * URL Sanitizer
 * URL validation and sanitization utilities
 */

/**
 * Validate URL is safe and allowed
 */
export function isValidUrl(url: string): boolean {
    if (url.startsWith('/') && !url.startsWith('//')) return true;
    try {
        const parsed = new URL(url);
        if (!['https:', 'http:'].includes(parsed.protocol)) return false;

        const trustedDomains = ['evzone.com', 'evzone.app'];
        return trustedDomains.some(domain =>
            parsed.hostname === domain || parsed.hostname.endsWith(`.${domain}`)
        );
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
    if (url.startsWith('/') && !url.startsWith('//')) return url;

    try {
        const parsed = new URL(url);

        // Reject unsafe protocols immediately
        if (!['https:', 'http:'].includes(parsed.protocol)) {
            return '';
        }

        const trustedDomains = ['evzone.com', 'evzone.app'];
        const isTrustedDomain = trustedDomains.some(domain =>
            parsed.hostname === domain || parsed.hostname.endsWith(`.${domain}`)
        );

        // Enforce HTTPS for trusted domains
        if (parsed.protocol !== 'https:' && isTrustedDomain) {
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
