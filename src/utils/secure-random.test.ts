import { describe, it, expect, vi, afterEach } from 'vitest';
import { secureRandomBytes } from './secure-random';

describe('secureRandomBytes', () => {
    const originalCrypto = window.crypto;

    afterEach(() => {
        Object.defineProperty(window, 'crypto', {
            value: originalCrypto,
            writable: true
        });
    });

    it('should return a Uint8Array of the correct length', () => {
        const length = 16;
        const result = secureRandomBytes(length);
        expect(result).toBeInstanceOf(Uint8Array);
        expect(result.length).toBe(length);
    });

    it('should throw an error if length is negative', () => {
        expect(() => secureRandomBytes(-1)).toThrow('Length must be non-negative');
    });

    it('should use window.crypto.getRandomValues', () => {
        const getRandomValuesSpy = vi.spyOn(window.crypto, 'getRandomValues');
        secureRandomBytes(10);
        expect(getRandomValuesSpy).toHaveBeenCalled();
    });

    it('should throw an error if window.crypto is undefined', () => {
        Object.defineProperty(window, 'crypto', {
            value: undefined,
            writable: true
        });
        expect(() => secureRandomBytes(10)).toThrow('Secure random number generation is not supported in this environment');
    });

    it('should throw an error if window.crypto.getRandomValues is undefined', () => {
         Object.defineProperty(window, 'crypto', {
            value: {},
            writable: true
        });
        expect(() => secureRandomBytes(10)).toThrow('Secure random number generation is not supported in this environment');
    });
});
