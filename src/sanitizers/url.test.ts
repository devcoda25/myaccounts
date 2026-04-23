import { describe, it, expect } from 'vitest';
import { sanitizeUrl } from './url';

describe('sanitizeUrl', () => {
    it('should sanitize javascript: protocol', () => {
        const maliciousUrl = 'javascript:alert("XSS")';
        expect(sanitizeUrl(maliciousUrl)).toBe('');
    });

    it('should sanitize data: protocol', () => {
        const maliciousUrl = 'data:text/html,<script>alert(1)</script>';
        expect(sanitizeUrl(maliciousUrl)).toBe('');
    });

    it('should sanitize vbscript: protocol', () => {
        const maliciousUrl = 'vbscript:msgbox("XSS")';
        expect(sanitizeUrl(maliciousUrl)).toBe('');
    });

    it('should allow valid https url', () => {
        const safeUrl = 'https://example.com/image.png';
        expect(sanitizeUrl(safeUrl)).toBe(safeUrl);
    });

    it('should allow valid http url', () => {
        const safeUrl = 'http://example.com/image.png';
        expect(sanitizeUrl(safeUrl)).toBe(safeUrl);
    });

    it('should handle invalid URLs gracefully', () => {
        expect(sanitizeUrl('not-a-url')).toBe('');
        expect(sanitizeUrl('')).toBe('');
    });
});
