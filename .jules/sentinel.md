## 2025-02-18 - [Fix URL validation bypass]
**Vulnerability:** Open Redirect and SSRF vulnerabilities were found due to weak domain validation in `isValidUrl` (using `.includes('evzone.com')`), which allowed bypasses like `evzone.com.attacker.com` and `javascript://\nevzone.com`.
**Learning:** Naive substring checks for domain validation are easily bypassed using malicious subdomains or path injections. Also, parsing malformed URLs containing newlines can lead to protocol bypasses when using the `URL` constructor.
**Prevention:** Always use strict regex matching (`/^([a-z0-9-]+\.)*(evzone\.com|evzone\.app|evzonemarketplace\.com)$/i`) for domain validation and strip whitespace characters from URLs before parsing them.
