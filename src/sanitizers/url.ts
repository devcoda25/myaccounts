/* global URL */
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
        const allowedDomains = ['evzone.com', 'evzone.app', 'evzonemarketplace.com'];
        const isAllowedDomain = allowedDomains.some(domain =>
            parsed.hostname === domain || parsed.hostname.endsWith(`.${domain}`)
        );
        return ['https:', 'http:'].includes(parsed.protocol) && isAllowedDomain;
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
        // Explicit allowlist to prevent javascript: or other malicious schemas
        if (!['http:', 'https:'].includes(parsed.protocol)) {
            return '';
        }

        // Only allow HTTPS for production
        if (parsed.protocol !== 'https:' && parsed.hostname.includes('evzone')) {
            parsed.protocol = 'https:';
        }
        return parsed.toString();
    } catch {
        // Fallback for safe relative URLs
        if (
            url.startsWith('/') &&
            !url.startsWith('//') &&
            !url.startsWith('/\\') &&
            !url.includes('./') &&
            !url.includes('../')
        ) {
            return url;
        }
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
