## 2026-02-20 - [Insecure Randomness Fallback]
**Vulnerability:** The `safeRandomBytes` utility function was implemented in multiple places (`src/utils/helpers.ts`, `src/features/auth/sign-in/Index.tsx`, `src/features/security/Security2faSetup.tsx`) and silently fell back to `Math.random()` when `window.crypto` was unavailable. This compromised security for 2FA secrets and auth challenges.
**Learning:** Security-critical functions should not have silent fallbacks to insecure methods. Centralization is key to preventing divergent, insecure implementations.
**Prevention:** Always use centralized security utilities. Ensure `safeRandomBytes` throws an error if a secure source is unavailable.
