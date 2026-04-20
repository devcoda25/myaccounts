import { describe, it, expect } from 'vitest';
import { isValidUrl, sanitizeUrl, isAbsoluteUrl, extractHostname, resolveRelativeUrl } from '../sanitizers/url';

describe('URL Sanitizers', () => {
    describe('isValidUrl', () => {
        it('allows valid evzone.com URLs', () => {
            expect(isValidUrl('https://evzone.com/path')).toBe(true);
            expect(isValidUrl('http://evzone.com/path')).toBe(true);
            expect(isValidUrl('https://sub.evzone.com/path')).toBe(true);
            expect(isValidUrl('https://evzone.app/path')).toBe(true);
            expect(isValidUrl('https://sub.evzone.app/path')).toBe(true);
        });

        it('rejects invalid domains and malicious SSRF/Open Redirect attempts', () => {
            expect(isValidUrl('https://example.com/path')).toBe(false);
            expect(isValidUrl('https://evzone.com.attacker.com/path')).toBe(false);
            expect(isValidUrl('https://evzone.app.attacker.com/path')).toBe(false);
            expect(isValidUrl('https://attacker.com/evzone.com/path')).toBe(false);
        });

        it('rejects invalid protocols', () => {
            expect(isValidUrl('javascript:alert(1)')).toBe(false);
            expect(isValidUrl('ftp://evzone.com/file')).toBe(false);
            expect(isValidUrl('data:text/html,<html>')).toBe(false);
        });

        it('handles invalid URL strings safely', () => {
            expect(isValidUrl('not-a-url')).toBe(false);
            expect(isValidUrl('')).toBe(false);
        });
    });

    describe('sanitizeUrl', () => {
        it('upgrades HTTP to HTTPS for evzone domains', () => {
            expect(sanitizeUrl('http://evzone.com/image.jpg')).toBe('https://evzone.com/image.jpg');
            expect(sanitizeUrl('http://sub.evzone.app/doc.pdf')).toBe('https://sub.evzone.app/doc.pdf');
        });

        it('preserves HTTPS for evzone domains', () => {
            expect(sanitizeUrl('https://evzone.com/image.jpg')).toBe('https://evzone.com/image.jpg');
        });

        it('does not upgrade HTTP to HTTPS for non-evzone domains', () => {
            expect(sanitizeUrl('http://example.com/image.jpg')).toBe('http://example.com/image.jpg');
            expect(sanitizeUrl('http://evzone.com.attacker.com/image.jpg')).toBe('http://evzone.com.attacker.com/image.jpg');
        });

        it('rejects javascript: and other dangerous protocols', () => {
            expect(sanitizeUrl('javascript:alert(1)')).toBe('');
            expect(sanitizeUrl('javascript://evzone.com/%0aalert(1)')).toBe('');
            expect(sanitizeUrl('data:text/html,<html>')).toBe('');
        });

        it('handles invalid URL strings safely', () => {
            expect(sanitizeUrl('not-a-url')).toBe('');
            expect(sanitizeUrl('')).toBe('');
        });
    });

    describe('extractHostname', () => {
        it('extracts hostname correctly', () => {
            expect(extractHostname('https://sub.evzone.com/path')).toBe('sub.evzone.com');
        });

        it('handles invalid URLs gracefully', () => {
            expect(extractHostname('not-a-url')).toBe('');
            expect(extractHostname('')).toBe('');
        });
    });

    describe('isAbsoluteUrl', () => {
        it('identifies absolute URLs', () => {
            expect(isAbsoluteUrl('https://example.com')).toBe(true);
            expect(isAbsoluteUrl('http://example.com')).toBe(true);
            expect(isAbsoluteUrl('mailto:user@example.com')).toBe(true);
        });

        it('identifies relative URLs', () => {
            expect(isAbsoluteUrl('/path/to/file')).toBe(false);
            expect(isAbsoluteUrl('path/to/file')).toBe(false);
        });
    });

    describe('resolveRelativeUrl', () => {
        it('resolves relative URLs against a base', () => {
            expect(resolveRelativeUrl('https://evzone.com/base/', 'relative')).toBe('https://evzone.com/base/relative');
            expect(resolveRelativeUrl('https://evzone.com/base/', '/absolute-path')).toBe('https://evzone.com/absolute-path');
        });

        it('returns original URL if resolution fails', () => {
            expect(resolveRelativeUrl('not-a-base', 'relative')).toBe('relative');
        });
    });
});
