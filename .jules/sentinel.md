## 2023-10-27 - [Replaced all Math.random() cryptography with window.crypto.getRandomValues]
**Vulnerability:** Weak PRNG used for IDs and tokens. `Math.random` is entirely predictable.
**Learning:** `safeRandomBytes` and many ID-generating functions were using `Math.random` as a fallback or directly, enabling potential token/ID prediction attacks.
**Prevention:** All cryptography and ID generation now mandates `window.crypto.getRandomValues`, failing closed securely if missing (except for error boundaries).
