import { describe, it, expect } from 'vitest';
import { safeRandomBytes } from './helpers';

describe('safeRandomBytes', () => {
  it('should return a Uint8Array of the correct length', () => {
    const length = 32;
    const bytes = safeRandomBytes(length);
    expect(bytes).toBeInstanceOf(Uint8Array);
    expect(bytes.length).toBe(length);
  });

  it('should generate random values', () => {
    const bytes1 = safeRandomBytes(32);
    const bytes2 = safeRandomBytes(32);
    expect(bytes1).not.toEqual(bytes2);
  });
});
