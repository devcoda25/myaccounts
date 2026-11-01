## 2026-11-01 - Fix URL Validation SSRF/Open Redirect bypass
**Vulnerability:** URL validation and sanitization functions used loosely matched `.includes('evzone.com')` on the hostname and did not strip whitespace prior to parsing.
**Learning:** Using `.includes()` for hostname validation allows bypasses (e.g., `not-evzone.com` or `evzone.com.evil.com`). The `URL` constructor may also be bypassed by newline/tab injection. Also, javascript: protocol allows empty hostnames which could bypass restrictions.
**Prevention:** Always strip whitespace characters first, enforce strict protocol allowlists immediately after parsing, and use exact matching (`===`) or strict suffix matching (`.endsWith()`) for hostname validation to prevent SSRF and Open Redirect bypasses.
