
import { describe, it, expect, vi } from 'vitest';
import { safeRandomBytes } from './helpers';

describe('safeRandomBytes', () => {
  it('should return a Uint8Array of the specified length', () => {
    const length = 32;
    const bytes = safeRandomBytes(length);
    expect(bytes).toBeInstanceOf(Uint8Array);
    expect(bytes.length).toBe(length);
  });

  it('should use window.crypto.getRandomValues', () => {
    const getRandomValuesSpy = vi.spyOn(window.crypto, 'getRandomValues');
    safeRandomBytes(16);
    expect(getRandomValuesSpy).toHaveBeenCalled();
    getRandomValuesSpy.mockRestore();
  });

  it('should throw error if window.crypto is not available', () => {
    // Save original crypto
    const originalCrypto = window.crypto;

    // Mock window.crypto to be undefined
    Object.defineProperty(window, 'crypto', {
      value: undefined,
      writable: true
    });

    try {
        expect(() => safeRandomBytes(16)).toThrow("Crypto API not available");
    } finally {
        // Restore window.crypto
        Object.defineProperty(window, 'crypto', {
            value: originalCrypto,
            writable: true
        });
    }
  });
});
