import { describe, it, expect, vi } from 'vitest';
import { safeRandomBytes } from './helpers';

describe('safeRandomBytes', () => {
    it('should generate a Uint8Array of the specified length', () => {
        const length = 16;
        const bytes = safeRandomBytes(length);
        expect(bytes).toBeInstanceOf(Uint8Array);
        expect(bytes.length).toBe(length);
    });

    it('should use crypto.getRandomValues when available', () => {
        // window.crypto is usually available in jsdom environment,
        // so we can spy on it directly.
        const spy = vi.spyOn(window.crypto, 'getRandomValues');

        safeRandomBytes(10);

        expect(spy).toHaveBeenCalled();
        spy.mockRestore();
    });

    it('should throw an error if crypto is unavailable', () => {
        // Backup
        const originalCrypto = window.crypto;

        // Mock to undefined/unavailable
        // In JSDOM window.crypto is read-only property so we use defineProperty
        Object.defineProperty(window, 'crypto', {
            get: () => undefined
        });

        // In JSDOM/Vitest, global.crypto might be read-only too.
        // We attempt to shadow it or defineProperty on globalThis if needed.
        // However, safely mocking read-only globals in Node/JSDOM can be tricky.
        // Let's try mocking globalThis.crypto instead if possible, or skip
        // the global part if it causes issues, focusing on window.crypto which our helper checks.

        // Our helper checks: globalThis.crypto, then window.crypto, then global.crypto.
        // To fail, ALL must be undefined.

        const originalGlobalCrypto = globalThis.crypto;

        // Use defineProperty to override read-only getters if possible
        try {
            Object.defineProperty(globalThis, 'crypto', {
                get: () => undefined,
                configurable: true
            });
        } catch (e) {
            console.warn('Could not mock globalThis.crypto', e);
        }

        expect(() => safeRandomBytes(10)).toThrow('Secure random number generation is not available');

        // Restore
        Object.defineProperty(window, 'crypto', { value: originalCrypto });

        if (originalGlobalCrypto !== undefined) {
             Object.defineProperty(globalThis, 'crypto', {
                value: originalGlobalCrypto,
                configurable: true
            });
        }
    });
});
