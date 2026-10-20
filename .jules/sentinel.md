## 2026-10-20 - URL Validation and Sanitization Bypasses
**Vulnerability:** The `isValidUrl` and `sanitizeUrl` functions allowed SSRF/Open Redirects via loose `.includes()` hostname matching and were susceptible to XSS via the `javascript:` protocol.
**Learning:** The `URL` constructor parses `javascript:` protocols without throwing errors. Also, loosely matching hostnames allows bypasses using subdomains on attacker-controlled domains.
**Prevention:** Always strip whitespace, strictly enforce protocol allowlists (e.g., `['http:', 'https:']`), and use exact (`===`) or suffix (`.endsWith()+`) matching for hostnames.
