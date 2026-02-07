## 2026-02-07 - Insecure Randomness Fallback
**Vulnerability:** Found `Math.random()` used as a fallback for `window.crypto.getRandomValues()` in critical security functions (password generation, 2FA secret generation).
**Learning:** Developers often add try/catch blocks around `crypto.getRandomValues()` to support environments where it might be missing, but this silently downgrades security to insecure PRNG.
**Prevention:** Always throw an error if a secure PRNG is unavailable. Never fallback to `Math.random()` for security-sensitive operations. Use a centralized helper like `getSecureRandomValues` to enforce this.
