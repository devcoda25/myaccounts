/**
 * URL Sanitizer
 * URL validation and sanitization utilities
 */

/**
 * Validate URL is safe and allowed
 */
export function isValidUrl(url: string): boolean {
    if (!url) return false;

    // Strip whitespace to prevent newline/tab injection bypasses
    const cleanUrl = url.replace(/[\n\r\t]/g, '').trim();

    try {
        const parsed = new URL(cleanUrl);
        // Enforce strict protocol allowlist and exact hostname match to prevent SSRF
        const isSafeProtocol = ['https:', 'http:'].includes(parsed.protocol);
        const isSafeHostname = parsed.hostname === 'evzone.com' || parsed.hostname.endsWith('.evzone.com');
        return isSafeProtocol && isSafeHostname;
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

    // Strip whitespace to prevent newline/tab injection bypasses
    const cleanUrl = url.replace(/[\n\r\t]/g, '').trim();

    try {
        const parsed = new URL(cleanUrl);

        // Only allow secure and standard protocols
        if (!['http:', 'https:', 'mailto:', 'tel:'].includes(parsed.protocol)) {
            return '';
        }

        // Only allow HTTPS for production domains
        const isEvzoneHostname = parsed.hostname === 'evzone.com' || parsed.hostname.endsWith('.evzone.com');
        if (parsed.protocol === 'http:' && isEvzoneHostname) {
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
