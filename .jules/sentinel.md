## 2026-02-21 - Insecure Randomness Fallback Pattern
**Vulnerability:** Found multiple implementations of `safeRandomBytes` that silently fell back to insecure `Math.random()` when `window.crypto` was unavailable. This compromised TOTP secrets and Passkey challenges.
**Learning:** Developers prioritized feature availability over security failure, assuming `Math.random()` was an acceptable fallback. This is a common pattern when migrating from non-secure to secure contexts.
**Prevention:** Centralized random number generation in `src/utils/helpers.ts` and configured it to throw an error if secure randomness is unavailable. Never polyfill security primitives with insecure alternatives.
