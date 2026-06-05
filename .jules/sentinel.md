## 2024-06-05 - Open Redirect & SSRF Bypass via Weak Validation
**Vulnerability:** The `isValidUrl` function used `parsed.hostname.includes('evzone.com')` to validate domains, allowing an attacker to bypass it with subdomains like `evzone.com.attacker.com` or parsing bypasses.
**Learning:** Using `.includes()` on URL hostnames is insecure as it matches anywhere in the string. Furthermore, unstripped whitespace in URLs can lead to parsing inconsistencies in certain environments.
**Prevention:** Always use strict regex matching (e.g., `/^([a-z0-9-]+\.)*(evzone\.com|evzone\.app|evzonemarketplace\.com)$/i`) or strict equality (`===`) for domain validation. Strip whitespace before passing URLs to the `URL` constructor.
