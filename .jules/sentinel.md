## 2026-10-18 - [URL Validation SSRF and XSS]
**Vulnerability:** URL validation used `.includes()` for hostname checks (allowing evzone.com.evil.com) and `sanitizeUrl` lacked a protocol allowlist (allowing javascript: URLs).
**Learning:** `.includes()` is insecure for hostname validation. The URL constructor permits javascript: protocols which bypass standard hostname checks.
**Prevention:** Always use exact matching (`===`) or strict suffix matching (`.endsWith()`) for hostnames, and enforce explicit protocol allowlists (e.g., `['http:', 'https:']`).
