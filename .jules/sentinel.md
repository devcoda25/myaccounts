## 2026-10-12 - URL Validation Bypass and XSS
**Vulnerability:** Weak URL validation using `.includes()` allowed hostname bypasses, and the `javascript:` protocol allowed XSS bypasses because it was not explicitly blocked before parsing hostnames.
**Learning:** The URL constructor parses the `javascript:` protocol without throwing an error, often resulting in an empty hostname. Validating hostnames without enforcing a strict protocol allowlist first allows bypasses.
**Prevention:** Always strip whitespace characters first, enforce a strict protocol allowlist (e.g., `['http:', 'https:']`) explicitly before performing hostname validation, and use exact matching or `.endsWith()` for domain validation.
