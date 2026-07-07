## 2024-05-15 - Open Redirect / SSRF bypass via naive includes() check
**Vulnerability:** The `isValidUrl` sanitization function used `parsed.hostname.includes('evzone.com')` to validate if a URL is safe. This can be easily bypassed by domains like `evzone.com.attacker.com` leading to open redirects and SSRF.
**Learning:** Using `includes()` or `endsWith()` on hostnames without strictly parsing the TLD/domain boundary allows for simple bypasses where an attacker registers a malicious domain that merely contains the target string.
**Prevention:** Always use strict regex matching (e.g. `/^([a-z0-9-]+\.)*(evzone\.com|evzone\.app|evzonemarketplace\.com)$/i`) or strict equivalence checks for URL and domain validation to ensure only correctly scoped domains are trusted.
