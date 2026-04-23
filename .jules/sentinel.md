## 2024-04-01 - Insecure Random Number Fallbacks
**Vulnerability:** Several cryptographic functions (`safeRandomBytes`, `generateId`, and Passkey challenge generation) contained silent fallbacks to `Math.random()` when `window.crypto` was unavailable.
**Learning:** `Math.random()` is not cryptographically secure and can lead to predictable IDs, recovery codes, challenges, or secrets. Falling back to an insecure algorithm silently is a severe security risk because developers are unaware that the system failed open to a less secure state.
**Prevention:** Always fail closed securely by throwing an Error when cryptographically secure random number generation (`window.crypto.getRandomValues` or `window.crypto.randomUUID`) is unavailable.
