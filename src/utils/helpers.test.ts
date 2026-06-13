import { describe, it, expect, vi, afterEach } from 'vitest';
import { safeRandomBytes } from './helpers';

describe('safeRandomBytes', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('should return a Uint8Array of the requested length', () => {
        const length = 32;
        const result = safeRandomBytes(length);
        expect(result).toBeInstanceOf(Uint8Array);
        expect(result).toHaveLength(length);
    });

    it('should generate different values on subsequent calls', () => {
        const length = 32;
        const result1 = safeRandomBytes(length);
        const result2 = safeRandomBytes(length);
        expect(result1).not.toEqual(result2);
    });

    it('should throw an error if no secure crypto source is available', () => {
        // Stub globals to be undefined
        vi.stubGlobal('crypto', undefined);
        // Also stub window if it exists (jsdom environment)
        if (typeof window !== 'undefined') {
            vi.stubGlobal('window', { ...window, crypto: undefined });
        }
        // Also stub global if it exists
         if (typeof global !== 'undefined') {
            vi.stubGlobal('global', { ...global, crypto: undefined });
        }

        expect(() => safeRandomBytes(32)).toThrow('No secure random number generator available.');
    });
});
