## 2025-02-15 - Strict Domain Matching for URL Validation
**Vulnerability:** Open Redirect and SSRF risk due to weak URL validation (`parsed.hostname.includes('evzone.com')`). An attacker could bypass the check using domains like `attacker-evzone.com` or `evzone.com.attacker.com`.
**Learning:** Using `.includes()` for domain validation is insufficient as it allows partial matches anywhere in the hostname.
**Prevention:** Always use strict equality (`=== 'domain.com'`) combined with strict suffix matching (`.endsWith('.domain.com')`) for subdomains to ensure the hostname is fully trusted.
