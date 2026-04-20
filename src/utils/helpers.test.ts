import { describe, it, expect } from 'vitest';
import { safeRandomBytes } from './helpers';

describe('safeRandomBytes', () => {
  it('should return a Uint8Array of the specified length', () => {
    const length = 16;
    const result = safeRandomBytes(length);
    expect(result).toBeInstanceOf(Uint8Array);
    expect(result.length).toBe(length);
  });

  it('should generate different values on subsequent calls', () => {
    const length = 16;
    const result1 = safeRandomBytes(length);
    const result2 = safeRandomBytes(length);
    expect(result1).not.toEqual(result2);
  });
});
