## 2026-10-27 - Prevent SSRF and Open Redirect in URL Validation
**Vulnerability:** URL hostname validation using `.includes('evzone.com')` allowed bypasses via subdomains (e.g., `evzone.com.attacker.com`) and lacked strict protocol allowlists and whitespace stripping in `sanitizeUrl`, enabling potential XSS via `javascript:` protocols.
**Learning:** The `URL` constructor parses `javascript:` protocols without error, which can bypass loose validation. Loosely matching hostnames with `.includes()` fails to properly isolate trust boundaries.
**Prevention:** Always strip whitespace characters first, enforce strict protocol allowlists (`['http:', 'https:']`) before checking hostnames, and use exact matching (`===`) or strict suffix matching (`.endsWith()`) for hostnames.
