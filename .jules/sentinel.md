## 2024-05-22 - Silent Failover to Insecure Randomness
**Vulnerability:** Found multiple instances of `safeRandomBytes` catching errors from `window.crypto.getRandomValues` and silently falling back to `Math.random()`. This creates a false sense of security where the application appears to be using secure randomness but might be using a weak PRNG in some environments.
**Learning:** Developers often add fallbacks to prevent crashes, but for security primitives (like randomness), a crash is safer than a silent downgrade to insecure behavior.
**Prevention:** Strictly enforce `window.crypto` availability. If it's missing, the application should fail fast rather than proceed with insecure values.
