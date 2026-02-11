import { describe, it, expect } from 'vitest';
import { isValidUrl, sanitizeUrl } from './url';

describe('URL Sanitizer', () => {
    describe('isValidUrl', () => {
        it('should return true for valid evzone domains', () => {
            expect(isValidUrl('https://evzone.com')).toBe(true);
            expect(isValidUrl('https://sub.evzone.com')).toBe(true);
            expect(isValidUrl('https://api.evzone.com/v1/users')).toBe(true);
        });

        it('should return false for invalid domains', () => {
            expect(isValidUrl('https://google.com')).toBe(false);
            expect(isValidUrl('https://evzone.com.attacker.com')).toBe(false);
            expect(isValidUrl('https://attacker-evzone.com')).toBe(false);
            expect(isValidUrl('http://evil.com')).toBe(false);
        });

        it('should return false for invalid URLs', () => {
            expect(isValidUrl('not-a-url')).toBe(false);
            expect(isValidUrl('')).toBe(false);
        });
    });

    describe('sanitizeUrl', () => {
        it('should return sanitized URL for valid inputs', () => {
            expect(sanitizeUrl('https://example.com')).toBe('https://example.com/');
            expect(sanitizeUrl('http://example.com')).toBe('http://example.com/');
        });

        it('should upgrade evzone domains to https', () => {
            expect(sanitizeUrl('http://evzone.com')).toBe('https://evzone.com/');
            expect(sanitizeUrl('http://sub.evzone.com')).toBe('https://sub.evzone.com/');
        });

        it('should not upgrade non-evzone domains', () => {
            expect(sanitizeUrl('http://example.com')).toBe('http://example.com/');
        });

        it('should return empty string for dangerous protocols', () => {
            expect(sanitizeUrl('javascript:alert(1)')).toBe('');
            expect(sanitizeUrl('data:text/html,<b>Hi</b>')).toBe('');
            expect(sanitizeUrl('vbscript:msgbox')).toBe('');
        });

        it('should return empty string for invalid URLs', () => {
            expect(sanitizeUrl('not-a-url')).toBe('');
        });
    });
});
