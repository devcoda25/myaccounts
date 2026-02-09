/**
 * Secure Random Number Generator
 * Wraps window.crypto.getRandomValues and ensures no fallback to Math.random
 */

export function secureRandomBytes(length: number): Uint8Array {
  if (length < 0) {
    throw new Error('Length must be non-negative');
  }

  const array = new Uint8Array(length);

  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    window.crypto.getRandomValues(array);
    return array;
  }

  throw new Error('Secure random number generation is not supported in this environment');
}
