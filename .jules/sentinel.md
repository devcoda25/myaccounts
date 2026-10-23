## 2026-10-23 - Fix URL Validation SSRF/XSS Bypass
**Vulnerability:** URL validation and sanitization functions used loose `.includes()` matching for hostnames and did not enforce a protocol allowlist prior to hostname evaluation, allowing SSRF/Open Redirects (e.g., `maliciousevzone.com`) and potential XSS via `javascript:` URLs.
**Learning:** The `URL` constructor parses `javascript:` URLs without errors and `.includes()` is overly permissive for hostname validation, leading to security bypasses. Unstripped whitespace can also bypass standard URL parsing.
**Prevention:** Always strip whitespace characters first, strictly enforce protocol allowlists (e.g., `['http:', 'https:']`) before further processing, and use exact (`===`) or strict suffix (`.endsWith()-`) matching for hostnames.
