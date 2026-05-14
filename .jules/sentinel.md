## 2024-05-22 - [Insecure Randomness Fallback]
**Vulnerability:** The application was using `Math.random()` as a fallback for cryptographic operations when `window.crypto` was unavailable. This is insecure as `Math.random()` is not cryptographically strong.
**Learning:** Security-critical functions like random number generation should fail loudly (throw an error) rather than silently degrade to insecure implementations.
**Prevention:** Always use `window.crypto.getRandomValues` for security-sensitive operations. Ensure that fallback mechanisms do not compromise security. Use a centralized helper like `safeRandomBytes` to enforce this policy.
