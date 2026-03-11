## 2024-05-23 - [Insecure Randomness Fallback Pattern]
**Vulnerability:** Multiple components (Auth, 2FA, Admin) implemented local versions of `safeRandomBytes` that silently fell back to `Math.random()` if `window.crypto` was unavailable. `Math.random()` is not cryptographically secure and predictable.
**Learning:** Developers likely copy-pasted a "safe" helper that wasn't actually safe for security contexts. Fallbacks should be explicit or fail loudly for security-critical operations.
**Prevention:** Consolidate `safeRandomBytes` into a single utility that throws an error if a secure source is unavailable. Lint against `Math.random()` usage in security contexts.
