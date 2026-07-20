/**
 * URL Sanitizer
 * URL validation and sanitization utilities
 */

/**
 * Validate URL is safe and allowed
 */
export function isValidUrl(url: string): boolean {
    if (!url) return false;
    const cleanUrl = url.replace(/[\n\r\t]/g, '').trim();

    // Allow safe relative URLs
    if (cleanUrl.startsWith('/') && !cleanUrl.startsWith('//') && !cleanUrl.startsWith('/\\')) {
        return true;
    }

    try {
        const parsed = new URL(cleanUrl);

        // Strict protocol check
        if (!['https:', 'http:'].includes(parsed.protocol)) {
            return false;
        }

        // Strict domain check (prevent attacker-evzone.com or evzone.com.attacker.com)
        return parsed.hostname === 'evzone.com' || parsed.hostname.endsWith('.evzone.com');
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
    const cleanUrl = url.replace(/[\n\r\t]/g, '').trim();

    // Allow safe relative URLs
    if (cleanUrl.startsWith('/') && !cleanUrl.startsWith('//') && !cleanUrl.startsWith('/\\')) {
        return cleanUrl;
    }

    try {
        const parsed = new URL(cleanUrl);

        // Allowlist of protocols
        if (!['https:', 'http:', 'mailto:', 'tel:'].includes(parsed.protocol)) {
            return '';
        }

        // Only allow HTTPS for production
        if (parsed.protocol === 'http:' && (parsed.hostname === 'evzone.com' || parsed.hostname.endsWith('.evzone.com'))) {
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
