## 2026-09-17 - [Strict URL Validation Enforcement]
**Vulnerability:** URL validation logic was using `.includes('evzone.com')` on hostnames, permitting SSRF bypasses via subdomains (e.g. `evzone.com.attacker.com`). Furthermore, the `URL` constructor allowed parsing malicious whitespace-injected URLs like `javascript:\nalert(1)//evzone.com`.
**Learning:** Broad hostname matching and failing to strip whitespace prior to URL parsing creates critical open redirect and SSRF vulnerabilities.
**Prevention:** Always strip whitespace using `url.replace(/[\n\r\t]/g, '').trim()` prior to URL parsing. Strict protocol allowlists must be enforced before hostnames are evaluated, and domains must be verified using strict equality (`===`) or exact suffix matching (`.endsWith()`).
