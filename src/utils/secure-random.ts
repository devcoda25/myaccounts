/**
 * Secure random number generation utilities.
 * Enforces usage of window.crypto.getRandomValues.
 */

export function secureRandomBytes(n: number): Uint8Array {
  if (typeof window === 'undefined' || !window.crypto || !window.crypto.getRandomValues) {
    throw new Error('Secure random number generation is not supported in this environment.');
  }
  const out = new Uint8Array(n);
  window.crypto.getRandomValues(out);
  return out;
}

export function secureRandomHex(byteCount: number): string {
  const bytes = secureRandomBytes(byteCount);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
