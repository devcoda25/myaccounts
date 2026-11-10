## 2026-11-10 - Prevent URL Validation Bypasses and XSS via Strict Matching

**Vulnerability:** URL sanitization and validation functions used loose `.includes()` matching for hostnames (allowing `evzone.com.evil.com`) and lacked protocol allowlists, enabling Open Redirect, SSRF, and XSS (e.g., `javascript:alert(1)` in `sanitizeUrl`). Newlines and tabs were not stripped, allowing bypasses of `new URL()`.
**Learning:** Using `.includes()` for domain validation is insufficient as it matches suffixes and sub-strings incorrectly. In addition, `new URL()` happily parses `javascript:` protocols, and newline characters can cause inconsistent parsing behavior across different systems.
**Prevention:** Always use exact matching (`===`) or strict suffix matching (`.endsWith()`) for hostnames, explicitly allowlist protocols (e.g., `http:`, `https:`) before validating hostnames, and strip whitespace characters before passing URLs to constructors.
