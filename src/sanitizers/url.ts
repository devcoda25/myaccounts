/**
 * URL Sanitizer
 * URL validation and sanitization utilities
 */

/**
 * Validate URL is safe and allowed
 */
export function isValidUrl(url: string): boolean {
    try {
        // eslint-disable-next-line no-undef
        const parsed = new URL(url);
        return ['https:', 'http:'].includes(parsed.protocol) &&
            /^([a-z0-9-]+\.)*(evzone\.com|evzone\.app|evzonemarketplace\.com)$/i.test(parsed.hostname);
    } catch {
        // Allow safe relative paths
        if (url.startsWith('/') && !url.startsWith('//') && !url.startsWith('/\\')) {
            return true;
        }
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
        // eslint-disable-next-line no-undef
        const parsed = new URL(url);

        // Explicitly check allowlist of safe protocols
        const safeProtocols = ['http:', 'https:', 'mailto:', 'tel:'];
        if (!safeProtocols.includes(parsed.protocol)) {
            return '';
        }

        // Only allow HTTPS for production
        if (parsed.protocol !== 'https:' && /^([a-z0-9-]+\.)*(evzone\.com|evzone\.app|evzonemarketplace\.com)$/i.test(parsed.hostname)) {
            parsed.protocol = 'https:';
        }
        return parsed.toString();
    } catch {
        // Catch block handles relative paths, validate them securely
        if (url.startsWith('/') && !url.startsWith('//') && !url.startsWith('/\\')) {
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
        // eslint-disable-next-line no-undef
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
        // eslint-disable-next-line no-undef
        return new URL(relativeUrl, baseUrl).toString();
    } catch {
        return relativeUrl;
    }
}
