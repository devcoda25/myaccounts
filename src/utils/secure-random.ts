/* eslint-disable no-undef */
/**
 * Secure Random Number Generator
 *
 * This utility provides cryptographically secure random values using the Web Crypto API.
 * It strictly forbids fallback to Math.random() as per security policy.
 */

export function secureRandomBytes(length: number): Uint8Array {
  // Ensure window.crypto is available
  if (typeof window === 'undefined' || !window.crypto || !window.crypto.getRandomValues) {
    throw new Error('Secure random number generation is not supported in this environment.');
  }

  const array = new Uint8Array(length);
  try {
    window.crypto.getRandomValues(array);
    return array;
  } catch (error) {
    // If getRandomValues fails for any reason, re-throw to avoid fallback
    throw new Error(`Failed to generate secure random bytes: ${(error as Error).message}`);
  }
}
