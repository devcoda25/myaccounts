/**
 * URL Sanitizer
 * URL validation and sanitization utilities
 */

/**
 * Validate URL is safe and allowed
 */
export function isValidUrl(url: string): boolean {
    if (!url) return false;
    try {
        const cleanUrl = url.replace(/[\n\r\t]/g, '').trim();
        if (
            (cleanUrl.startsWith('/') && !cleanUrl.startsWith('//') && !cleanUrl.startsWith('/\\')) ||
            cleanUrl.startsWith('#') ||
            cleanUrl.startsWith('?')
        ) {
            return true; // Allow safe relative URLs
        }
        // eslint-disable-next-line no-undef
        const parsed = new URL(cleanUrl);
        const allowedProtocols = ['https:', 'http:'];
        if (!allowedProtocols.includes(parsed.protocol)) {
            return false;
        }
        return parsed.hostname === 'evzone.com' || parsed.hostname.endsWith('.evzone.com');
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
        const cleanUrl = url.replace(/[\n\r\t]/g, '').trim();
        if (
            (cleanUrl.startsWith('/') && !cleanUrl.startsWith('//') && !cleanUrl.startsWith('/\\')) ||
            cleanUrl.startsWith('#') ||
            cleanUrl.startsWith('?')
        ) {
            return cleanUrl;
        }
        // eslint-disable-next-line no-undef
        const parsed = new URL(cleanUrl);
        const allowedProtocols = ['https:', 'http:', 'mailto:', 'tel:'];
        if (!allowedProtocols.includes(parsed.protocol)) {
            return '';
        }
        // Only allow HTTPS for production
        if (parsed.protocol !== 'https:' && (parsed.hostname === 'evzone.com' || parsed.hostname.endsWith('.evzone.com'))) {
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
        const cleanUrl = url.replace(/[\n\r\t]/g, '').trim();
        // eslint-disable-next-line no-undef
        return new URL(cleanUrl).hostname;
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
