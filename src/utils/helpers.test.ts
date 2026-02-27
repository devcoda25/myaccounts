import { describe, it, expect, vi, afterEach } from 'vitest';
import { safeRandomBytes } from './helpers';

describe('safeRandomBytes', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should return a Uint8Array of the specified length', () => {
        const length = 16;
        const result = safeRandomBytes(length);
        expect(result).toBeInstanceOf(Uint8Array);
        expect(result.length).toBe(length);
    });

    it('should generate different values on subsequent calls', () => {
        const length = 32;
        const result1 = safeRandomBytes(length);
        const result2 = safeRandomBytes(length);
        expect(result1).not.toEqual(result2);
    });

    it('should use crypto.getRandomValues', () => {
        const getRandomValuesSpy = vi.fn();
        const originalCrypto = globalThis.crypto;

        // Mock crypto
        Object.defineProperty(globalThis, 'crypto', {
            value: {
                getRandomValues: getRandomValuesSpy,
            },
            writable: true,
        });

        safeRandomBytes(10);
        expect(getRandomValuesSpy).toHaveBeenCalled();

        // Restore
        Object.defineProperty(globalThis, 'crypto', {
            value: originalCrypto,
            writable: true,
        });
    });

    it('should throw an error if crypto is not available', () => {
        const originalCrypto = globalThis.crypto;
        // In the test environment (JSDOM), window is globalThis.
        // We need to be careful not to break the test runner by removing globals entirely.

        // Mock crypto as undefined on globalThis
        // Note: In some environments, globalThis.crypto is read-only or non-configurable.
        // If so, this test might need adjustment or might not be possible to run exactly as desired.
        try {
            Object.defineProperty(globalThis, 'crypto', {
                value: undefined,
                writable: true,
                configurable: true
            });

            // Also need to clear window.crypto if it exists separately
            if (typeof window !== 'undefined') {
                 Object.defineProperty(window, 'crypto', {
                    value: undefined,
                    writable: true,
                    configurable: true
                });
            }

            expect(() => safeRandomBytes(10)).toThrow('Cryptography API not available');

        } finally {
            // Restore
            if (originalCrypto) {
                Object.defineProperty(globalThis, 'crypto', {
                    value: originalCrypto,
                    writable: true,
                    configurable: true
                });
            }
        }
    });
});
