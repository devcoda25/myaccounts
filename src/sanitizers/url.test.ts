import { describe, it, expect } from 'vitest';
import { isValidUrl, sanitizeUrl } from './url';

describe('URL Sanitizer', () => {
    describe('isValidUrl', () => {
        it('should validate correct evzone.com domains', () => {
            expect(isValidUrl('https://evzone.com')).toBe(true);
            expect(isValidUrl('https://app.evzone.com')).toBe(true);
            expect(isValidUrl('https://accounts.evzone.com/path')).toBe(true);
        });

        it('should reject invalid protocols', () => {
            expect(isValidUrl('ftp://evzone.com')).toBe(false);
            expect(isValidUrl('javascript:alert(1)')).toBe(false);
        });

        it('should reject spoofed domains (vulnerability check)', () => {
            expect(isValidUrl('https://evzone.com.attacker.com')).toBe(false);
            expect(isValidUrl('https://attacker-evzone.com')).toBe(false);
            expect(isValidUrl('https://myevzone.com')).toBe(false);
            expect(isValidUrl('https://evzone.com.evil.net')).toBe(false);
        });

        it('should reject invalid URLs', () => {
            expect(isValidUrl('not-a-url')).toBe(false);
            expect(isValidUrl('')).toBe(false);
        });
    });

    describe('sanitizeUrl', () => {
        it('should upgrade http to https for evzone domains', () => {
            expect(sanitizeUrl('http://evzone.com')).toBe('https://evzone.com/');
            expect(sanitizeUrl('http://app.evzone.com/test')).toBe('https://app.evzone.com/test');
            // Check evzone.app support which was previously covered by loose check
            expect(sanitizeUrl('http://evzone.app')).toBe('https://evzone.app/');
            expect(sanitizeUrl('http://wallet.evzone.app')).toBe('https://wallet.evzone.app/');
        });

        it('should not upgrade non-evzone domains', () => {
            expect(sanitizeUrl('http://google.com')).toBe('http://google.com/');
        });

        it('should not upgrade spoofed domains', () => {
            expect(sanitizeUrl('http://evzone.com.attacker.com')).toBe('http://evzone.com.attacker.com/');
            expect(sanitizeUrl('http://attacker-evzone.com')).toBe('http://attacker-evzone.com/');
        });
    });
});
