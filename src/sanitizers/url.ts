/**
 * URL Sanitizer
 * URL validation and sanitization utilities
 */

/**
 * Validate URL is safe and allowed
 */
export function isValidUrl(url: string): boolean {
    if (!url) return false;

    // Strip whitespace to prevent injection bypasses
    const cleanUrl = url.replace(/[\n\r\t]/g, '').trim();

    // Allow safe relative paths for legitimate client-side routing
    if (cleanUrl.startsWith('/') && !cleanUrl.startsWith('//') && !cleanUrl.startsWith('/\\')) {
        return true;
    }

    try {
        const parsed = new URL(cleanUrl);
        // Enforce strict protocol allowlist and exact domain matching to prevent SSRF/Open Redirects
        return ['https:', 'http:'].includes(parsed.protocol) &&
            (parsed.hostname === 'evzone.com' || parsed.hostname.endsWith('.evzone.com'));
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

    if (cleanUrl.startsWith('/') && !cleanUrl.startsWith('//') && !cleanUrl.startsWith('/\\')) {
        return cleanUrl;
    }

    try {
        const parsed = new URL(cleanUrl);
        // Enforce a broader protocol allowlist, explicitly rejecting javascript: or data:
        if (!['http:', 'https:', 'mailto:', 'tel:'].includes(parsed.protocol)) {
            return '';
        }

        // Only allow HTTPS for production domains
        if (parsed.protocol === 'http:' && (parsed.hostname === 'evzone.com' || parsed.hostname.endsWith('.evzone.com') || parsed.hostname.includes('evzone'))) {
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
