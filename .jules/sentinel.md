## 2026-09-27 - Fix URL sanitization bypasses (SSRF and XSS)
**Vulnerability:** The `isValidUrl` and `sanitizeUrl` functions allowed SSRF bypasses via loose `.includes('evzone.com')` matching (e.g., `attacker-evzone.com`) and XSS via `javascript:` protocols due to missing protocol allowlists in `sanitizeUrl`. Additionally, whitespace before the protocol allowed parsing bypasses.
**Learning:** The `URL` constructor parses `javascript:` protocols without throwing an error, and `.includes()` is dangerous for hostname validation as it allows attacker-controlled prefixes/suffixes.
**Prevention:** Always strip whitespace before parsing URLs, enforce a strict protocol allowlist (`['http:', 'https:']`), and use strict equality (`===`) or `.endsWith()` for subdomains when validating hostnames.
