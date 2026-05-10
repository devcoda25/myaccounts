
## 2024-05-10 - Strict Validation for URL Checking
**Vulnerability:** Weak domain validation in `isValidUrl` allowed bypasses (`.includes('evzone.com')` matches `evzone.com.attacker.com`). `sanitizeUrl` also failed to block dangerous protocols like `javascript:`.
**Learning:** Checking sub-strings of URLs directly on hostnames is prone to SSRF and Open Redirect bypasses. Standard sanitization must explicitly specify an allowed protocol allowlist to prevent XSS.
**Prevention:** Use exact domain matching (`===`) or strict suffixes (`.endsWith()`) for domains. Check `parsed.protocol` explicitly against an allowlist such as `['http:', 'https:']` to discard dangerous schemes.
