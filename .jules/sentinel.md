## 2024-10-26 - Insecure Random Number Generation Patterns
**Vulnerability:** Codebase contained multiple inline implementations of random byte generation falling back to `Math.random` when `window.crypto` failed, even for security-critical features like WebAuthn challenges and password generation.
**Learning:** Inconsistent "safe" implementations often lead to insecure fallbacks. The assumption that `window.crypto` might be missing led developers to add dangerous fallbacks.
**Prevention:** Created `src/utils/secure-random.ts` to centralize secure random number generation. It now throws an error instead of falling back to weak RNG (Fail Securely principle).
