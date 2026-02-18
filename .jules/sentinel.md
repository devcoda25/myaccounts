## 2024-05-21 - Insecure Randomness Fallback Pattern
**Vulnerability:** Multiple components (Auth, 2FA, Admin) implemented local versions of `safeRandomBytes` that fell back to `Math.random()` if `window.crypto` failed, creating predictable secrets in some environments.
**Learning:** Developers likely copy-pasted a 'safe' helper without realizing the fallback made it unsafe for cryptographic contexts. The fallback was intended to prevent crashes but compromised security.
**Prevention:** Centralize security-critical functions in `src/utils/helpers.ts`. Ensure they fail securely (throw error) rather than failing open (using insecure fallback).
