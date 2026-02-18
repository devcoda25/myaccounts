import { describe, it, expect } from 'vitest';
import { safeRandomBytes } from './helpers';

describe('safeRandomBytes', () => {
    it('should generate a Uint8Array of the correct length', () => {
        const length = 16;
        const result = safeRandomBytes(length);
        expect(result).toBeInstanceOf(Uint8Array);
        expect(result.length).toBe(length);
    });

    it('should throw an error if window.crypto is undefined', () => {
        const originalCrypto = window.crypto;

        // Temporarily remove crypto
        Object.defineProperty(window, 'crypto', {
            configurable: true,
            value: undefined
        });

        expect(() => safeRandomBytes(10)).toThrow('safeRandomBytes: Cryptographically secure random number generator not available.');

        // Restore crypto
        Object.defineProperty(window, 'crypto', {
            configurable: true,
            value: originalCrypto
        });
    });
});
