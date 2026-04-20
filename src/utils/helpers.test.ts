import { describe, it, expect, vi, afterEach } from 'vitest';
import { safeRandomBytes } from './helpers';

describe('safeRandomBytes', () => {
    const originalCrypto = global.crypto;
    const originalWindowCrypto = typeof window !== 'undefined' ? window.crypto : undefined;

    afterEach(() => {
        // Restore crypto after each test
        Object.defineProperty(global, 'crypto', {
            value: originalCrypto,
            writable: true
        });
        if (typeof window !== 'undefined') {
            Object.defineProperty(window, 'crypto', {
                value: originalWindowCrypto,
                writable: true
            });
        }
    });

    it('returns a Uint8Array of the correct length', () => {
        const length = 16;
        const bytes = safeRandomBytes(length);
        expect(bytes).toBeInstanceOf(Uint8Array);
        expect(bytes).toHaveLength(length);
    });

    it('returns different values on subsequent calls', () => {
        const bytes1 = safeRandomBytes(16);
        const bytes2 = safeRandomBytes(16);
        // It is extremely unlikely that 16 random bytes are identical
        expect(bytes1).not.toEqual(bytes2);
    });

    it('throws error if crypto is not available', () => {
        // Mock crypto to be undefined
        Object.defineProperty(global, 'crypto', {
            value: undefined,
            writable: true
        });

        if (typeof window !== 'undefined') {
            Object.defineProperty(window, 'crypto', {
                value: undefined,
                writable: true
            });
        }

        expect(() => safeRandomBytes(16)).toThrow();
    });
});
