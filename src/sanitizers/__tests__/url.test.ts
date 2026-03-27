import { describe, it, expect } from 'vitest';
import { isValidUrl, sanitizeUrl } from '../url';

describe('isValidUrl', () => {
    it('returns true for exact domain', () => {
        expect(isValidUrl('https://evzone.com')).toBe(true);
    });

    it('returns true for subdomains', () => {
        expect(isValidUrl('https://app.evzone.com')).toBe(true);
    });

    it('returns true for .evzone.app domain', () => {
        expect(isValidUrl('https://app.evzone.app')).toBe(true);
    });

    it('returns false for attacker domain containing evzone.com', () => {
        expect(isValidUrl('https://evzone.com.attacker.com')).toBe(false);
    });
});

describe('sanitizeUrl', () => {
    it('returns sanitized url', () => {
        expect(sanitizeUrl('http://evzone.com')).toBe('https://evzone.com/');
    });
    it('does not allow javascript protocol', () => {
        expect(sanitizeUrl('javascript:alert(1)')).toBe('');
    });
    it('does not mutate non-evzone domains', () => {
        expect(sanitizeUrl('http://evzone.com.attacker.com')).toBe('http://evzone.com.attacker.com/');
    });
});
