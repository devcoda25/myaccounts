## 2026-10-17 - SSRF and Open Redirect via Loose Hostname Matching
**Vulnerability:** URL validation in `isValidUrl` and `sanitizeUrl` used `.includes('evzone.com')` and `.includes('evzone')`, allowing attackers to bypass validation using domains like `evzone.com.attacker.com` or `attacker.com/?x=evzone.com`.
**Learning:** The `URL` constructor parses domains loosely. Methods like `.includes()` on `parsed.hostname` or the full URL are dangerous for security checks, as they match partial strings or query parameters, failing to strictly validate the actual domain.
**Prevention:** Always use exact matching (`===`) or strict suffix matching (`.endsWith('.domain.com')`) on `parsed.hostname` when validating hostnames to ensure the URL points to the intended domain or its subdomains.
