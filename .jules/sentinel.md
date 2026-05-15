## 2024-05-18 - [Secure Randomness Fallback Pattern]
**Vulnerability:** Weak randomness using Math.random() as a fallback for window.crypto.
**Learning:** Fallbacks for cryptographic operations must fail closed to prevent predictable values being used for security tokens, passwords, and identifiers.
**Prevention:** Always throw an error if secure randomness APIs are unavailable. Do not provide insecure fallbacks.
