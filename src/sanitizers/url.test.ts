import { describe, it, expect } from 'vitest';
import { isValidUrl, sanitizeUrl } from './url';

describe('URL Sanitizer', () => {
    describe('isValidUrl', () => {
        it('should return true for valid evzone.com URLs', () => {
            expect(isValidUrl('https://evzone.com')).toBe(true);
            expect(isValidUrl('http://www.evzone.com')).toBe(true);
            expect(isValidUrl('https://sub.evzone.com/path')).toBe(true);
        });

        it('should return false for invalid URLs that contain evzone.com', () => {
            // These currently pass due to weak validation, but should fail
            expect(isValidUrl('http://evil-evzone.com')).toBe(false);
            expect(isValidUrl('http://evzone.com.evil.com')).toBe(false);
            expect(isValidUrl('http://fake-evzone.com')).toBe(false);
            expect(isValidUrl('http://not-evzone.com')).toBe(false);
        });

        it('should return false for completely unrelated URLs', () => {
            expect(isValidUrl('https://google.com')).toBe(false);
            expect(isValidUrl('invalid-url')).toBe(false);
        });
    });

    describe('sanitizeUrl', () => {
        it('should upgrade protocol for valid evzone domains', () => {
            expect(sanitizeUrl('http://evzone.com')).toBe('https://evzone.com/');
            expect(sanitizeUrl('http://www.evzone.com')).toBe('https://www.evzone.com/');
        });

        it('should not upgrade protocol for invalid domains even if they contain evzone', () => {
             // These currently get upgraded due to weak validation, but should not be
            expect(sanitizeUrl('http://evil-evzone.com')).toBe('http://evil-evzone.com/');
        });
    });
});
