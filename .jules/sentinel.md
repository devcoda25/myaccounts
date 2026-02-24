# Sentinel Journal

## 2024-05-21 - Insecure Randomness Fallback
**Vulnerability:** The `safeRandomBytes` function, used for generating authentication artifacts (WebAuthn challenges, TOTP secrets, temporary passwords), contained a `try-catch` block that silently fell back to `Math.random()` if `window.crypto.getRandomValues` failed. This makes the "secure" bytes predictable in environments where crypto is missing or monkey-patched. The function was also duplicated in `src/features/auth/sign-in/Index.tsx` and `src/features/security/Security2faSetup.tsx`.

**Learning:** "Fail-safe" code often accidentally becomes "fail-open". A silent fallback to an insecure method defeats the purpose of the security control. Duplication of security logic exacerbates the issue by requiring fixes in multiple places.

**Prevention:**
1. Security primitives must **fail closed** (throw an error) if the secure method is unavailable. never fall back to insecure PRNGs.
2. Centralize all cryptographic operations in a single utility (e.g., `src/utils/helpers.ts`) and forbid local re-implementations.
3. Use linting rules or code reviews to catch usage of `Math.random()` in security contexts.
