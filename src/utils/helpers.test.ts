import { safeRandomBytes } from './helpers';
import { describe, it, expect, vi } from 'vitest';

describe('safeRandomBytes', () => {
    it('should generate a Uint8Array of the correct length', () => {
        const length = 16;
        const result = safeRandomBytes(length);
        expect(result).toBeInstanceOf(Uint8Array);
        expect(result.length).toBe(length);
    });

    it('should throw an error if window.crypto is unavailable', () => {
        const originalCrypto = window.crypto;

        // Mock crypto as undefined
        Object.defineProperty(window, 'crypto', {
            value: undefined,
            writable: true
        });

        try {
            expect(() => safeRandomBytes(16)).toThrow();
        } finally {
            // Restore original crypto
            Object.defineProperty(window, 'crypto', {
                value: originalCrypto,
                writable: true
            });
        }
    });

    it('should throw an error if getRandomValues is unavailable', () => {
        const originalCrypto = window.crypto;

        // Mock crypto with undefined getRandomValues
        Object.defineProperty(window, 'crypto', {
            value: {},
            writable: true
        });

        try {
            expect(() => safeRandomBytes(16)).toThrow();
        } finally {
            // Restore original crypto
            Object.defineProperty(window, 'crypto', {
                value: originalCrypto,
                writable: true
            });
        }
    });
});
