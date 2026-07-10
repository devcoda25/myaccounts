## 2024-05-24 - Strict Domain Validation for URL Parsers
**Vulnerability:** Open Redirect / SSRF bypass via URL parsing inconsistencies. The `.includes('evzone.com')` check could be bypassed by `https://evzone.com.attacker.com` or `javascript:alert(1)//evzone.com`.
**Learning:** `new URL()` does not throw on `javascript:` protocol and leaves the hostname empty. Relying on `.includes()` for hostname validation allows domain suffix bypasses.
**Prevention:** Always strip whitespace first. Ensure protocol is within an explicit allowlist before checking hostname. Use strict Regex `/^([a-z0-9-]+\.)*(domain\.com)$/i` or `===` for hostname validation. Ensure relative paths (`url.startsWith('/')`) are handled safely when `new URL()` is used.
