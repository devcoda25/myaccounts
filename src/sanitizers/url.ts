/* global URL */

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
        if (!['https:', 'http:'].includes(parsed.protocol)) {
            return false;
        }

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

        // Strict allowlist for protocols to prevent javascript: XSS
        if (!['http:', 'https:'].includes(parsed.protocol)) {
            return '';
        }

        const host = parsed.hostname;
        const isProdDomain = host === 'evzone.com' || host.endsWith('.evzone.com') ||
                             host === 'evzone.app' || host.endsWith('.evzone.app') ||
                             host === 'evzonemarketplace.com' || host.endsWith('.evzonemarketplace.com');

        // Only allow HTTPS for production
        if (parsed.protocol === 'http:' && isProdDomain) {
            parsed.protocol = 'https:';
        }
        return parsed.toString();
    } catch {
        // Fallback for safe relative URLs (needed for functional SSR/components)
        if (url.startsWith('/') && !url.startsWith('//') && !url.includes('../') && !url.includes('./')) {
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
