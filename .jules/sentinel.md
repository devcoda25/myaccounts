## 2026-11-07 - Incomplete URL Parsing Pattern
**Vulnerability:** URL constructors were used without explicitly validating protocols against an allowlist, leaving functions like `sanitizeUrl` vulnerable to XSS via `javascript:` URIs.
**Learning:** The `new URL()` constructor parses unexpected protocols like `javascript:` successfully. Failing to restrict the protocol allowlist enables XSS bypasses.
**Prevention:** Always enforce a strict protocol allowlist (e.g., `['http:', 'https:']`) immediately after parsing a URL and before performing hostname validation.
