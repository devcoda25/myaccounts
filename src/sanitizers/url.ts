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
        if (!['https:', 'http:'].includes(parsed.protocol)) {
            return false;
        }

        const hostname = parsed.hostname;
        const trustedDomains = ['evzone.com', 'evzone.app', 'evzonemarketplace.com'];

        return trustedDomains.some(domain =>
            hostname === domain || hostname.endsWith(`.${domain}`)
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

    try {
        const parsed = new URL(url);

        if (!['https:', 'http:'].includes(parsed.protocol)) {
            return '';
        }

        // Only allow HTTPS for production
        const hostname = parsed.hostname;
        const isProductionDomain = ['evzone.com', 'evzone.app', 'evzonemarketplace.com'].some(domain =>
            hostname === domain || hostname.endsWith(`.${domain}`)
        );

        if (parsed.protocol !== 'https:' && isProductionDomain) {
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
