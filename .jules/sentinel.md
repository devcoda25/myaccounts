## 2024-05-19 - URL validation bypass via `includes()`

**Vulnerability:** Weak URL validation bypassing in `sanitizers/url.ts`. Validation methods checking the `hostname` of a `URL` object used `.includes('evzone.com')`.

**Learning:** This approach is inherently vulnerable to SSRF and Open Redirect bypasses. If an attacker controls the hostname, they can append `.attacker.com` to an allowed domain (e.g., `evzone.com.attacker.com`), which bypasses the `.includes()` check.

**Prevention:** Always use strict regex matching (e.g., `/^([a-z0-9-]+\.)*(evzone\.com|evzone\.app|evzonemarketplace\.com)$/i.test(hostname)`) instead of string inclusion methods like `.includes()` when validating parsed URLs or domains against an allowlist to prevent arbitrary domain manipulation.
