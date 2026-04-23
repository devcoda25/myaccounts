import { describe, it, expect } from 'vitest';
import { isValidUrl, sanitizeUrl } from './url';

describe('isValidUrl', () => {
    // Valid cases
    it('should allow valid production domain', () => {
        expect(isValidUrl('https://evzone.com')).toBe(true);
        expect(isValidUrl('https://accounts.evzone.com')).toBe(true);
    });

    // Invalid cases / Vulnerabilities
    it('should reject non-evzone domains', () => {
        expect(isValidUrl('https://google.com')).toBe(false);
    });

    it('should reject attacker controlled subdomains', () => {
        // This is the vulnerability: evzone.com.attacker.com contains "evzone.com"
        expect(isValidUrl('https://evzone.com.attacker.com')).toBe(false);
    });

    it('should reject attacker controlled domains with prefix', () => {
        // This is the vulnerability: attacker-evzone.com contains "evzone.com"
        expect(isValidUrl('https://attacker-evzone.com')).toBe(false);
    });

    it('should reject invalid protocols', () => {
        expect(isValidUrl('ftp://evzone.com')).toBe(false);
        expect(isValidUrl('javascript:alert(1)')).toBe(false);
    });
});

describe('sanitizeUrl', () => {
    it('should enforce https for production', () => {
        expect(sanitizeUrl('http://evzone.com')).toBe('https://evzone.com/');
    });

    it('should not modify non-evzone URLs (but maybe return empty string if strict?)', () => {
        // Current implementation returns empty string if error, or original string if not matching condition
        // Wait, sanitizeUrl logic:
        // if (!url) return '';
        // try { parsed = new URL(url); if (proto != https && hostname.includes('evzone')) proto = https; return parsed.toString(); } catch { return ''; }

        // So a non-evzone URL just passes through unless it errors?
        // Let's check the code again.
        // if (parsed.protocol !== 'https:' && parsed.hostname.includes('evzone')) { ... }
        // It returns parsed.toString(). So 'http://google.com' -> 'http://google.com/'

        // This test case is to understand behavior, not necessarily strict security yet unless we change policy.
        expect(sanitizeUrl('http://google.com')).toBe('http://google.com/');
    });

    it('should not upgrade attacker domains', () => {
        // Vulnerability: attacker-evzone.com gets upgraded to https?
        // Or maybe it shouldn't be touched?
        // Ideally sanitizeUrl should probably strip invalid URLs entirely or at least not upgrade them based on loose match.
        // The current implementation upgrades to https if hostname includes 'evzone'.
        // So http://attacker-evzone.com -> https://attacker-evzone.com/
        // We probably want to assert it does NOT upgrade or maybe returns empty if we want strict sanitization.
        // For now, let's assert it treats it as unsafe and maybe doesn't upgrade?
        // The fix will make it check stricter.

        const url = 'http://attacker-evzone.com';
        // With current code: upgrades to https
        // With fix: should NOT upgrade (remain http) or ideally return empty if we only want valid URLs.
        // The function name 'sanitizeUrl' implies returning a safe URL.
        // If we strictly want to allow only evzone URLs, we should probably return empty for others?
        // But the current implementation seems permissive for non-evzone URLs (just returns them).
        // So the fix should be: only upgrade if REALLY evzone.

        expect(sanitizeUrl(url)).toBe('http://attacker-evzone.com/');
    });
});
