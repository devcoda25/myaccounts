import { describe, it, expect } from 'vitest';
import { isValidUrl, sanitizeUrl } from './url';

describe('isValidUrl', () => {
    it('returns false for non-http/https protocols', () => {
        expect(isValidUrl('javascript:alert(1)')).toBe(false);
        expect(isValidUrl('data:text/html,<script>alert(1)</script>')).toBe(false);
    });

    it('returns true for exact allowed domains', () => {
        expect(isValidUrl('https://evzone.com')).toBe(true);
        expect(isValidUrl('http://evzone.app')).toBe(true);
    });

    it('returns true for subdomains of allowed domains', () => {
        expect(isValidUrl('https://api.evzone.com')).toBe(true);
        expect(isValidUrl('https://auth.evzone.app')).toBe(true);
    });

    it('returns false for attacker domains bypassing simple includes check', () => {
        expect(isValidUrl('https://evzone.com.attacker.com')).toBe(false);
        expect(isValidUrl('https://myevzone.com')).toBe(false);
    });
});

describe('sanitizeUrl', () => {
    it('returns empty string for non-http/https protocols', () => {
        expect(sanitizeUrl('javascript:alert(1)')).toBe('');
        expect(sanitizeUrl('data:text/plain,hello')).toBe('');
    });

    it('preserves allowed domains over http/https', () => {
        expect(sanitizeUrl('https://evzone.com')).toBe('https://evzone.com/');
    });

    it('upgrades http to https for allowed domains', () => {
        expect(sanitizeUrl('http://evzone.com')).toBe('https://evzone.com/');
        expect(sanitizeUrl('http://api.evzone.app/path')).toBe('https://api.evzone.app/path');
    });

    it('does not upgrade http to https for non-allowed domains but keeps http', () => {
        expect(sanitizeUrl('http://example.com')).toBe('http://example.com/');
    });

    it('prevents attacker domains from being upgraded like allowed domains', () => {
        expect(sanitizeUrl('http://evzone.com.attacker.com')).toBe('http://evzone.com.attacker.com/');
    });
});
