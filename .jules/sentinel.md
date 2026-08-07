## 2024-08-07 - [CRITICAL] Fix URL Validation SSRF/Open Redirect
**Vulnerability:** URL validation and sanitization in `src/sanitizers/url.ts` used `.includes('evzone.com')` to check domains, which allowed bypasses via subdomains on attacker domains (e.g., `evzone.com.attacker.com`) and prefixes (e.g., `attacker-evzone.com`). Relative paths were also broken.
**Learning:** Never use `.includes()` to validate domains for security boundaries.
**Prevention:** Use strict equality (`=== 'domain.com'`) or strict suffix matching (`.endsWith('.domain.com')`) for subdomains. Always explicitly handle safe relative paths if required by the application.
