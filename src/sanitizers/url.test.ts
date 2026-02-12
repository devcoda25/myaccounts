import { describe, it, expect } from 'vitest';
import { isValidUrl, sanitizeUrl } from './url';

describe('URL Sanitizer', () => {
  describe('isValidUrl', () => {
    it('should allow valid evzone domains', () => {
      expect(isValidUrl('https://evzone.com')).toBe(true);
      expect(isValidUrl('http://evzone.com')).toBe(true);
      expect(isValidUrl('https://app.evzone.com')).toBe(true);
      expect(isValidUrl('https://accounts.evzone.com/login')).toBe(true);
      expect(isValidUrl('https://staging.evzone.com')).toBe(true);
    });

    it('should reject invalid protocols', () => {
      expect(isValidUrl('ftp://evzone.com')).toBe(false);
      expect(isValidUrl('javascript:alert(1)')).toBe(false);
      expect(isValidUrl('file:///etc/passwd')).toBe(false);
    });

    it('should reject invalid domains (previously vulnerable)', () => {
      expect(isValidUrl('https://evzone.com.evil.com')).toBe(false);
      expect(isValidUrl('https://evil-evzone.com')).toBe(false);
      expect(isValidUrl('https://evzone.com.br')).toBe(false);
      expect(isValidUrl('https://fakeevzone.com')).toBe(false);
      expect(isValidUrl('https://www.google.com')).toBe(false);
    });

    it('should reject IP addresses', () => {
      expect(isValidUrl('https://127.0.0.1')).toBe(false);
      expect(isValidUrl('https://192.168.1.1')).toBe(false);
    });

    it('should handle malformed URLs', () => {
      expect(isValidUrl('not-a-url')).toBe(false);
      expect(isValidUrl('')).toBe(false);
    });
  });

  describe('sanitizeUrl', () => {
    it('should upgrade http to https for evzone domains', () => {
      expect(sanitizeUrl('http://evzone.com')).toBe('https://evzone.com/');
      expect(sanitizeUrl('http://app.evzone.com/path')).toBe('https://app.evzone.com/path');
    });

    it('should NOT upgrade non-evzone domains', () => {
      expect(sanitizeUrl('http://example.com')).toBe('http://example.com/');
    });

    it('should return empty string for invalid URLs', () => {
      expect(sanitizeUrl('not-a-url')).toBe('');
      expect(sanitizeUrl('')).toBe('');
    });

    it('should preserve https for evzone domains', () => {
      expect(sanitizeUrl('https://evzone.com')).toBe('https://evzone.com/');
    });
  });
});
