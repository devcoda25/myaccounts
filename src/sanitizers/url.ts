/**
 * URL Sanitizer
 * URL validation and sanitization utilities
 */

/**
 * Validate URL is safe and allowed
 */
export function isValidUrl(url: string): boolean {
    if (!url) return false;

    // Strip whitespaces to prevent newline/tab injection bypasses
    const cleanUrl = url.replace(/[\n\r\t]/g, '').trim();

    // Allow safe relative paths, hashes, and queries to preserve client-side routing
    if (
        (cleanUrl.startsWith('/') && !cleanUrl.startsWith('//') && !cleanUrl.startsWith('/\\')) ||
        cleanUrl.startsWith('#') ||
        cleanUrl.startsWith('?')
    ) {
        return true;
    }

    try {
        const parsed = new URL(cleanUrl);
        // Enforce protocol allowlist before hostname evaluation
        if (!['https:', 'http:'].includes(parsed.protocol)) {
            return false;
        }
        // Prevent SSRF/Open Redirect by enforcing strict hostname match or subdomain suffix
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

    // Strip whitespaces to prevent newline/tab injection bypasses
    const cleanUrl = url.replace(/[\n\r\t]/g, '').trim();

    // Allow safe relative paths, hashes, and queries to preserve client-side routing
    if (
        (cleanUrl.startsWith('/') && !cleanUrl.startsWith('//') && !cleanUrl.startsWith('/\\')) ||
        cleanUrl.startsWith('#') ||
        cleanUrl.startsWith('?')
    ) {
        return cleanUrl;
    }

    try {
        const parsed = new URL(cleanUrl);
        // Enforce protocol allowlist before hostname evaluation
        if (!['http:', 'https:', 'mailto:', 'tel:'].includes(parsed.protocol)) {
            return '';
        }

        // Only allow HTTPS for production domains using strict matching
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
