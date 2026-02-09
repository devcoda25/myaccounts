/* eslint-disable no-undef */
import { describe, it, expect, vi, afterEach } from 'vitest';
import { secureRandomBytes } from './secure-random';

describe('secureRandomBytes', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return a Uint8Array of the requested length', () => {
    const length = 16;
    const bytes = secureRandomBytes(length);
    expect(bytes).toBeInstanceOf(Uint8Array);
    expect(bytes.length).toBe(length);
  });

  it('should return different values on subsequent calls', () => {
    const bytes1 = secureRandomBytes(16);
    const bytes2 = secureRandomBytes(16);
    expect(bytes1).not.toEqual(bytes2);
  });

  it('should throw an error if window.crypto is undefined', () => {
    // Save original crypto
    const originalCrypto = window.crypto;

    // Mock window.crypto to be undefined
    Object.defineProperty(window, 'crypto', {
      value: undefined,
      writable: true,
      configurable: true, // Allow re-definition
    });

    try {
      expect(() => secureRandomBytes(16)).toThrow('Secure random number generation is not supported');
    } finally {
      // Restore original crypto
      Object.defineProperty(window, 'crypto', {
        value: originalCrypto,
        writable: true,
        configurable: true,
      });
    }
  });

  it('should throw an error if getRandomValues throws', () => {
    // Mock getRandomValues to throw
    vi.spyOn(window.crypto, 'getRandomValues').mockImplementation(() => {
      throw new Error('Entropy source failure');
    });

    expect(() => secureRandomBytes(16)).toThrow('Failed to generate secure random bytes: Entropy source failure');
  });
});
