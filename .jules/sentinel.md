## 2026-02-24 - [Insecure Randomness Fallback]
**Vulnerability:** The application was falling back to `Math.random()` when `window.crypto` was unavailable in `safeRandomBytes`, creating a false sense of security for critical operations like password generation and authentication challenges.
**Learning:** Security utilities must fail closed (throw an error) rather than degrade to insecure behavior silently. The existence of a "safe" function name doesn't guarantee implementation safety.
**Prevention:** Audit all randomness generation to ensure it uses `crypto.getRandomValues` exclusively and throws if unavailable. Centralize this logic to prevent local re-implementations.
