## 2025-05-18 - [Insecure Randomness Fallback]
**Vulnerability:** Multiple critical security features (2FA setup, WebAuthn, password generation) utilized `Math.random()` as a fallback when `window.crypto` was unavailable or failed. `Math.random()` is not cryptographically secure and predictable, potentially allowing attackers to predict challenges, secrets, or temporary passwords.
**Learning:** Developers often add "resilience" by falling back to insecure methods when secure ones fail. In security contexts, "failing closed" (throwing an error) is safer than "failing open" (proceeding insecurely).
**Prevention:**
1. Centralize secure random number generation in a single utility (`safeRandomBytes`).
2. Explicitly throw errors when secure entropy sources are unavailable.
3. Audit codebases for `Math.random()` usage in security-sensitive contexts.
