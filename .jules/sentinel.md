## 2025-02-23 - [Insecure Randomness Fallback Pattern]
**Vulnerability:** The codebase frequently implemented a `safeRandomBytes` function (or similar logic) that attempted to use `window.crypto.getRandomValues` but caught errors and silently fell back to insecure `Math.random()`. This creates a false sense of security and potential vulnerability in environments where `crypto` is missing or fails.
**Learning:** Developers often add insecure fallbacks to "prevent crashing", prioritizing availability over security even for critical functions like key generation.
**Prevention:** Centralize cryptographic utilities in a single helper. Ensure they **fail closed** (throw an error) if a secure source of randomness is unavailable, rather than falling back to an insecure one.
