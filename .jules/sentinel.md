## 2023-11-08 - [Domain Validation SSRF/Open Redirect]
**Vulnerability:** Weak domain validation using `.includes('evzone.com')` allowed Open Redirect and SSRF bypasses via malicious subdomains like `evzone.com.attacker.com` and javascript protocol injection.
**Learning:** Naively checking for strings within hostnames or ignoring protocols on dynamically parsed URLs creates significant bypass opportunities when handling redirects or fetches.
**Prevention:** Always use strict regular expressions (`^([a-z0-9-]+\.)*(evzone\.com|...)$/i`) or exact matches (`===`) for domains and enforce an explicit protocol allowlist when validating URLs.
