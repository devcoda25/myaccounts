## 2024-06-18 - [Fix Open Redirects in Auth Flows]
**Vulnerability:** Open Redirect vulnerability via `redirect_uri` in `/auth/continue` and `/auth/signed-out` components.
**Learning:** Assigning `window.location.href = redirectUri` directly from query parameters without strict validation allows attackers to redirect users to malicious domains, potentially bypassing authentication boundaries or phishing.
**Prevention:** Always validate dynamic URLs against an allowlist using `isValidUrl(redirectUri)` before redirection. Provide a safe fallback (e.g., `navigate('/app')`) if the validation fails.
