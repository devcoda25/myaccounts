import { describe, it, expect, vi, afterEach } from 'vitest';
import { safeRandomBytes } from './helpers';

describe('safeRandomBytes', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('returns a Uint8Array of the specified length', () => {
        const length = 16;
        const bytes = safeRandomBytes(length);
        expect(bytes).toBeInstanceOf(Uint8Array);
        expect(bytes.length).toBe(length);
    });

    it('uses window.crypto.getRandomValues', () => {
        const getRandomValuesSpy = vi.spyOn(window.crypto, 'getRandomValues');
        safeRandomBytes(10);
        expect(getRandomValuesSpy).toHaveBeenCalled();
    });

    it('throws error when crypto is unavailable', () => {
        // Save original crypto
        const originalCrypto = window.crypto;

        // Mock window.crypto as undefined to simulate environment without crypto
        // We use Object.defineProperty because window.crypto is read-only in some environments
        Object.defineProperty(window, 'crypto', {
            value: undefined,
            writable: true,
            configurable: true,
        });

        try {
            // This should throw an error with the new secure implementation
            // Currently it falls back to insecure random, so this test will fail until we fix the code
            expect(() => safeRandomBytes(10)).toThrow();
        } finally {
            // Restore window.crypto
            Object.defineProperty(window, 'crypto', {
                value: originalCrypto,
                writable: true,
                configurable: true,
            });
        }
    });
});
