## 2026-09-27 - Fix Insecure URL Validation and Sanitization
**Vulnerability:** URL validation used `.includes()` which allows SSRF bypasses via subdomains (e.g., `evzone.com.attacker.com`). URL sanitization lacked a strict protocol allowlist, permitting `javascript:` URIs for XSS.
**Learning:** Never use `.includes()` for domain validation. The `URL` constructor allows arbitrary protocols like `javascript:` which must be explicitly blocked.
**Prevention:** Always enforce strict domain equality (`===`) combined with strict suffix matching (`.endsWith('.domain.com')`) for subdomains. Always validate against a strict protocol allowlist (e.g., `['http:', 'https:']`).
