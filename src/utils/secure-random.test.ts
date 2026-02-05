import { describe, it, expect } from 'vitest';
import { getRandomBytes, getSecureRandomString } from './secure-random';

describe('secure-random', () => {
  it('getRandomBytes returns Uint8Array of correct length', () => {
    const bytes = getRandomBytes(10);
    expect(bytes).toBeInstanceOf(Uint8Array);
    expect(bytes.length).toBe(10);
  });

  it('getRandomBytes values change', () => {
    const bytes1 = getRandomBytes(10);
    const bytes2 = getRandomBytes(10);
    // Extremely unlikely to be equal
    expect(bytes1).not.toEqual(bytes2);
  });

  it('getSecureRandomString returns string of correct length', () => {
    const s = getSecureRandomString(12);
    expect(typeof s).toBe('string');
    expect(s.length).toBe(12);
  });

  it('getSecureRandomString uses provided charset', () => {
    const charset = 'A';
    const s = getSecureRandomString(5, charset);
    expect(s).toBe('AAAAA');
  });

  it('getSecureRandomString default charset works', () => {
      const s = getSecureRandomString(20);
      expect(s).toMatch(/^[A-Za-z0-9]+$/);
  });
});
