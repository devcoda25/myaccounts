import { describe, it, expect } from 'vitest';
import { sanitizeInput, sanitizeHtml } from './input';

describe('sanitizeInput', () => {
    it('should escape HTML tags', () => {
        const input = '<script>alert("xss")</script>';
        // This is what we expect AFTER the fix.
        // Before the fix, this test will fail (or pass if I write the assertion to match the bug, but I want to TDD it).
        // I will write the assertion for the CORRECT behavior.
        const expected = '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;';
        expect(sanitizeInput(input)).toBe(expected);
    });

    it('should escape single quotes', () => {
        const input = "alert('xss')";
        const expected = "alert(&#39;xss&#39;)";
        expect(sanitizeInput(input)).toBe(expected);
    });

    it('should escape double quotes', () => {
        const input = 'alert("xss")';
        const expected = 'alert(&quot;xss&quot;)';
        expect(sanitizeInput(input)).toBe(expected);
    });

    it('should escape ampersands', () => {
        const input = 'Tom & Jerry';
        const expected = 'Tom &amp; Jerry';
        expect(sanitizeInput(input)).toBe(expected);
    });

    it('should escape forward slashes', () => {
        const input = 'a/b';
        const expected = 'a&#x2F;b';
        expect(sanitizeInput(input)).toBe(expected);
    });
});

describe('sanitizeHtml', () => {
    it('should behave same as sanitizeInput', () => {
        const input = '<div>content</div>';
        const expected = '&lt;div&gt;content&lt;&#x2F;div&gt;';
        expect(sanitizeHtml(input)).toBe(expected);
    });
});
