import { describe, it, expect } from 'vitest';
import { isValidUrl, sanitizeUrl } from './url';

describe('isValidUrl', () => {
    it('should validate correct evzone URLs', () => {
        expect(isValidUrl('https://evzone.com')).toBe(true);
        expect(isValidUrl('https://app.evzone.com')).toBe(true);
        expect(isValidUrl('https://my.evzone.com/dashboard')).toBe(true);
    });

    it('should reject invalid protocols', () => {
        expect(isValidUrl('ftp://evzone.com')).toBe(false);
        expect(isValidUrl('javascript:alert(1)')).toBe(false);
    });

    it('should reject non-evzone domains', () => {
        expect(isValidUrl('https://google.com')).toBe(false);
        expect(isValidUrl('https://example.com')).toBe(false);
    });

    it('should reject malicious subdomains/suffixes (The Vulnerability)', () => {
        // This is the vulnerability: malicious-evzone.com contains 'evzone.com'
        expect(isValidUrl('https://malicious-evzone.com')).toBe(false);

        // This is also vulnerable: evzone.com.attacker.com
        expect(isValidUrl('https://evzone.com.attacker.com')).toBe(false);

        // This one too: evzone.com-fake.net
        expect(isValidUrl('https://evzone.com-fake.net')).toBe(false);
    });
});

describe('sanitizeUrl', () => {
    it('should allow valid HTTPS evzone URLs', () => {
        expect(sanitizeUrl('https://evzone.com/image.png')).toBe('https://evzone.com/image.png');
    });

    it('should upgrade HTTP to HTTPS for evzone domains', () => {
        expect(sanitizeUrl('http://evzone.com/image.png')).toBe('https://evzone.com/image.png');
    });

    it('should not modify non-evzone URLs (or should it return empty?)', () => {
        // The current implementation returns the URL as is if it doesn't match evzone check
        // but let's see what happens.
        // Actually the code says: if not https and hostname includes evzone, upgrade.
        // Otherwise return as is.
        expect(sanitizeUrl('https://google.com')).toBe('https://google.com/');
    });
});
