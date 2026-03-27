# Sentinel's Journal

## 2024-05-22 - [Insecure Fallback in Random Generation]
**Vulnerability:** Multiple instances of `safeRandomBytes` and `mkTempPassword` functions contained a `try-catch` block that silently fell back to `Math.random()` if `window.crypto.getRandomValues()` failed. This compromised cryptographic security (e.g., for passwords and WebAuthn challenges) without warning.
**Learning:** Helper functions named "safe" or "secure" must be audited to ensure they don't degrade security for the sake of availability (e.g., using insecure fallbacks to prevent crashes).
**Prevention:** Always throw an error if a cryptographic primitive is unavailable. Never fallback to a non-cryptographic RNG (like `Math.random`) for security-critical operations.
