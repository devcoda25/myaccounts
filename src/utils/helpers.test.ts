import { describe, it, expect, vi, afterEach } from 'vitest';
import { safeRandomBytes } from './helpers';

describe('safeRandomBytes', () => {
  const originalCrypto = window.crypto;

  afterEach(() => {
    Object.defineProperty(window, 'crypto', {
      value: originalCrypto,
      writable: true,
    });
  });

  it('should return a Uint8Array of the specified length', () => {
    const length = 16;
    const bytes = safeRandomBytes(length);
    expect(bytes).toBeInstanceOf(Uint8Array);
    expect(bytes.length).toBe(length);
  });

  it('should use window.crypto.getRandomValues', () => {
    const getRandomValuesSpy = vi.spyOn(window.crypto, 'getRandomValues');
    safeRandomBytes(10);
    expect(getRandomValuesSpy).toHaveBeenCalled();
  });

  it('should throw an error if window.crypto is unavailable', () => {
    // @ts-ignore
    delete window.crypto;
    // or
    Object.defineProperty(window, 'crypto', {
        value: undefined,
        writable: true
    });

    expect(() => safeRandomBytes(10)).toThrow();
  });
});
