/**
 * Cryptographically secure random number generation.
 * Replaces insecure Math.random() usage for security-sensitive operations.
 */

/**
 * Generates n cryptographically secure random bytes.
 * Throws an error if window.crypto is not available.
 */
export function secureRandomBytes(n: number): Uint8Array {
    if (typeof window === 'undefined' || !window.crypto) {
        throw new Error('Secure random number generation is not supported in this environment');
    }
    const out = new Uint8Array(n);
    window.crypto.getRandomValues(out);
    return out;
}

/**
 * Generates a random string using a specific alphabet.
 */
export function secureRandomString(length: number, alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'): string {
    const bytes = secureRandomBytes(length);
    let result = '';
    for (let i = 0; i < length; i++) {
        result += alphabet[bytes[i] % alphabet.length];
    }
    return result;
}

/**
 * Generates a UUID v4.
 */
export function secureUUID(): string {
    if (typeof window !== 'undefined' && window.crypto && typeof window.crypto.randomUUID === 'function') {
        return window.crypto.randomUUID();
    }
    // Polyfill using secureRandomBytes
    const bytes = secureRandomBytes(16);
    // Set version (4) and variant (8, 9, a, or b)
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;

    return [...bytes].map((b, i) => {
        const hex = b.toString(16).padStart(2, '0');
        return (i === 4 || i === 6 || i === 8 || i === 10) ? '-' + hex : hex;
    }).join('');
}
