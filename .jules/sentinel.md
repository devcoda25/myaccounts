## 2024-05-24 - Strict URL Validation

**Vulnerability:** Weak URL validation (`.includes()`) and unsafe URL mutation logic using the `URL` API allowed SSRF/XSS and Open Redirect vulnerabilities via bypassed domain checks and special schemas (`javascript:`).
**Learning:** `URL.protocol` fails silently on modification for special schemas. Using `.includes('evzone.com')` matches `evzone.com.attacker.com` leading to domain bypasses.
**Prevention:** Use strictly matching hostnames (`===` or `.endsWith`) for URLs. Deny immediately rather than relying purely on URL modification/mutation for unsafe protocols.
