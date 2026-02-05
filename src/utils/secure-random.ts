/**
 * Secure Random Number Generator Utilities
 *
 * Provides cryptographically secure random values using the Web Crypto API.
 * Throws errors if a secure source is not available, avoiding insecure fallbacks like Math.random.
 */

export function getRandomBytes(n: number): Uint8Array {
  const crypto = typeof window !== "undefined" ? window.crypto : (globalThis as any).crypto;
  if (!crypto || !crypto.getRandomValues) {
    throw new Error("Secure random number generator is not available.");
  }
  const out = new Uint8Array(n);
  crypto.getRandomValues(out);
  return out;
}

/**
 * Generates a random string of the specified length using the provided charset.
 * Note: This implementation uses simple modulo which may introduce slight bias for
 * charsets whose length does not divide 256 evenly. For high-security keys, use getRandomBytes directly.
 */
export function getSecureRandomString(length: number, charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"): string {
  if (length <= 0) return "";
  const bytes = getRandomBytes(length);
  let result = "";
  for (let i = 0; i < length; i++) {
    result += charset[bytes[i] % charset.length];
  }
  return result;
}
