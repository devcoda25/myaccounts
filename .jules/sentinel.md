## 2024-05-18 - SSRF/Open Redirect hostname validation fix
**Vulnerability:** The URL validation logic `parsed.hostname.includes('evzone.com')` allowed bypasses via malicious domains like `attacker-evzone.com` or `evzone.com.attacker.com`. It also lacked protection against whitespace bypasses.
**Learning:** Using `.includes` for hostname validation is insufficient for SSRF or Open Redirect prevention.
**Prevention:** Always use strict equality (`=== 'domain.com'`) combined with strict suffix matching (`.endsWith('.domain.com')`) for subdomains, and strip whitespace from URLs before passing them to the URL constructor.
