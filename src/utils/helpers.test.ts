import { describe, it, expect, vi, afterEach } from 'vitest';
import { safeRandomBytes } from './helpers';

describe('safeRandomBytes', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('returns a Uint8Array of the requested length', () => {
        const length = 16;
        const result = safeRandomBytes(length);
        expect(result).toBeInstanceOf(Uint8Array);
        expect(result).toHaveLength(length);
    });

    it('uses window.crypto.getRandomValues', () => {
        const length = 8;
        const getRandomValuesSpy = vi.spyOn(window.crypto, 'getRandomValues');
        safeRandomBytes(length);
        expect(getRandomValuesSpy).toHaveBeenCalled();
    });

    it('throws an error if window.crypto is undefined', () => {
        const originalCrypto = window.crypto;
        // @ts-ignore
        Object.defineProperty(window, 'crypto', { value: undefined, writable: true });

        expect(() => safeRandomBytes(10)).toThrow('Cryptographically secure random number generation is not available.');

        Object.defineProperty(window, 'crypto', { value: originalCrypto, writable: true });
    });

    it('throws an error if window.crypto.getRandomValues is not a function', () => {
        const originalGetRandomValues = window.crypto.getRandomValues;
        // @ts-ignore
        window.crypto.getRandomValues = undefined;

        expect(() => safeRandomBytes(10)).toThrow('Cryptographically secure random number generation is not available.');

        window.crypto.getRandomValues = originalGetRandomValues;
    });
});
