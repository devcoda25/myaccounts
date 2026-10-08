## 2026-10-08 - [CRITICAL] Prevent XSS Bypasses in URL Sanitization
**Vulnerability:** The URL sanitizer (`sanitizeUrl`) and related functions returned potentially malicious URIs (e.g., `javascript:`) verbatim without throwing an error because they lacked strict protocol allowlists and whitespace stripping.
**Learning:** `new URL()` parses protocols like `javascript:` without failing, creating severe XSS bypass vulnerabilities.
**Prevention:** Always strip whitespace characters first and enforce a strict protocol allowlist (e.g. `['http:', 'https:']`) explicitly before performing any hostname validation or returning the parsed URL.
