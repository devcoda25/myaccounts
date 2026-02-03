import { describe, it, expect } from 'vitest';
import { sanitizeInput } from './input';

describe('sanitizeInput', () => {
    it('should escape HTML special characters', () => {
        const input = '<script>alert("xss")</script>';
        const expected = '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;';
        expect(sanitizeInput(input)).toBe(expected);
    });

    it('should escape ampersand', () => {
        const input = 'Me & You';
        const expected = 'Me &amp; You';
        expect(sanitizeInput(input)).toBe(expected);
    });
});
