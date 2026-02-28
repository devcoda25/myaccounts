import { describe, it, expect } from 'vitest';
import { isValidUrl, sanitizeUrl } from './url';

describe('URL Sanitizers', () => {
    describe('isValidUrl', () => {
        it('allows valid evzone.com domains', () => {
            expect(isValidUrl('https://evzone.com/path')).toBe(true);
            expect(isValidUrl('http://sub.evzone.com/')).toBe(true);
        });

        it('allows valid evzone.app domains', () => {
            expect(isValidUrl('https://evzone.app/')).toBe(true);
            expect(isValidUrl('https://api.evzone.app/v1')).toBe(true);
        });

        it('rejects malicious domains mimicking evzone', () => {
            expect(isValidUrl('https://evzone.com.evil.com/')).toBe(false);
            expect(isValidUrl('https://evzone.app.evil.com/')).toBe(false);
            expect(isValidUrl('https://my-evzone.com/')).toBe(false);
            expect(isValidUrl('https://evzone.com.attacker.net/')).toBe(false);
        });

        it('rejects invalid protocols', () => {
            expect(isValidUrl('javascript:alert(1)')).toBe(false);
            expect(isValidUrl('ftp://evzone.com/')).toBe(false);
        });
    });

    describe('sanitizeUrl', () => {
        it('upgrades http to https for evzone domains', () => {
            expect(sanitizeUrl('http://evzone.com/test')).toBe('https://evzone.com/test');
            expect(sanitizeUrl('http://api.evzone.app/test')).toBe('https://api.evzone.app/test');
        });

        it('does not upgrade http to https for non-evzone domains', () => {
            expect(sanitizeUrl('http://example.com/test')).toBe('http://example.com/test');
        });

        it('blocks dangerous protocols', () => {
            expect(sanitizeUrl('javascript:alert(1)')).toBe('');
            expect(sanitizeUrl('data:text/html,<script>alert(1)</script>')).toBe('');
            expect(sanitizeUrl('vbscript:msgbox(1)')).toBe('');
        });

        it('allows valid protocols', () => {
            expect(sanitizeUrl('https://evzone.com')).toBe('https://evzone.com/');
            expect(sanitizeUrl('mailto:test@evzone.com')).toBe('mailto:test@evzone.com');
            expect(sanitizeUrl('tel:+1234567890')).toBe('tel:+1234567890');
        });

        it('handles malicious subdomains securely when upgrading', () => {
            expect(sanitizeUrl('http://evil-evzone.com')).toBe('http://evil-evzone.com/');
        });
    });
});
