
## 2024-05-24 - Insecure Randomness Fallback Removed
**Vulnerability:** Security-sensitive random generation functions fallback to `Math.random()`.
**Learning:** This breaks fail-secure principles and provides a false sense of security.
**Prevention:** Fail securely by throwing errors when `window.crypto` is unavailable instead of falling back.
