## 2024-05-23 - Weak Randomness Fallback
**Vulnerability:** The `safeRandomBytes` function fell back to `Math.random()` when `window.crypto` was unavailable, which is cryptographically insecure.
**Learning:** Fallback mechanisms for security functions must fail securely (throw an error) rather than silently downgrading security.
**Prevention:** Use `window.crypto.getRandomValues` exclusively for security-sensitive operations and ensure no insecure fallbacks exist.
