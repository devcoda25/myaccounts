## 2024-05-22 - Secure Random Number Generation
**Vulnerability:** Found multiple instances of `window.crypto.getRandomValues()` falling back to `Math.random()` in `catch` blocks. This compromises the security of generated secrets, passwords, and 2FA codes.
**Learning:** Developers often copy-paste "safe" looking code without understanding the implications of the fallback. `Math.random()` is not cryptographically secure and should never be used for security-critical values.
**Prevention:** Centralized random number generation in `src/utils/secure-random.ts` which strictly throws an error if `window.crypto` is unavailable, removing the temptation to add insecure fallbacks.
