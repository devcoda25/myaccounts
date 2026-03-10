# Sentinel's Journal - Critical Learnings

## 2026-02-10 - Insecure Randomness in Auth Challenges
**Vulnerability:** Found insecure fallback to `Math.random()` in WebAuthn challenge generation (`src/features/auth/sign-in` and `passkey`).
**Learning:** The codebase attempted to polyfill `window.crypto` with insecure randomness, which compromises challenge uniqueness and allows replay attacks.
**Prevention:** Enforced strict usage of `window.crypto` via `src/utils/secure-random.ts`, throwing errors if unavailable instead of falling back to insecure PRNG.

## 2026-02-10 - Incomplete URL Sanitization
**Vulnerability:** `src/sanitizers/url.ts:sanitizeUrl` allows `javascript:` protocol if domain is not `evzone`.
**Learning:** Sanitizer logic focuses on upgrading `http` to `https` for internal domains but fails to block dangerous protocols for external URLs, creating XSS risk.
**Prevention:** Explicitly validate protocol against an allowlist (e.g. `http:`, `https:`, `mailto:`) before returning the URL.
