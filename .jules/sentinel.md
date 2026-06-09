## 2026-06-09 - [CRITICAL] Prevent Open Redirects via window.location.href assignment

**Vulnerability:** Unvalidated user-supplied inputs (like the `redirect_uri` query parameter) were directly assigned to `window.location.href` in authentication flow components such as `/auth/continue/Index.tsx` and `/auth/signed-out/Index.tsx`. This allows an attacker to create malicious links that look like legitimate application URLs but redirect the user to a malicious site (Open Redirect), potentially stealing credentials or distributing malware.

**Learning:** While the application had an `isValidUrl` utility in `src/sanitizers/url.ts` that correctly verified the host against trusted domains (like `evzone.com`), it was not consistently used across all components. Developers often rely on React Router's `navigate` for internal routing, but when crossing domain boundaries or returning to external apps (like OIDC return flows), direct `window.location.href` assignment is used and must be explicitly validated at the point of assignment.

**Prevention:** Always validate dynamic or user-supplied URLs using a strict domain allowlist (like the `isValidUrl` utility) before assigning them to `window.location.href`. If validation fails, provide a safe fallback using internal routing (e.g., `navigate("/app")`) instead of proceeding with the external redirect.
