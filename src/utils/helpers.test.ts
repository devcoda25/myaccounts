import { describe, it, expect, vi, afterEach } from 'vitest';
import { safeRandomBytes } from './helpers';

describe('safeRandomBytes', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return a Uint8Array of the correct length', () => {
    const length = 32;
    const result = safeRandomBytes(length);
    expect(result).toBeInstanceOf(Uint8Array);
    expect(result.length).toBe(length);
  });

  it('should use window.crypto.getRandomValues', () => {
    const getRandomValuesSpy = vi.spyOn(window.crypto, 'getRandomValues');
    safeRandomBytes(16);
    expect(getRandomValuesSpy).toHaveBeenCalled();
  });

  it('should throw an error if window.crypto is undefined', () => {
    // Save original crypto
    const originalCrypto = window.crypto;

    // Remove crypto
    Object.defineProperty(window, 'crypto', {
      value: undefined,
      writable: true,
      configurable: true,
    });

    expect(() => safeRandomBytes(16)).toThrow('Secure random number generation is not supported');

    // Restore crypto
    Object.defineProperty(window, 'crypto', {
      value: originalCrypto,
      writable: true,
      configurable: true,
    });
  });
});
