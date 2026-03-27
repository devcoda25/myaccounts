## 2026-02-17 - Weak Random Number Generation Fallbacks

**Vulnerability:** The codebase contained multiple instances of `safeRandomBytes` (and similar inline logic) that silently fell back to `Math.random()` if `window.crypto.getRandomValues` was unavailable or failed. `Math.random()` is not cryptographically secure and should not be used for security-sensitive operations like WebAuthn challenges, 2FA secrets, or temporary passwords.

**Learning:** Developers often add fallbacks to prevent crashes, but for security primitives, a "fail open" or insecure fallback is worse than a crash. If a security requirement (like CSPRNG) cannot be met, the operation must fail securely.

**Prevention:** Use a centralized helper for security primitives that strictly enforces requirements. Do not implement insecure fallbacks for cryptographic operations. If `window.crypto` is missing, throw an error.
