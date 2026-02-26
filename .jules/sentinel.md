## 2026-02-21 - [Insecure Randomness Fallback Pattern]
**Vulnerability:** Found multiple instances of `safeRandomBytes` falling back to `Math.random()` when `window.crypto` fails. This is critical for security features like 2FA secrets and WebAuthn challenges.
**Learning:** Developers likely copied this pattern assuming it was a safe fallback, not realizing it undermines the security of the feature.
**Prevention:** Centralize security-critical functions in a single utility file. Fail closed (throw error) rather than failing open (using insecure fallback) when cryptographic primitives are unavailable.
