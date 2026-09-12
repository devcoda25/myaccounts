## 2026-09-12 - URL Validation SSRF and XSS Bypass
**Vulnerability:** URL validation used `.includes('evzone')` which allowed SSRF/Open Redirects via `attacker-evzone.com`. URL sanitization didn't enforce a protocol allowlist, permitting `javascript:` URIs leading to XSS.
**Learning:** The `URL` constructor allows whitespaces and `javascript:` protocols by default. Using loose substring matching like `.includes()` on hostnames creates severe bypasses.
**Prevention:** Always strip whitespaces (`/[\n\r\t]/g`) before parsing, enforce strict protocol allowlists (`['http:', 'https:', 'mailto:', 'tel:']`), and use exact match (`===`) or strict suffix match (`.endsWith()+`) for domains.
