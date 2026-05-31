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
        const domainRegex = /^([a-z0-9-]+\.)*(evzone\.com|evzone\.app|evzonemarketplace\.com)$/i;
        return ['https:', 'http:'].includes(parsed.protocol) && domainRegex.test(parsed.hostname);
    } catch {
        // Allow safe relative paths (strip whitespace first to prevent /\n/ bypass)
        const stripped = url.replace(/[\n\r\t]/g, '');
        return /^\/(?!\/|\.|\\)/.test(stripped);
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
        if (!['http:', 'https:', 'mailto:', 'tel:'].includes(parsed.protocol)) {
            return '';
        }
        const domainRegex = /^([a-z0-9-]+\.)*(evzone\.com|evzone\.app|evzonemarketplace\.com)$/i;
        // Only allow HTTPS for production domains
        if (parsed.protocol === 'http:' && domainRegex.test(parsed.hostname)) {
            parsed.protocol = 'https:';
        }
        return parsed.toString();
    } catch {
        const stripped = url.replace(/[\n\r\t]/g, '');
        if (/^\/(?!\/|\.|\\)/.test(stripped)) {
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
