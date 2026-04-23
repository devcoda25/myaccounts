## 2024-05-24 - [Weak Random Number Generation]
**Vulnerability:** Identified multiple instances of `Math.random()` being used for security-sensitive operations (temporary passwords, invite codes) and insecure local implementations of random byte generation with weak fallbacks.
**Learning:** Developers often default to `Math.random()` for convenience or copy-paste local implementations that include insecure fallbacks (like using `Math.random()` when `crypto` is unavailable) to avoid crashes, compromising security.
**Prevention:** Enforced a centralized `safeRandomBytes` utility in `src/utils/helpers.ts` that uses `crypto.getRandomValues()` and explicitly throws an error if a secure source is unavailable (Fail Closed), preventing silent security downgrades.
