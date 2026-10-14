## 2026-10-14 - URL Sanitization SSRF and XSS Vulnerabilities
**Vulnerability:** The `isValidUrl` and `sanitizeUrl` functions in `src/sanitizers/url.ts` use the loosely matched `.includes()` method for domain validation, which allows SSRF and Open Redirect bypasses (e.g. `evzone.com.attacker.com`). Also lack of strict protocol allowlist and whitespace stripping leads to potential XSS through `javascript:` URLs.
**Learning:** Always use exact matching (`===`) or strict suffix matching (`.endsWith()` with a dot) for domain validation, and explicitly strip whitespace and check protocols against an allowlist before using parsed `URL` properties.
**Prevention:** Avoid loosely matched string methods for domain validation and enforce rigorous URL parsing patterns.
