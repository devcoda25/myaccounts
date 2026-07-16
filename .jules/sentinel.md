## 2025-02-18 - [CRITICAL] Open Redirect via Weak URL Validation in Authentication Flows
**Vulnerability:** Weak URL validation logic `parsed.hostname.includes('evzone.com')` allowed bypassing redirect checks by using subdomains or paths like `evzone.com.malicious.com`, leading to Open Redirect and potential Server-Side Request Forgery (SSRF). Direct `window.location.href = redirectUri` assignments occurred in multiple authentication endpoints (`/auth/continue`, `/auth/signed-out`) without robust validation or fallback routing.
**Learning:** Checking hostnames with `.includes()` or naive string matching is insecure. It allows trivial bypasses (e.g. attacker-controlled subdomains). Furthermore, using `window.location.href` directly with untrusted input can easily break client-side navigation security boundaries and should be fortified with strict domain allowlists and graceful fallback routing logic (e.g. `navigate('/app')`).
**Prevention:**
1. Use exact matches (`===`) or strict suffix checks (`.endsWith('.domain.com')`) for hostname validation.
2. Ensure URL sanitization strips newline/tab characters (`/[\n\r\t]/g`) before validation.
3. Explicitly allow safe relative client-side paths (`/`) to preserve internal routing without throwing `TypeError`.
4. Wrap any dynamic or user-supplied assignment to `window.location.href` in a strict validation check (`isValidUrl`) with an internal fallback routing (`navigate`).
