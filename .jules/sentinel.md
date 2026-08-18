## 2024-05-24 - SSRF and Open Redirect in URL Validation
**Vulnerability:** The `isValidUrl` and `sanitizeUrl` functions used `.includes('evzone.com')` for hostname validation, allowing bypasses via domains like `attacker-evzone.com`. They also lacked strict protocol validation, allowing `javascript:` URLs and missing handling for safe relative paths and whitespace.
**Learning:** Using `.includes()` for domain validation is dangerous and can lead to SSRF or Open Redirects. URL validation must enforce strict equality or suffix matching for subdomains, strictly allowlist protocols, and sanitize input whitespace.
**Prevention:** Always use `===` for exact domain matches and `.endsWith('.domain.com')` for subdomains. Enforce explicit protocol allowlists and strip whitespace before validation.
