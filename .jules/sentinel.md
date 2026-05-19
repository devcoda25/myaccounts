## 2024-05-23 - URL Sanitizer Open Redirect & SSRF
**Vulnerability:** The `isValidUrl` function in `src/sanitizers/url.ts` uses `.includes('evzone.com')` to validate hostnames, which allows bypasses via subdomains like `evzone.com.attacker.com`.
**Learning:** Naive substring matching for domain validation is insufficient and leads to Open Redirects when the URL is used for `window.location.href`.
**Prevention:** Always use strict regex matching (e.g., `/^([a-z0-9-]+\.)*(evzone\.com|evzone\.app|evzonemarketplace\.com)$/i`) or exact string comparison for URL host validation.
