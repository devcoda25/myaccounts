import { describe, it, expect, afterEach } from 'vitest';
import { safeRandomBytes } from './helpers';

describe('safeRandomBytes', () => {
  const originalCrypto = window.crypto;

  afterEach(() => {
    Object.defineProperty(window, 'crypto', {
      value: originalCrypto,
      writable: true
    });
  });

  it('returns Uint8Array of correct length', () => {
    const bytes = safeRandomBytes(16);
    expect(bytes).toBeInstanceOf(Uint8Array);
    expect(bytes.length).toBe(16);
  });

  it('throws if crypto is unavailable', () => {
    // Mock window.crypto to be undefined
    Object.defineProperty(window, 'crypto', {
      value: undefined,
      writable: true
    });

    expect(() => safeRandomBytes(10)).toThrow(/Crypto API is unavailable/);
  });
});
