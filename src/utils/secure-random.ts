/**
 * Secure Random Utility
 * Enforces usage of window.crypto for random number generation.
 */

export function secureRandomBytes(length: number): Uint8Array {
  const array = new Uint8Array(length);
  // eslint-disable-next-line no-undef
  const crypto = typeof window !== 'undefined' ? window.crypto : undefined;

  if (crypto && crypto.getRandomValues) {
    crypto.getRandomValues(array);
    return array;
  }

  throw new Error("Secure random number generation is not available.");
}
