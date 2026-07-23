/**
 * URL Sanitizer
 * URL validation and sanitization utilities
 */

/**
 * Validate URL is safe and allowed
 */
export function isValidUrl(url: string): boolean {
    if (!url) return false;

    // Remove whitespace to prevent bypasses
    const cleanUrl = url.replace(/[\n\r\t]/g, '').trim();

    // Allow safe relative paths
    if (cleanUrl.startsWith('/') && !cleanUrl.startsWith('//') && !cleanUrl.startsWith('/\\')) {
        return true;
    }

    try {
        const parsed = new URL(cleanUrl);
        const validProtocol = ['https:', 'http:'].includes(parsed.protocol);
        const validHost = parsed.hostname === 'evzone.com' || parsed.hostname.endsWith('.evzone.com');
        return validProtocol && validHost;
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

    // Remove whitespace to prevent bypasses
    const cleanUrl = url.replace(/[\n\r\t]/g, '').trim();

    // Allow safe relative paths
    if (cleanUrl.startsWith('/') && !cleanUrl.startsWith('//') && !cleanUrl.startsWith('/\\')) {
        return cleanUrl;
    }

    try {
        const parsed = new URL(cleanUrl);

        // Strict protocol allowlist
        if (!['https:', 'http:', 'mailto:', 'tel:'].includes(parsed.protocol)) {
            return '';
        }

        const isEvzoneHost = parsed.hostname === 'evzone.com' || parsed.hostname.endsWith('.evzone.com');

        // Only allow HTTPS for production domains
        if (parsed.protocol !== 'https:' && isEvzoneHost) {
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
