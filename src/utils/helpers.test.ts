import { describe, it, expect, vi, afterEach } from 'vitest';
import { safeRandomBytes } from './helpers';

describe('safeRandomBytes', () => {
    // Backup for restoration
    const originalGetRandomValues = globalThis.crypto?.getRandomValues;

    afterEach(() => {
        vi.restoreAllMocks();

        // Restore getRandomValues if it was modified
        if (globalThis.crypto) {
             try {
                Object.defineProperty(globalThis.crypto, 'getRandomValues', {
                    value: originalGetRandomValues,
                    writable: true,
                    configurable: true // Ensure we can redefine
                });
             } catch {}
        }

        if (typeof window !== 'undefined' && window.crypto) {
             try {
                Object.defineProperty(window.crypto, 'getRandomValues', {
                    value: originalGetRandomValues,
                    writable: true,
                    configurable: true
                });
             } catch {}
        }
    });

    it('should generate random bytes of specified length', () => {
        const length = 16;
        const bytes = safeRandomBytes(length);
        expect(bytes).toBeInstanceOf(Uint8Array);
        expect(bytes.length).toBe(length);
    });

    it('should throw error if crypto is unavailable', () => {
        // Mock to be undefined
        if (typeof window !== 'undefined' && window.crypto) {
            Object.defineProperty(window.crypto, 'getRandomValues', {
                value: undefined,
                writable: true,
                configurable: true
            });
        }

        if (typeof globalThis !== 'undefined' && globalThis.crypto) {
             Object.defineProperty(globalThis.crypto, 'getRandomValues', {
                value: undefined,
                writable: true,
                configurable: true
            });
        }

        // Also ensure node's global.crypto if present
         if (typeof global !== 'undefined' && global.crypto) {
             try {
                 Object.defineProperty(global.crypto, 'getRandomValues', {
                    value: undefined,
                    writable: true,
                    configurable: true
                });
             } catch {}
        }

        expect(() => safeRandomBytes(10)).toThrow('No secure random number generator available.');
    });
});
