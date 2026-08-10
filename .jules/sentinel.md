## 2024-08-10 - [CRITICAL] Fix SSRF / Open Redirect in URL Validation
**Vulnerability:** URL validation and sanitization relied on `.includes('evzone.com')` to verify hostnames. This allowed bypasses via malicious domains (e.g., `attacker-evzone.com` or `evzone.com.attacker.com`). Additionally, lack of whitespace stripping could allow protocol parsing bypasses.
**Learning:** Using substring matching (`.includes()`) for hostname validation is inherently insecure for SSRF and Open Redirect protections.
**Prevention:** Always use strict equality (`=== 'domain.com'`) combined with strict suffix matching (`.endsWith('.domain.com')`) for subdomains. Enforce explicit protocol whitelists and strip whitespace characters before parsing.
