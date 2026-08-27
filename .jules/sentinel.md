## 2026-08-27 - [Insecure Hostname Validation via Substring Matching]
**Vulnerability:** The `isValidUrl` and `sanitizeUrl` functions used `.includes('evzone.com')` and `.includes('evzone')` for hostname validation, allowing SSRF and Open Redirect bypasses via maliciously crafted domains (e.g., `attacker-evzone.com` or `evzone.com.attacker.com`).
**Learning:** Using substring matching for URL hostnames is an insecure pattern that fails to account for subdomain boundaries and exact domain matching.
**Prevention:** Always use strict equality (`===`) for exact domain matching combined with strict suffix matching (`.endsWith('.domain.com')`) to validate subdomains.
