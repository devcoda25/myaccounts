## 2024-10-25 - Weak Random Number Generation
**Vulnerability:** `safeRandomBytes` function used `Math.random()` as a fallback when `window.crypto` was unavailable. This is not cryptographically secure and could lead to predictable secrets (e.g. 2FA setups, temp passwords).
**Learning:** Avoid silent fallbacks to insecure methods in security-critical functions. It is better to fail (throw error) than to return insecure data that looks secure.
**Prevention:** Always use `window.crypto.getRandomValues` for security operations. Explicitly throw errors if the secure source is unavailable. Centralize this logic in a single helper function.
