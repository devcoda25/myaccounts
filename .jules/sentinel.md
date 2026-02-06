## 2024-10-24 - Weak Randomness Pattern
**Vulnerability:** The codebase frequently used `Math.random()` for security-sensitive operations like generating passwords, session IDs, and authentication challenges.
**Learning:** `Math.random()` is not cryptographically secure and can be predicted, making tokens and challenges vulnerable to attacks. Developers might add a fallback to `Math.random()` when `window.crypto` fails, which defeats the purpose of secure generation.
**Prevention:** Always use `window.crypto.getRandomValues()` or `window.crypto.randomUUID()`. Do not provide insecure fallbacks. Use a centralized utility like `src/utils/secure-random.ts` to ensure consistency.
