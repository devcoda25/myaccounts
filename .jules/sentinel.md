## 2026-02-08 - Insecure Random Number Generation Fallback
**Vulnerability:** Found multiple instances of `window.crypto.getRandomValues` falling back to `Math.random()` in `try/catch` blocks for generating passwords, 2FA secrets, and challenges.
**Learning:** This pattern was likely copy-pasted across the codebase because a centralized secure utility was missing or not used.
**Prevention:** Created `src/utils/secure-random.ts` to centralize secure random number generation. It throws an error if `window.crypto` is unavailable, ensuring no insecure fallback is ever used. Future code should import from this utility.
