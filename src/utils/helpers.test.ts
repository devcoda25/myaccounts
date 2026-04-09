import { describe, it, expect, vi, afterEach } from 'vitest';
import { safeRandomBytes } from './helpers';

describe('safeRandomBytes', () => {
  // Store original crypto implementation
  const originalCrypto = global.crypto;

  afterEach(() => {
    // Restore crypto
    Object.defineProperty(global, 'crypto', {
      value: originalCrypto,
      writable: true,
    });
    if (typeof window !== 'undefined') {
       Object.defineProperty(window, 'crypto', {
         value: originalCrypto,
         writable: true,
       });
    }
    vi.restoreAllMocks();
  });

  it('should return a Uint8Array of the specified length', () => {
    const length = 32;
    const bytes = safeRandomBytes(length);
    expect(bytes).toBeInstanceOf(Uint8Array);
    expect(bytes.length).toBe(length);
  });

  it('should use crypto.getRandomValues when available', () => {
    const getRandomValuesSpy = vi.fn();
    Object.defineProperty(window, 'crypto', {
      value: { getRandomValues: getRandomValuesSpy },
      writable: true,
    });

    safeRandomBytes(16);
    expect(getRandomValuesSpy).toHaveBeenCalled();
  });

  it('should throw an error if window.crypto is unavailable', () => {
    // Mock window.crypto to be undefined to simulate insecure environment
    Object.defineProperty(window, 'crypto', {
      value: undefined,
      writable: true,
    });

    // The current implementation (before fix) would NOT throw, so this test would fail.
    // The fixed implementation MUST throw.
    expect(() => safeRandomBytes(32)).toThrow(/Secure random number generation is not supported/);
  });
});
