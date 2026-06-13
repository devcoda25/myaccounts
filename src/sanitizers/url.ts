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
        const host = parsed.hostname;
        return host === 'evzone.com' || host.endsWith('.evzone.com') ||
               host === 'evzone.app' || host.endsWith('.evzone.app') ||
               host === 'evzonemarketplace.com' || host.endsWith('.evzonemarketplace.com');
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
        // Explicitly reject dangerous protocols like javascript:
        if (!['http:', 'https:', 'mailto:', 'tel:'].includes(parsed.protocol)) {
            return '';
        }
        // Only allow HTTPS for production
        if (parsed.protocol === 'http:' && parsed.hostname.includes('evzone')) {
            parsed.protocol = 'https:';
        }
        return parsed.toString();
    } catch {
        // Handle safe relative paths (e.g. /app/dashboard) that new URL() throws on
        if (url.startsWith('/') && !url.startsWith('//') && !url.includes('./') && !url.includes('../')) {
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
