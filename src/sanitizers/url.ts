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
            hostname === domain || hostname.endsWith('.' + domain)
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
        if (!['http:', 'https:'].includes(parsed.protocol)) {
            return '';
        }

        const hostname = parsed.hostname;
        const trustedDomains = ['evzone.com', 'evzone.app', 'evzonemarketplace.com'];
        const isEvzone = trustedDomains.some(domain =>
            hostname === domain || hostname.endsWith('.' + domain)
        );

        // Only allow HTTPS for production
        if (parsed.protocol === 'http:' && isEvzone) {
            parsed.protocol = 'https:';
        }
        return parsed.toString();
    } catch {
        // Fallback for relative paths: starts with / but not // or /\ and no directory traversal
        if (url.startsWith('/') && !url.startsWith('//') && !url.startsWith('/\\') && !url.includes('./') && !url.includes('../')) {
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
