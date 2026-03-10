/**
 * Secure Random Number Generator
 *
 * Provides cryptographically secure random values using the Web Crypto API.
 * Throws an error if secure randomness is not available.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues
 */

export function getSecureRandomValues(array: Uint8Array): Uint8Array {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    return window.crypto.getRandomValues(array);
  }
  throw new Error('Secure random number generation is not supported in this environment.');
}

export function getSecureRandomBytes(length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  return getSecureRandomValues(bytes);
}
