## 2024-10-24 - Insecure Random Number Generation Fallbacks
**Vulnerability:** Found `mkTempPassword` and `safeRandomBytes` falling back to `Math.random()` when `window.crypto` throws an error.
**Learning:** Developers often add fallbacks to prevent crashes, but for security primitives, failing securely (crashing) is better than falling back to weak cryptography.
**Prevention:** Use a centralized secure random utility that throws an error if a secure source is unavailable. Never use `Math.random()` for passwords, tokens, or challenges.
