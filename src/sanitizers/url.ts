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
    if (url.startsWith('/') && !url.startsWith('//') && !url.startsWith('/\\')) {
        return true;
    }

    try {
        /* global URL */
        const parsed = new URL(url);

        // Strict protocol allowlist
        if (!['https:', 'http:'].includes(parsed.protocol)) {
            return false;
        }

        // Strict domain regex matching
        const domainRegex = /^([a-z0-9-]+\.)*(evzone\.com|evzone\.app|evzonemarketplace\.com)$/i;
        return domainRegex.test(parsed.hostname);
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

    // Allow safe relative paths
    if (url.startsWith('/') && !url.startsWith('//') && !url.startsWith('/\\')) {
        return url;
    }

    try {
        /* global URL */
        const parsed = new URL(url);

        // Protocol allowlist
        if (!['https:', 'http:', 'mailto:', 'tel:'].includes(parsed.protocol)) {
            return '';
        }

        const domainRegex = /^([a-z0-9-]+\.)*(evzone\.com|evzone\.app|evzonemarketplace\.com)$/i;

        // Only allow HTTPS for production domains
        if (parsed.protocol === 'http:' && domainRegex.test(parsed.hostname)) {
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
