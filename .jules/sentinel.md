## 2026-10-31 - [SSRF/Open Redirect Bypass via Loose Hostname Validation]
**Vulnerability:** URL validation and sanitization functions used loosely matched `.includes('evzone.com')` on `parsed.hostname`, allowing malicious domains like `evzone.com.evil.com` to bypass checks.
**Learning:** Always use exact matching (`===`) or strict suffix matching (`.endsWith()`) for hostnames, and strip whitespace characters before parsing to prevent newline/tab injection bypasses.
**Prevention:** Enforce strict allowlists for protocols and exact/suffix matches for hostnames, avoiding partial match methods like `.includes()`.
