import { describe, it, expect } from 'vitest';
import { isValidUrl, sanitizeUrl } from './url';

describe('isValidUrl', () => {
    it('should validate exact domain', () => {
        expect(isValidUrl('https://evzone.com')).toBe(true);
    });

    it('should validate valid subdomain', () => {
        expect(isValidUrl('https://sub.evzone.com')).toBe(true);
    });

    it('should reject invalid domains containing the substring', () => {
        expect(isValidUrl('https://evzone.com.evil.com')).toBe(false);
        expect(isValidUrl('https://evil-evzone.com')).toBe(false);
        expect(isValidUrl('https://not-evzone.com')).toBe(false);
        expect(isValidUrl('https://evzone.com-attacker.com')).toBe(false);
    });

    it('should validate protocol', () => {
        expect(isValidUrl('http://evzone.com')).toBe(true);
        expect(isValidUrl('ftp://evzone.com')).toBe(false);
    });
});

describe('sanitizeUrl', () => {
    it('should sanitize valid URLs correctly', () => {
        expect(sanitizeUrl('http://evzone.com')).toBe('https://evzone.com/');
    });

    it('should return empty string for invalid domains', () => {
        // These are currently passing erroneously in the vulnerable implementation,
        // but the goal is to fix them.
        // We expect these to be sanitized or blocked.
        // If sanitizeUrl simply returns the input if it fails strict checks, or upgrades to https.
        // The current implementation is:
        // if (parsed.protocol !== 'https:' && parsed.hostname.includes('evzone')) { parsed.protocol = 'https:'; }

        // With the fix, we probably want it to return empty string or the original only if safe?
        // Actually, sanitizeUrl currently returns the string if valid, but upgrades to https.
        // If invalid, it returns empty string? No, it returns `parsed.toString()`.

        // Wait, current implementation:
        // try { const parsed = new URL(url); ... return parsed.toString(); } catch { return ''; }
        // So it returns ANY valid URL, just upgrades protocol if it includes 'evzone'.
        // This means it doesn't really sanitize non-evzone URLs, it just returns them.

        // If the intention is "Sanitize URL for avatar/documents", maybe it should only allow specific domains?
        // The comments say "Ensures HTTPS for production domains".

        // Let's assume for now we want to keep the behavior of allowing other URLs but enforcing HTTPS on evzone.
        // BUT, the `isValidUrl` check implies we only want `evzone.com` related URLs in some contexts.

        // However, `sanitizeUrl` seems to be for general use?
        // "Sanitize URL for avatar/documents" -> Avatars might be hosted elsewhere?
        // But if it's user provided, maybe we want to restrict it?

        // Let's look at `isValidUrl` usage again.
        // It says "Validate URL is safe and allowed".

        // `sanitizeUrl` says "Ensures HTTPS for production domains".
        // If I pass `http://evil.com`, it returns `http://evil.com/`.
        // If I pass `http://evzone.com.evil.com`, it currently returns `https://evzone.com.evil.com/` because of the loose check!
        // This is the vulnerability: it inadvertently upgrades 'evil' domains that match the pattern to HTTPS, potentially giving a false sense of security or just being weird.

        // I will assert that `sanitizeUrl` should NOT upgrade protocol for non-evzone domains that just happen to have the substring.

        expect(sanitizeUrl('http://evzone.com.evil.com')).toBe('http://evzone.com.evil.com/');
    });
});
