## 2024-05-22 - Insecure Randomness Fallback
**Vulnerability:** Found `Math.random()` being used as a fallback when `window.crypto.getRandomValues()` throws an error in sensitive contexts like WebAuthn challenges and temporary password generation.
**Learning:** Developers often implement "fallback" logic for compatibility without realizing that in security contexts, failing safely (throwing an error) is better than continuing with insecure data. If `crypto` is missing, we cannot guarantee security, so we must stop.
**Prevention:** When implementing cryptographic features, never fallback to `Math.random()`. Explicitly check for `window.crypto` and throw a clear error if it's missing. Centralize this logic in a secure utility to prevent copy-paste errors.
