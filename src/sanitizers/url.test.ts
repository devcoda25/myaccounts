import { describe, it, expect } from 'vitest';
import { isValidUrl, sanitizeUrl, extractHostname, isAbsoluteUrl, resolveRelativeUrl } from './url';

describe('URL Sanitizer', () => {
    describe('isValidUrl', () => {
        it('should return true for valid evzone domains', () => {
            expect(isValidUrl('https://evzone.com')).toBe(true);
            expect(isValidUrl('https://api.evzone.com')).toBe(true);
            expect(isValidUrl('http://dev.evzone.app')).toBe(true);
            expect(isValidUrl('https://evzone.app/path?q=1')).toBe(true);
        });

        it('should return false for invalid or malicious domains', () => {
            // Prevent SSRF/Open Redirect bypasses
            expect(isValidUrl('https://evzone.com.attacker.com')).toBe(false);
            expect(isValidUrl('https://attacker.com/evzone.com')).toBe(false);
            expect(isValidUrl('https://evzone.app.malicious.net')).toBe(false);
            expect(isValidUrl('https://google.com')).toBe(false);
        });

        it('should return false for invalid protocols', () => {
            expect(isValidUrl('javascript:alert(1)')).toBe(false);
            expect(isValidUrl('data:text/html,<html>')).toBe(false);
            expect(isValidUrl('file:///etc/passwd')).toBe(false);
            expect(isValidUrl('ftp://evzone.com')).toBe(false);
        });

        it('should return false for invalid URLs', () => {
            expect(isValidUrl('not-a-url')).toBe(false);
            expect(isValidUrl('')).toBe(false);
        });
    });

    describe('sanitizeUrl', () => {
        it('should return empty string for non HTTP/HTTPS protocols', () => {
            // Prevent XSS from javascript: URIs
            expect(sanitizeUrl('javascript:alert(1)')).toBe('');
            expect(sanitizeUrl('data:text/html,<script>alert(1)</script>')).toBe('');
            expect(sanitizeUrl('vbscript:msgbox(1)')).toBe('');
        });

        it('should upgrade HTTP to HTTPS for evzone domains', () => {
            expect(sanitizeUrl('http://evzone.com/avatar.png')).toBe('https://evzone.com/avatar.png');
            expect(sanitizeUrl('http://api.evzone.com/doc.pdf')).toBe('https://api.evzone.com/doc.pdf');
            expect(sanitizeUrl('http://evzone.app/image.jpg')).toBe('https://evzone.app/image.jpg');
        });

        it('should not upgrade HTTP to HTTPS for non-evzone domains', () => {
            expect(sanitizeUrl('http://example.com/avatar.png')).toBe('http://example.com/avatar.png');
            // Malicious domain bypass test - should NOT be upgraded since it's not a real evzone domain
            expect(sanitizeUrl('http://evzone.com.attacker.com/img')).toBe('http://evzone.com.attacker.com/img');
        });

        it('should preserve HTTPS URLs', () => {
            expect(sanitizeUrl('https://evzone.com/avatar.png')).toBe('https://evzone.com/avatar.png');
            expect(sanitizeUrl('https://example.com/image.jpg')).toBe('https://example.com/image.jpg');
        });

        it('should return empty string for invalid URLs', () => {
            expect(sanitizeUrl('not-a-url')).toBe('');
            expect(sanitizeUrl('')).toBe('');
        });
    });

    describe('extractHostname', () => {
        it('should correctly extract the hostname', () => {
            expect(extractHostname('https://api.evzone.com/path')).toBe('api.evzone.com');
            expect(extractHostname('http://localhost:3000')).toBe('localhost');
        });

        it('should return empty string for invalid URLs', () => {
            expect(extractHostname('not-a-url')).toBe('');
            expect(extractHostname('')).toBe('');
        });
    });

    describe('isAbsoluteUrl', () => {
        it('should identify absolute URLs', () => {
            expect(isAbsoluteUrl('https://example.com')).toBe(true);
            expect(isAbsoluteUrl('http://example.com')).toBe(true);
            expect(isAbsoluteUrl('ftp://example.com')).toBe(true);
            expect(isAbsoluteUrl('mailto:user@example.com')).toBe(true);
            expect(isAbsoluteUrl('javascript:alert(1)')).toBe(true); // Technically absolute
        });

        it('should identify relative URLs', () => {
            expect(isAbsoluteUrl('/path/to/resource')).toBe(false);
            expect(isAbsoluteUrl('path/to/resource')).toBe(false);
            expect(isAbsoluteUrl('?query=1')).toBe(false);
            expect(isAbsoluteUrl('#hash')).toBe(false);
        });
    });

    describe('resolveRelativeUrl', () => {
        it('should resolve relative URLs against a base URL', () => {
            expect(resolveRelativeUrl('https://evzone.com', '/path')).toBe('https://evzone.com/path');
            expect(resolveRelativeUrl('https://evzone.com/api/', 'users')).toBe('https://evzone.com/api/users');
        });

        it('should return the relative URL if base is invalid', () => {
            expect(resolveRelativeUrl('not-a-url', '/path')).toBe('/path');
        });

        it('should resolve correctly if relative URL is absolute', () => {
            expect(resolveRelativeUrl('https://evzone.com', 'https://example.com/path')).toBe('https://example.com/path');
        });
    });
});
