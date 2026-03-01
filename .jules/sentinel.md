## 2024-05-20 - [Insecure Randomness Fallbacks]
**Vulnerability:** Found `safeRandomBytes` implementations failing open by falling back to `Math.random()` when `window.crypto` is unavailable, potentially allowing predictable passkey challenges and 2FA recovery codes.
**Learning:** This repo has duplicate local implementations of utility functions like `safeRandomBytes` across different components (`Index.tsx`, `Security2faSetup.tsx`, `helpers.ts`), meaning a security flaw in a common helper might be duplicated.
**Prevention:** Avoid duplicating secure generation code. Ensure that cryptographically secure functions "fail closed" (throw an error) rather than silently falling back to insecure alternatives like `Math.random()`. Use standard `crypto.getRandomValues()` consistently.
