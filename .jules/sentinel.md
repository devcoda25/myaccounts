## 2026-08-30 - [CRITICAL] Fix XSS and SSRF in URL sanitization
**Vulnerability:** URL validation and sanitization utilities allowed XSS via `javascript:` URIs and SSRF/Open Redirect via `.includes('domain.com')` hostname checks, which permitted domains like `attacker-domain.com`.
**Learning:** Using `URL` constructor without a strict protocol allowlist permits `javascript:` URIs to be parsed as valid. `.includes()` is unsafe for hostname validation.
**Prevention:** Always strip whitespace, allowlist protocols explicitly (e.g., `['http:', 'https:']`), and use exact match (`===`) or strict suffix match (`.endsWith()-`) for subdomains before evaluating the hostname. Allow safe relative paths explicitly to prevent breaking client-side routing.
