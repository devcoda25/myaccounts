import { describe, it, expect, vi, afterEach } from 'vitest';
import { safeRandomBytes } from './secure-random';

describe('safeRandomBytes', () => {
    // Save original crypto
    const originalCrypto = global.window.crypto;

    afterEach(() => {
        // Restore original crypto
        Object.defineProperty(global.window, 'crypto', {
            value: originalCrypto,
            writable: true
        });
    });

    it('should generate random bytes of specified length', () => {
        // We assume jsdom provides crypto.getRandomValues or we need to mock it if it fails.
        // If this fails, it means jsdom environment doesn't have crypto, which is good to know.
        // But usually it does.
        const length = 16;
        const bytes = safeRandomBytes(length);
        expect(bytes).toBeInstanceOf(Uint8Array);
        expect(bytes.length).toBe(length);
    });

    it('should throw error if length is not positive', () => {
        expect(() => safeRandomBytes(0)).toThrow();
        expect(() => safeRandomBytes(-5)).toThrow();
    });

    it('should use window.crypto.getRandomValues', () => {
        const getRandomValues = vi.fn();
        Object.defineProperty(global.window, 'crypto', {
            value: { getRandomValues },
            writable: true
        });

        safeRandomBytes(10);
        expect(getRandomValues).toHaveBeenCalled();
    });

    it('should throw error if window.crypto is missing', () => {
        Object.defineProperty(global.window, 'crypto', {
            value: undefined,
            writable: true
        });

        expect(() => safeRandomBytes(10)).toThrow(/secure random number generation is not supported/i);
    });
});
