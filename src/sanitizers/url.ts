/**
 * URL Sanitizer
 * URL validation and sanitization utilities
 */

/**
 * Check if a hostname belongs to EVzone ecosystem
 */
const isEVzoneEcosystem = (hostname: string) => {
    return hostname === 'evzone.com' || hostname.endsWith('.evzone.com') ||
           hostname === 'evzone.app' || hostname.endsWith('.evzone.app');
};

/**
 * Validate URL is safe and allowed
 */
export function isValidUrl(url: string): boolean {
    try {
        // eslint-disable-next-line no-undef
        const parsed = new URL(url);
        return ['https:', 'http:'].includes(parsed.protocol) &&
            isEVzoneEcosystem(parsed.hostname);
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

        // Explicitly only allow safe protocols
        if (!['https:', 'http:'].includes(parsed.protocol)) {
            return '';
        }

        // Only allow HTTPS for production EVzone domains
        if (parsed.protocol === 'http:' && isEVzoneEcosystem(parsed.hostname)) {
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
