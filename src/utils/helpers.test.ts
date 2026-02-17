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

  it('should return a Uint8Array of the correct length when crypto is available', () => {
    const mockGetRandomValues = vi.fn((array) => {
      for (let i = 0; i < array.length; i++) {
        array[i] = i % 256; // Fill with deterministic values
      }
      return array;
    });

    Object.defineProperty(window, 'crypto', {
      value: { getRandomValues: mockGetRandomValues },
      writable: true,
    });

    const result = safeRandomBytes(10);
    expect(result).toBeInstanceOf(Uint8Array);
    expect(result).toHaveLength(10);
    expect(mockGetRandomValues).toHaveBeenCalled();
  });

  it('should throw an error when crypto is not available', () => {
    // Mock window.crypto as undefined
    Object.defineProperty(window, 'crypto', {
      value: undefined,
      writable: true,
    });

    expect(() => safeRandomBytes(10)).toThrow('Secure random number generation is not available');
  });
});
