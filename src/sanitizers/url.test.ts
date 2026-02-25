import { describe, it, expect } from 'vitest';
import { isValidUrl, sanitizeUrl } from './url';

describe('isValidUrl', () => {
  it('should allow legitimate evzone.com domains', () => {
    expect(isValidUrl('https://evzone.com')).toBe(true);
    expect(isValidUrl('https://accounts.evzone.com')).toBe(true);
    expect(isValidUrl('https://app.evzone.com')).toBe(true);
  });

  it('should reject insecure protocols', () => {
    expect(isValidUrl('ftp://evzone.com')).toBe(false);
    expect(isValidUrl('javascript:alert(1)')).toBe(false);
  });

  // These currently pass but should fail
  it('should reject attacker domains containing evzone', () => {
    expect(isValidUrl('https://attacker-evzone.com')).toBe(false);
    expect(isValidUrl('https://evzone.com.attacker.com')).toBe(false);
    expect(isValidUrl('https://my-evzone.com')).toBe(false);
    expect(isValidUrl('https://evzone.fake.com')).toBe(false);
  });
});

describe('sanitizeUrl', () => {
    it('should upgrade http to https for evzone domains', () => {
        expect(sanitizeUrl('http://evzone.com')).toBe('https://evzone.com/');
    });

    it('should NOT upgrade http to https for attacker domains', () => {
         // Current implementation upgrades this because it contains 'evzone'
         // We want to ensure it DOES NOT upgrade unrelated domains
         expect(sanitizeUrl('http://attacker-evzone.com')).toBe('http://attacker-evzone.com/');
    });
});
