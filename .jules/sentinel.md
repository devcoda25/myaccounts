## 2026-02-18 - Insecure Randomness Fallback Pattern

**Vulnerability:** A pervasive pattern of falling back to `Math.random()` when `window.crypto` fails was found in critical security contexts (Passkeys, 2FA, CSRF, Admin Passwords). This weakens cryptographic entropy if an environment lacks `crypto` support, potentially allowing attackers to predict secrets.

**Learning:** Developers likely copy-pasted a "safe" looking helper that included a dangerous fallback to prevent runtime errors, prioritizing availability over security. The helper function `safeRandomBytes` itself contained this flaw, misleading consumers into thinking it was secure.

**Prevention:** Enforce a "fail-secure" policy for cryptographic operations. Centralize all random number generation in `src/utils/helpers.ts` and ensure it throws an error if a secure source is unavailable. Use linting or code reviews to catch manual `Math.random()` usage in security contexts.
