/**
 * URL Sanitizer
 * URL validation and sanitization utilities
 */

const TRUSTED_DOMAINS = ['evzone.com', 'evzonemarketplace.com', 'evzone.app'];

function isTrustedDomain(hostname: string): boolean {
    return TRUSTED_DOMAINS.some(
        domain => hostname === domain || hostname.endsWith('.' + domain)
    );
}

/**
 * Validate URL is safe and allowed
 */
export function isValidUrl(url: string): boolean {
    try {
        // eslint-disable-next-line no-undef
        const parsed = new URL(url);
        if (!['https:', 'http:'].includes(parsed.protocol)) {
            return false;
        }
        return isTrustedDomain(parsed.hostname);
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
        // eslint-disable-next-line no-undef
        const parsed = new URL(url);
        if (!['http:', 'https:'].includes(parsed.protocol)) {
            return ''; // Reject invalid schemas like javascript: or data:
        }

        // Only allow HTTPS for production trusted domains
        if (parsed.protocol === 'http:' && isTrustedDomain(parsed.hostname)) {
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
        // eslint-disable-next-line no-undef
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
        // eslint-disable-next-line no-undef
        return new URL(relativeUrl, baseUrl).toString();
    } catch {
        return relativeUrl;
    }
}
