import { describe, it, expect, vi } from 'vitest';
import { safeRandomBytes } from './helpers';

describe('safeRandomBytes', () => {
  it('should return a Uint8Array of the correct length', () => {
    const length = 16;
    const result = safeRandomBytes(length);
    expect(result).toBeInstanceOf(Uint8Array);
    expect(result.length).toBe(length);
  });

  it('should produce different values on subsequent calls (probabilistic)', () => {
    const r1 = safeRandomBytes(16);
    const r2 = safeRandomBytes(16);
    // Extremely unlikely to be equal
    expect(r1).not.toEqual(r2);
  });

  it('should throw if window.crypto is unavailable', () => {
    const originalCrypto = window.crypto;

    // Mock window.crypto to be undefined
    Object.defineProperty(window, 'crypto', {
      value: undefined,
      writable: true,
      configurable: true,
    });

    expect(() => safeRandomBytes(16)).toThrow(/Secure random number generation is not supported/);

    // Restore window.crypto
    Object.defineProperty(window, 'crypto', {
      value: originalCrypto,
      writable: true,
      configurable: true,
    });
  });
});
