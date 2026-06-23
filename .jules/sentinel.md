## 2025-03-09 - [Open Redirect / SSRF Domain Validation Fix]
**Vulnerability:** URL validation utility `isValidUrl` used `parsed.hostname.includes('evzone.com')`, enabling attackers to bypass domain checks using subdomains like `evzone.com.attacker.com`.
**Learning:** Checking for domain inclusion using `.includes()` string matching allows malicious domains that contain the target string as a substring.
**Prevention:** Always use strict regex matching like `/^([a-z0-9-]+\.)*(evzone\.com|evzone\.app|evzonemarketplace\.com)$/i` or strict equality `===` when validating domain origin.
