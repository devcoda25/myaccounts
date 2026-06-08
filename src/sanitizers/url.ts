/**
 * URL Sanitizer
 * URL validation and sanitization utilities
 */

/**
 * Validate URL is safe and allowed
 */
export function isValidUrl(url: string): boolean {
    try {
        // Prevent parsing bypasses
        const cleanUrl = url.replace(/[\n\r\t]/g, '');
        const parsed = new URL(cleanUrl);
        // Strict domain regex to prevent SSRF and Open Redirect bypasses via malicious subdomains
        const domainRegex = /^([a-z0-9-]+\.)*(evzone\.com|evzone\.app|evzonemarketplace\.com)$/i;
        return ['https:', 'http:'].includes(parsed.protocol) &&
            domainRegex.test(parsed.hostname);
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
        const cleanUrl = url.replace(/[\n\r\t]/g, '');
        const parsed = new URL(cleanUrl);
        const domainRegex = /^([a-z0-9-]+\.)*(evzone\.com|evzone\.app|evzonemarketplace\.com)$/i;
        // Only allow HTTPS for production
        if (parsed.protocol !== 'https:' && domainRegex.test(parsed.hostname)) {
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
