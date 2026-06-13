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
        if (!['https:', 'http:'].includes(parsed.protocol)) return false;

        const hostname = parsed.hostname;
        // Trusted ecosystem domains
        const allowedDomains = ['evzone.com', 'evzone.app', 'evzonemarketplace.com'];
        // Strict suffix or exact match, not .includes() which is vulnerable to attacker.com bypass
        return allowedDomains.some(domain =>
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
        // Explicitly reject unapproved protocols (like javascript:)
        if (!['https:', 'http:'].includes(parsed.protocol)) {
            return '';
        }

        const hostname = parsed.hostname;
        const isEvzone = ['evzone.com', 'evzone.app', 'evzonemarketplace.com'].some(domain =>
            hostname === domain || hostname.endsWith('.' + domain)
        );

        // Only allow HTTPS for production
        if (parsed.protocol === 'http:' && isEvzone) {
            parsed.protocol = 'https:';
        }
        return parsed.toString();
    } catch {
        // Fallback for safe relative paths, preventing XSS/Open Redirect
        if (url.startsWith('/') && !url.startsWith('//') && !url.startsWith('/\\')) {
            const pathPart = url.split('?')[0].split('#')[0];
            if (!pathPart.includes('../') && !pathPart.includes('./')) {
                return url;
            }
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
