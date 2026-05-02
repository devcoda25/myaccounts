/**
 * URL Sanitizer
 * URL validation and sanitization utilities
 */

const TRUSTED_DOMAINS = ['evzone.com', 'evzone.app', 'evzonemarketplace.com'];

function isTrustedHostname(hostname: string): boolean {
    const lowerHost = hostname.toLowerCase();
    return TRUSTED_DOMAINS.some(domain =>
        lowerHost === domain || lowerHost.endsWith('.' + domain)
    );
}

/**
 * Validate URL is safe and allowed
 */
export function isValidUrl(url: string): boolean {
    try {
        const parsed = new URL(url);
        return ['https:', 'http:'].includes(parsed.protocol) && isTrustedHostname(parsed.hostname);
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

        // Only allow HTTP and HTTPS protocols to prevent XSS (e.g. javascript:)
        if (!['https:', 'http:'].includes(parsed.protocol)) {
            return '';
        }

        // Only allow HTTPS for production
        if (parsed.protocol === 'http:' && isTrustedHostname(parsed.hostname)) {
            parsed.protocol = 'https:';
        }
        return parsed.toString();
    } catch {
        // Fallback for relative URLs (only allow safe paths, prevent traversal and absolute paths)
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
