import { describe, it, expect } from 'vitest';
import { sanitizeInput } from '../sanitizers/input';

describe('sanitizeInput', () => {
  it('should escape HTML special characters', () => {
    const input = '<script>alert("xss")&</script>';
    // Expected output with proper escaping
    const expected = '&lt;script&gt;alert(&quot;xss&quot;)&amp;&lt;&#x2F;script&gt;';
    expect(sanitizeInput(input)).toBe(expected);
  });

  it('should escape individual characters correctly', () => {
    expect(sanitizeInput('&')).toBe('&amp;');
    expect(sanitizeInput('<')).toBe('&lt;');
    expect(sanitizeInput('>')).toBe('&gt;');
    expect(sanitizeInput('"')).toBe('&quot;');
    expect(sanitizeInput("'")).toBe('&#x27;');
    expect(sanitizeInput('/')).toBe('&#x2F;');
  });

  it('should handle empty input', () => {
    expect(sanitizeInput('')).toBe('');
  });

  it('should handle safe input without changes', () => {
    const safe = 'Hello World 123';
    expect(sanitizeInput(safe)).toBe(safe);
  });
});
