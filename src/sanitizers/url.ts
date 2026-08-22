/**
 * URL Sanitizer
 * URL validation and sanitization utilities
 */

/**
 * Validate URL is safe and allowed
 */
export function isValidUrl(url: string): boolean {
    if (!url) return false;

    // Allow safe relative paths
    const cleanUrl = url.replace(/[\n\r\t]/g, '').trim();
    if (cleanUrl.startsWith('/') || cleanUrl.startsWith('?') || cleanUrl.startsWith('#')) {
        return !cleanUrl.startsWith('//') && !cleanUrl.startsWith('/\\');
    }

    try {
        // eslint-disable-next-line no-undef
        const parsed = new URL(cleanUrl);
        const isValidProtocol = ['https:', 'http:'].includes(parsed.protocol);
        const isValidHostname = parsed.hostname === 'evzone.com' || parsed.hostname.endsWith('.evzone.com');
        return isValidProtocol && isValidHostname;
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

    const cleanUrl = url.replace(/[\n\r\t]/g, '').trim();
    if (cleanUrl.startsWith('/') || cleanUrl.startsWith('?') || cleanUrl.startsWith('#')) {
        if (cleanUrl.startsWith('//') || cleanUrl.startsWith('/\\')) return '';
        return cleanUrl;
    }

    try {
        // eslint-disable-next-line no-undef
        const parsed = new URL(cleanUrl);

        // Only allow specific protocols
        if (!['http:', 'https:', 'mailto:', 'tel:'].includes(parsed.protocol)) {
            return '';
        }

        // Only allow HTTPS for production
        const isEvzoneDomain = parsed.hostname === 'evzone.com' || parsed.hostname.endsWith('.evzone.com');
        if (parsed.protocol !== 'https:' && isEvzoneDomain) {
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
    return /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(url.replace(/[\n\r\t]/g, '').trim());
}

/**
 * Resolve relative URL against base URL
 */
export function resolveRelativeUrl(baseUrl: string, relativeUrl: string): string {
    try {
        const cleanBase = baseUrl.replace(/[\n\r\t]/g, '').trim();
        const cleanRelative = relativeUrl.replace(/[\n\r\t]/g, '').trim();
        // eslint-disable-next-line no-undef
        return new URL(cleanRelative, cleanBase).toString();
    } catch {
        return relativeUrl.replace(/[\n\r\t]/g, '').trim();
    }
}
