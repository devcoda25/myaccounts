## 2026-09-24 - Insecure URL Validation Bypass
**Vulnerability:** URL validation and sanitization functions used `.includes('evzone.com')` to verify the hostname, which allows bypasses via malicious domains like `evzone.com.attacker.com` or `attacker.com/?evzone.com`. Additionally, `sanitizeUrl` used `.includes('evzone')` without protocol validation before checking.
**Learning:** Using `.includes()` for hostname validation allows trivial Server-Side Request Forgery (SSRF) and Open Redirect bypasses.
**Prevention:** Always use strict equality (`=== 'domain.com'`) combined with strict suffix matching (`.endsWith('.domain.com')`) for subdomains, and enforce a strict protocol allowlist (`['http:', 'https:']`) after stripping whitespaces.
