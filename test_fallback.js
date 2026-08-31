function sanitizeUrl(url) {
    if (!url) return '';

    // Always strip whitespace characters first
    url = url.replace(/[\n\r\t]/g, '').trim();

    // Allow safe relative paths
    if (url.startsWith('/') && !url.startsWith('//') && !url.startsWith('/\\') || url.startsWith('?') || url.startsWith('#')) {
        return url;
    }

    try {
        const parsed = new URL(url);

        // Protocol allowlist
        if (!['http:', 'https:', 'mailto:', 'tel:'].includes(parsed.protocol)) {
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
console.log('//evil.com ->', sanitizeUrl('//evil.com'));
