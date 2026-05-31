
## 2024-05-24 - URL Validation Bypass leading to Open Redirect & SSRF
**Vulnerability:** The `isValidUrl` function utilized `.includes('evzone.com')` to validate redirect URLs, which allows attackers to bypass domain restrictions using subdomains like `evzone.com.attacker.com` leading to Open Redirect and SSRF vulnerabilities.
**Learning:** Naive substring matching on URL hostnames is insecure. Attackers can embed allowed strings anywhere in the host string. Strict regex matching or exact domain matching must be used. Furthermore, native `URL` constructors may throw for relative paths but bypass strict checks for certain schemas like `javascript:`.
**Prevention:** Use a strict regex like `/^([a-z0-9-]+\.)*(evzone\.com|evzone\.app|evzonemarketplace\.com)$/i` to validate hostnames, ensure protocol validation occurs against an exact allowlist before string mutation, and provide explicit, safe fallback handling for relative paths via an regex anchor `^\/`.
