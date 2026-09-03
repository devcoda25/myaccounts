## 2026-09-03 - Prevent SSRF/Open Redirects via strict hostname validation
**Vulnerability:** URL validation used `.includes('evzone.com')` which allows bypasses via malicious domains (e.g., `attacker-evzone.com` or `evzone.com.attacker.com`).
**Learning:** Never use `.includes()` for domain validation, as it does not enforce domain boundaries and permits SSRF or Open Redirect attacks.
**Prevention:** Always use strict equality (`=== 'evzone.com'`) combined with strict suffix matching (`.endsWith('.evzone.com')`) for subdomains to securely validate hostnames.
