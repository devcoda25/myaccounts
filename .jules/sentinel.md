## 2024-07-20 - SSRF and Open Redirect in URL Validation
**Vulnerability:** The `isValidUrl` function used `.includes('evzone.com')` for domain validation, allowing bypasses with domains like `evzone.com.attacker.com` or `attacker-evzone.com`.
**Learning:** `URL.hostname.includes()` is insufficient for security boundaries and allows trivial SSRF and Open Redirect vulnerabilities.
**Prevention:** Always use strict equality (`=== 'domain.com'`) or strict suffix matching (`.endsWith('.domain.com')`) for subdomains when validating hostnames against an allowlist.
