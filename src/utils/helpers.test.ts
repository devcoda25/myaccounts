import { describe, it, expect } from 'vitest';
import { safeRandomBytes } from './helpers';

describe('safeRandomBytes', () => {
  it('should generate a Uint8Array of the specified length', () => {
    const length = 16;
    const bytes = safeRandomBytes(length);
    expect(bytes).toBeInstanceOf(Uint8Array);
    expect(bytes.length).toBe(length);
  });

  it('should generate different values on subsequent calls', () => {
    const length = 32;
    const bytes1 = safeRandomBytes(length);
    const bytes2 = safeRandomBytes(length);

    // It's astronomically unlikely that 32 random bytes will be identical
    expect(bytes1).not.toEqual(bytes2);
  });

  it('should not throw in the test environment (which has crypto)', () => {
    expect(() => safeRandomBytes(10)).not.toThrow();
  });
});
