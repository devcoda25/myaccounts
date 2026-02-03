import { describe, it, expect } from 'vitest';
import { sanitizeUrl } from './url';

describe('sanitizeUrl', () => {
    it('should allow valid https urls', () => {
        expect(sanitizeUrl('https://example.com')).toBe('https://example.com/');
    });

    it('should allow valid http urls', () => {
        expect(sanitizeUrl('http://example.com')).toBe('http://example.com/');
    });

    it('should upgrade evzone http to https', () => {
        expect(sanitizeUrl('http://evzone.com/foo')).toBe('https://evzone.com/foo');
    });

    it('should remove javascript protocol', () => {
        expect(sanitizeUrl('javascript:alert(1)')).toBe('');
    });

    it('should remove vbscript protocol', () => {
        expect(sanitizeUrl('vbscript:msgbox(1)')).toBe('');
    });

    it('should allow relative urls', () => {
        expect(sanitizeUrl('/foo/bar')).toBe('/foo/bar');
        expect(sanitizeUrl('foo/bar')).toBe('foo/bar');
        expect(sanitizeUrl('./foo')).toBe('./foo');
    });

    it('should handle empty input', () => {
        expect(sanitizeUrl('')).toBe('');
    });
});
