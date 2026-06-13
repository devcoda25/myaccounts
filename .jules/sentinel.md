# Sentinel's Journal

## 2026-02-26 - Insecure Randomness in Client-Side Logic
**Vulnerability:** Weak random number generation using `Math.random()` was used for security-sensitive operations like temporary password generation, WebAuthn challenges, and 2FA secret generation. This was partly due to a `safeRandomBytes` helper falling back to `Math.random()` on error (fail open).
**Learning:** Security utilities should never silently degrade to insecure methods. If `crypto.getRandomValues` fails, the application should crash or error out ("fail closed") rather than providing predictable "random" values. Code duplication of security primitives also led to inconsistent implementations.
**Prevention:** Centralized random number generation in `src/utils/helpers.ts` to strictly require `crypto.getRandomValues` and throw if unavailable. Refactored all consumers to use this single source of truth.
