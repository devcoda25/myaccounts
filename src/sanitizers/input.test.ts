import { describe, it, expect } from 'vitest';
import { sanitizeInput } from './input';

describe('sanitizeInput', () => {
  it('should escape HTML special characters', () => {
    const input = '<script>alert("xss")</script>';
    const output = sanitizeInput(input);
    expect(output).not.toContain('<script>');
    expect(output).toContain('&lt;');
    expect(output).toContain('&gt;');
    expect(output).toContain('&quot;');
    expect(output).toContain('&#x2F;');
  });

  it('should escape ampersands correctly', () => {
    const input = 'Tom & Jerry';
    const output = sanitizeInput(input);
    expect(output).toBe('Tom &amp; Jerry');
  });

  it('should escape single quotes', () => {
    const input = "It's me";
    const output = sanitizeInput(input);
    expect(output).toBe('It&#39;s me');
  });

  it('should escape all special characters', () => {
    const input = '& < > " \' /';
    const output = sanitizeInput(input);
    expect(output).toBe('&amp; &lt; &gt; &quot; &#39; &#x2F;');
  });

  it('should handle mixed content', () => {
    const input = '<div class="alert">Hello & Welcome!</div>';
    const output = sanitizeInput(input);
    expect(output).toBe('&lt;div class=&quot;alert&quot;&gt;Hello &amp; Welcome!&lt;&#x2F;div&gt;');
  });
});
