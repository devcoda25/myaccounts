/**
 * URL Sanitizer
 * URL validation and sanitization utilities
 */

/**
 * Validate URL is safe and allowed
 */
export function isValidUrl(url: string): boolean {
    if (!url) return false;
    const cleanUrl = url.replace(/[\n\r\t]/g, '');

    if (/^\/(?!\/|\.|\\)/.test(cleanUrl)) {
        return true;
    }

    try {
        const parsed = new URL(cleanUrl);
        if (!['https:', 'http:'].includes(parsed.protocol)) return false;
        return /^([a-z0-9-]+\.)*(evzone\.com|evzone\.app|evzonemarketplace\.com)$/i.test(parsed.hostname);
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
    const cleanUrl = url.replace(/[\n\r\t]/g, '');

    if (/^\/(?!\/|\.|\\)/.test(cleanUrl)) {
        return cleanUrl;
    }

    try {
        const parsed = new URL(cleanUrl);

        // Strict protocol allowlist
        if (!['http:', 'https:', 'mailto:', 'tel:'].includes(parsed.protocol)) {
            return '';
        }

        // Only allow HTTPS for production
        if (parsed.protocol === 'http:' && /^([a-z0-9-]+\.)*(evzone\.com|evzone\.app|evzonemarketplace\.com)$/i.test(parsed.hostname)) {
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
