import { safeRandomBytes } from './helpers';
import { describe, it, expect } from 'vitest';

describe('safeRandomBytes', () => {
    it('should generate random bytes of correct length', () => {
        const bytes = safeRandomBytes(16);
        expect(bytes.length).toBe(16);
        expect(bytes).toBeInstanceOf(Uint8Array);
    });

    it('should generate different values', () => {
        const b1 = safeRandomBytes(16);
        const b2 = safeRandomBytes(16);
        // Extremely unlikely to be equal
        expect(b1).not.toEqual(b2);
    });
});
