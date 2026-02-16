## 2024-05-23 - [Insecure Randomness Fallback]
**Vulnerability:** Multiple components implemented a local `safeRandomBytes` function that silently fell back to `Math.random()` if `window.crypto` was unavailable. `Math.random()` is not cryptographically secure and predictable.
**Learning:** Developers often prioritize functionality over security in edge cases. The fallback was likely added to support environments without `crypto` (like old tests or SSR) but compromised security in production.
**Prevention:** Consolidate cryptographic primitives in a single utility. Fail securely (throw error) rather than silently downgrading to weak randomness. Ensure test environments support necessary APIs (`window.crypto`).
