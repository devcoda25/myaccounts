## 2024-05-24 - Weak Random Number Generation Pattern
**Vulnerability:** Found multiple instances of `safeRandomBytes` using `Math.random()` as a fallback when `window.crypto` is unavailable. `Math.random()` is not cryptographically secure.
**Learning:** Developers might copy-paste helper functions without verifying their security properties or realizing the fallback is insecure.
**Prevention:** Centralized the `safeRandomBytes` utility in `src/utils/helpers.ts` with a "fail closed" approach (throwing error instead of insecure fallback) and refactored consumers to use this single source of truth.
