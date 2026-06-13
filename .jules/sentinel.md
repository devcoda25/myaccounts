## 2024-05-23 - [CRITICAL] Insecure Random Number Generation Fallback
**Vulnerability:** Found multiple instances where cryptographic operations (WebAuthn challenges, 2FA setup, temporary passwords) fell back to `Math.random()` if `window.crypto` failed. `Math.random()` is not cryptographically secure and predictable.
**Learning:** Developers often add `try-catch` blocks around `window.crypto.getRandomValues` to handle potential errors, but mistakenly fallback to insecure methods instead of failing securely. This pattern was copied across multiple files.
**Prevention:**
1. Centralized random number generation in `src/utils/secure-random.ts`.
2. Ensure this utility throws an error if secure randomness is unavailable, adhering to the "Fail Securely" principle.
3. Audit codebase for `Math.random()` usage in security contexts.
