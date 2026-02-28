## 2026-02-28 - [Insecure Randomness Fallback in safeRandomBytes]
**Vulnerability:** The `safeRandomBytes` function used a fallback to `Math.random()` if `window.crypto` was unavailable, which silently generated predictable random bytes for security features like MFA setup, challenging passkeys, or generating unique IDs.
**Learning:** Fallbacks to insecure PRNGs provide a false sense of security. Cryptographic operations should strictly 'fail closed' (throw an error) instead of falling back to predictable operations.
**Prevention:** Remove `Math.random()` fallbacks in any function designed for cryptographic or security purposes, and use CSPRNG (`crypto.getRandomValues`). When generating identifiers (`generateId`), use the secure function instead of `Math.random()`.
