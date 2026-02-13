import { describe, it, expect } from 'vitest';
import { mkTempPassword } from './helpers';

describe('mkTempPassword', () => {
    it('should generate a password in correct format EVZ-XXXX-XXXX', () => {
        const password = mkTempPassword();
        expect(password).toMatch(/^EVZ-[A-Z2-9]{4}-[A-Z2-9]{4}$/);
    });

    it('should generate different passwords', () => {
        const p1 = mkTempPassword();
        const p2 = mkTempPassword();
        expect(p1).not.toBe(p2);
    });

    it('should not contain ambiguous characters (I, O, 0, 1)', () => {
        for (let i = 0; i < 100; i++) {
            const password = mkTempPassword();
            expect(password).not.toMatch(/[IO01]/);
        }
    });
});
