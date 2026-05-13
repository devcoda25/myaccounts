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
        const allowedDomains = /^([a-z0-9-]+\.)*(evzone\.com|evzone\.app|evzonemarketplace\.com)$/i;
        return ['https:', 'http:'].includes(parsed.protocol) &&
            allowedDomains.test(parsed.hostname);
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
        const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:'];
        if (!allowedProtocols.includes(parsed.protocol)) {
            return '';
        }
        // Only allow HTTPS for production
        if (parsed.protocol === 'http:' && parsed.hostname.includes('evzone')) {
            parsed.protocol = 'https:';
        }
        return parsed.toString();
    } catch {
        // Fallback for safe relative URLs
        if (url.startsWith('/') && !url.startsWith('//') && !url.startsWith('./') && !url.startsWith('../')) {
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
