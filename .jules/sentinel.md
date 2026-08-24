## 2026-08-24 - Fix URL Validation SSRF/Open Redirect
**Vulnerability:** The `isValidUrl` and `sanitizeUrl` functions were using loose `.includes('evzone.com')` matching and lacking whitespace sanitization, allowing bypasses like `https://evzone.com.attacker.com` or `javascript:alert(1)//evzone.com`.
**Learning:** Using `.includes()` for domain validation allows SSRF and Open Redirect bypasses via subdomains or appended domain names. Protocol validation must precede domain validation.
**Prevention:** Use strict equality (`===`) and strict suffix matching (`.endsWith('.domain.com')`) for subdomains. Always strip whitespace to prevent injection and explicitly enforce a protocol allowlist before evaluating the hostname.
