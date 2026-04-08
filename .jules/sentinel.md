## 2024-05-22 - Silent Insecure Randomness Fallback

**Vulnerability:** The application used `Math.random()` as a silent fallback when `window.crypto.getRandomValues()` failed, which is not cryptographically secure for generating 2FA secrets and WebAuthn challenges.

**Learning:** Developers might add try/catch blocks around browser APIs for robustness without realizing they are compromising security. In security contexts, it is better to crash (fail secure) than to proceed with weak security.

**Prevention:** Always ensure cryptographic operations fail loudly if a secure source of randomness is unavailable. Use linters or code reviews to catch `Math.random()` usage in security-sensitive contexts.
