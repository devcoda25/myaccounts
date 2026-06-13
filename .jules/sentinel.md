## 2024-03-23 - [Insecure Randomness Fallback]
**Vulnerability:** Weak pseudo-random number generator `Math.random()` was being used as a fallback for missing `window.crypto` across multiple modules for generating critical unique identifiers and passwords.
**Learning:** This widespread pattern compromised security by using a predictable RNG if the system environment failed to provide cryptographic functions.
**Prevention:** Remove `Math.random()` completely and fail securely by explicitly throwing an error whenever secure cryptographic modules are not available in the environment.
