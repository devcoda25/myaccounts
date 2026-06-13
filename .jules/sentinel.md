# Sentinel's Journal

## 2026-02-14 - [Insecure Randomness Fallback]
**Vulnerability:** The `safeRandomBytes` function contained a fallback to `Math.random()` when `window.crypto` was unavailable. This provided weak, predictable randomness for security-critical operations like WebAuthn challenges and TOTP secret generation.
**Learning:** Functions named "safe" or "secure" must fail securely rather than degrade gracefully to insecure methods. Developers might rely on the function name and assume cryptographic strength.
**Prevention:** Always throw an error if the required cryptographic primitive is unavailable. Use linter rules to flag `Math.random()` usage in security contexts.
