## 2024-05-14 - Insecure Random Number Generation fallback
**Vulnerability:** The application uses `Math.random()` as a fallback for random number generation in `safeRandomBytes` and other ID generation functions. This is cryptographically insecure and predictable.
**Learning:** Using `Math.random()` in security contexts (like 2FA setup, recovery codes, and passkey authentication) can lead to predictable secrets. If `window.crypto` is unavailable, the application should fail securely rather than silently falling back to insecure generation.
**Prevention:** Always use `window.crypto.getRandomValues()` for security-sensitive random generation. If it's unavailable, throw an explicit error so the application can handle the failure state rather than continuing with insecure data.
