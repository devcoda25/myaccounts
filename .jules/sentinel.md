## 2024-05-22 - Weak Hostname Validation
**Vulnerability:** URL validation used `.includes('evzone.com')` allowing bypasses like `evil-evzone.com`.
**Learning:** Simple string inclusion is insufficient for domain validation. Attackers can register domains that contain the target domain string.
**Prevention:** Always use strict equality or parse the URL and check `hostname === 'domain.com' || hostname.endsWith('.domain.com')`.
