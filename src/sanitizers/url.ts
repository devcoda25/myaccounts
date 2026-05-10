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
        const allowedProtocols = ['https:', 'http:'];
        if (!allowedProtocols.includes(parsed.protocol)) {
            return false;
        }

        const h = parsed.hostname.toLowerCase();
        return h === 'evzone.com' || h.endsWith('.evzone.com') ||
               h === 'evzone.app' || h.endsWith('.evzone.app') ||
               h === 'evzonemarketplace.com' || h.endsWith('.evzonemarketplace.com');
    } catch {
        // If it throws, it might be a relative path.
        // For isValidUrl, we usually validate absolute URLs for redirects.
        // If relative paths are considered valid, we'd need to explicitly check and allow them.
        // Assuming strict absolute validation here.
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

        // Allowed protocols list
        const allowedProtocols = ['http:', 'https:'];
        if (!allowedProtocols.includes(parsed.protocol)) {
            // Unsafe protocol (e.g. javascript:, data:, etc)
            return '';
        }

        // Only allow HTTPS for production domains
        if (parsed.protocol !== 'https:' && parsed.hostname.includes('evzone')) {
            parsed.protocol = 'https:';
        }
        return parsed.toString();
    } catch {
        // Handle relative URLs
        // Disallow protocol-relative URLs (e.g., //attacker.com)
        if (url.startsWith('/') && !url.startsWith('//')) {
            return url;
        }
        // Fallback for safe simple strings or invalid URLs
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
