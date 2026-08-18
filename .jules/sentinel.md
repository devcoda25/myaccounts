## 2024-08-18 - SSRF and Open Redirect bypass in URL validation
**Vulnerability:** `isValidUrl` and `sanitizeUrl` used loose `.includes('evzone.com')` logic, which permitted malicious bypasses like `attacker-evzone.com` or `evzone.com.attacker.com`. Additionally, URL parsing lacked strict whitespace stripping and relative path support.
**Learning:** Using JavaScript's `URL` constructor with weak substring checks on the `hostname` allows SSRF and Open Redirect bypasses. Relying on `.includes()` for domain verification is highly insecure.
**Prevention:** Always use strict equality (`=== 'domain.com'`) combined with strict suffix matching (`.endsWith('.domain.com')`) for hostname verification. Prioritize strict protocol allowlists and strip whitespace `[\n\r\t]` prior to URL parsing.
