## 2026-09-09 - [CRITICAL/HIGH] Fix SSRF and Open Redirect vulnerability in URL validation
**Vulnerability:** URL validation used `.includes('domain.com')` for hostname checks, allowing bypasses via malicious domains like `domain.com.attacker.com`.
**Learning:** Never use `.includes()` for hostname validation in SSRF or Open Redirect prevention.
**Prevention:** Use strict equality (`===`) or strict suffix matching (`.endsWith('.domain.com')`) for subdomains.
