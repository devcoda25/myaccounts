import { describe, it, expect } from 'vitest';
import { isValidUrl, sanitizeUrl } from '../sanitizers/url';

describe('url sanitizers', () => {
    it('isValidUrl', () => {
        expect(isValidUrl('https://evzone.com/foo')).toBe(true);
        expect(isValidUrl('https://my.evzone.com/foo')).toBe(true);
        expect(isValidUrl('https://evzone.app/foo')).toBe(true);
        expect(isValidUrl('https://my.evzone.app/foo')).toBe(true);

        expect(isValidUrl('https://evzone.com.attacker.com')).toBe(false);
        expect(isValidUrl('https://attacker-evzone.com')).toBe(false);
        expect(isValidUrl('javascript:alert(1)')).toBe(false);
    });

    it('sanitizeUrl', () => {
        expect(sanitizeUrl('http://evzone.com/foo')).toBe('https://evzone.com/foo');
        expect(sanitizeUrl('http://evzone.app/foo')).toBe('https://evzone.app/foo');
        expect(sanitizeUrl('javascript://evzone.com/%0aalert(1)')).toBe('');
        expect(sanitizeUrl('http://attacker.com/foo')).toBe('http://attacker.com/foo');
    });
});
