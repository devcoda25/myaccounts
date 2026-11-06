## 2026-11-06 - Prevent SSRF via Strict Hostname Matching
**Vulnerability:** The `isValidUrl` and `sanitizeUrl` functions used loosely matched domains, which allows bypassing checks with domains like `evzone.com.attacker.com` or `attacker-evzone.com`. Additionally, unstripped whitespace in URLs could allow injection bypasses when parsed.
**Learning:** Loosely matching domains using `.includes()` is a critical security vulnerability for SSRF and Open Redirects. The `URL` constructor does not automatically prevent all whitespace injection attacks.
**Prevention:** Always use exact matching (`===`) or strict suffix matching (`.endsWith('.domain.com')`) for hostname validation. Ensure whitespace is stripped (`url.replace(/[\n\r\t]/g, '').trim()`) before passing user input to `new URL()`.
