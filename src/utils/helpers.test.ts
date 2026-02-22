import { describe, it, expect } from 'vitest';
import { safeRandomBytes } from './helpers';

describe('safeRandomBytes', () => {
  it('should return a Uint8Array of the requested length', () => {
    const length = 32;
    const bytes = safeRandomBytes(length);
    expect(bytes).toBeInstanceOf(Uint8Array);
    expect(bytes.length).toBe(length);
  });

  it('should return different values on subsequent calls', () => {
    const bytes1 = safeRandomBytes(32);
    const bytes2 = safeRandomBytes(32);
    // Highly unlikely to be equal if random
    expect(bytes1).not.toEqual(bytes2);
  });

  it('should work with small lengths', () => {
    const bytes = safeRandomBytes(1);
    expect(bytes.length).toBe(1);
  });
});
