/**
 * Secure Random Number Generator
 *
 * Provides a cryptographically secure random number generator
 * that wraps window.crypto.getRandomValues.
 *
 * It intentionally throws an error if window.crypto is not available,
 * rather than falling back to Math.random(), to prevent silent security downgrades.
 */

export function safeRandomBytes(length: number): Uint8Array {
  if (length <= 0) {
    throw new Error('Length must be a positive integer');
  }

  const out = new Uint8Array(length);

  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    window.crypto.getRandomValues(out);
    return out;
  }

  throw new Error(
    'Secure random number generation is not supported in this environment. ' +
    'window.crypto.getRandomValues is missing.'
  );
}
