import { describe, it, expect, vi, afterEach } from 'vitest';
import { safeRandomBytes } from './helpers';

describe('safeRandomBytes', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should generate random bytes of the specified length', () => {
    const length = 16;
    const bytes = safeRandomBytes(length);
    expect(bytes).toBeInstanceOf(Uint8Array);
    expect(bytes.length).toBe(length);
    // Simple check that it's not all zeros (highly unlikely)
    const allZeros = Array.from(bytes).every((b) => b === 0);
    expect(allZeros).toBe(false);
  });

  it('should throw an error if crypto is unavailable (fail secure)', () => {
    // Mock window.crypto.getRandomValues to throw
    vi.spyOn(window.crypto, 'getRandomValues').mockImplementation(() => {
      throw new Error('Crypto not available');
    });

    const length = 10;
    expect(() => safeRandomBytes(length)).toThrow();

    // Verify it was called
    expect(window.crypto.getRandomValues).toHaveBeenCalled();
  });
});
