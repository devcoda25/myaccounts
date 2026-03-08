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
        const isAllowedProtocol = ['https:', 'http:'].includes(parsed.protocol);
        const isAllowedDomain = parsed.hostname === 'evzone.com' ||
                              parsed.hostname.endsWith('.evzone.com') ||
                              parsed.hostname === 'evzone.app' ||
                              parsed.hostname.endsWith('.evzone.app');

        return isAllowedProtocol && isAllowedDomain;
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

        // 🚨 SECURITY: Prevent XSS by blocking dangerous protocols
        if (['javascript:', 'data:', 'vbscript:', 'file:'].includes(parsed.protocol)) {
            return '';
        }

        // Only allow HTTPS for production domains
        const isEvzoneDomain = parsed.hostname.includes('evzone.com') || parsed.hostname.includes('evzone.app');
        if (parsed.protocol !== 'https:' && isEvzoneDomain) {
            parsed.protocol = 'https:';
        }
        return parsed.toString();
    } catch {
        // If it's a relative path it might throw, but it shouldn't contain dangerous protocols
        // Return empty string to be strictly safe as the original implementation did
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
