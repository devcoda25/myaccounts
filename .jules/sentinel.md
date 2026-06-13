
## 2024-04-18 - Fix SSRF and Open Redirect in URL Validation
**Vulnerability:** The `isValidUrl` function in `src/sanitizers/url.ts` used `.includes('evzone.com')` to check if a domain was trusted. This was vulnerable to Server-Side Request Forgery (SSRF) and Open Redirect attacks because an attacker could use a domain like `evzone.com.attacker.com` to bypass the validation. Also, several authentication flows assigned user-controlled parameters (`redirect_uri`) directly to `window.location.href` without validation.
**Learning:** Using `.includes()` for domain validation is insecure and easily bypassed. It must be paired with strict suffix matching (e.g. `.endsWith()`) or exact matching.
**Prevention:** Always validate domains using exact matching (`===`) or strict suffix matching (`.endsWith('.domain.com')`) against a trusted allowlist. Apply this validation to any user-controlled URL before redirecting via `window.location.href`.
