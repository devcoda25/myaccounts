## 2025-02-13 - Fix SSRF and Open Redirect Vulnerabilities
**Vulnerability:** The application used `.includes('evzone.com')` on `parsed.hostname` to validate URLs in `isValidUrl`, allowing attackers to construct URLs like `https://evzone.com.attacker.com` to bypass domain checks. This is an Open Redirect and potentially Server-Side Request Forgery (SSRF) vulnerability.
**Learning:** Naive substring checking for hostname validation is inadequate and often bypassed using subdomain prefixing (e.g., `trusted.com.evil.com`) or suffixing.
**Prevention:** Implement strict Regular Expression matching or exact equality `===` checking against a whitelist of known safe domains. Additionally, strip whitespace characters (`\n`, `\r`, `\t`) and explicitly handle safe relative paths.
