import { describe, it, expect } from 'vitest';
import { sanitizeInput } from './input';

describe('sanitizeInput', () => {
    it('should escape special characters', () => {
        const input = '<script>alert("xss")</script>';
        const expected = '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;';
        expect(sanitizeInput(input)).toBe(expected);
    });

    it('should escape ampersands', () => {
        const input = 'a & b';
        const expected = 'a &amp; b';
        expect(sanitizeInput(input)).toBe(expected);
    });

    it('should escape quotes', () => {
        const input = '"test"';
        const expected = '&quot;test&quot;';
        expect(sanitizeInput(input)).toBe(expected);
    });
});
