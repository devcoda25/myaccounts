import { describe, it, expect } from 'vitest';
import { isValidUrl, sanitizeUrl } from './url';

describe('isValidUrl', () => {
  it('should validate exact domain match', () => {
    expect(isValidUrl('https://evzone.com')).toBe(true);
  });

  it('should validate subdomain match', () => {
    expect(isValidUrl('https://sub.evzone.com')).toBe(true);
    expect(isValidUrl('https://a.b.evzone.com')).toBe(true);
  });

  it('should reject invalid domains containing the target string', () => {
    expect(isValidUrl('https://evzone.com.attacker.com')).toBe(false);
    expect(isValidUrl('https://fake-evzone.com')).toBe(false);
    expect(isValidUrl('https://myevzone.com')).toBe(false);
    expect(isValidUrl('https://evzone.net')).toBe(false);
  });

  it('should reject non-http/https protocols', () => {
    expect(isValidUrl('ftp://evzone.com')).toBe(false);
    expect(isValidUrl('javascript:alert(1)')).toBe(false);
  });

  it('should handle malformed URLs gracefully', () => {
    expect(isValidUrl('not-a-url')).toBe(false);
    expect(isValidUrl('')).toBe(false);
  });
});

describe('sanitizeUrl', () => {
  it('should upgrade http to https for evzone domains', () => {
    expect(sanitizeUrl('http://evzone.com/foo')).toBe('https://evzone.com/foo');
    expect(sanitizeUrl('http://sub.evzone.com/bar')).toBe('https://sub.evzone.com/bar');
  });

  it('should not modify non-evzone domains just because they contain the string', () => {
    // These should NOT be upgraded if we implement strict checking,
    // or at least not treated as "our" domain.
    // However, the current implementation blindly upgrades anything containing "evzone".
    // We want to test the NEW behavior which should be stricter.

    // For now, let's assume sanitizeUrl returns the URL as is if it doesn't match our strict criteria,
    // OR it only upgrades if it matches strict criteria.
    expect(sanitizeUrl('http://fake-evzone.com')).toBe('http://fake-evzone.com/');
    // Note: URL.toString() adds a trailing slash if path is empty.
  });

  it('should return empty string for invalid URLs', () => {
    expect(sanitizeUrl('not-a-url')).toBe('');
  });
});
