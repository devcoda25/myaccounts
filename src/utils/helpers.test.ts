import { describe, it, expect } from 'vitest';
import { safeRandomBytes } from './helpers';

describe('safeRandomBytes', () => {
    it('returns a Uint8Array of the correct length', () => {
        const length = 16;
        const bytes = safeRandomBytes(length);
        expect(bytes).toBeInstanceOf(Uint8Array);
        expect(bytes.length).toBe(length);
    });

    it('throws error if crypto is unavailable', () => {
        // Backup original crypto
        const originalCrypto = global.crypto;
        const originalWindowCrypto = typeof window !== 'undefined' ? window.crypto : undefined;

        // Mock crypto as undefined to simulate environment without crypto support
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

        // It should throw an error instead of falling back to Math.random
        expect(() => safeRandomBytes(16)).toThrow();

        // Restore
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
});
