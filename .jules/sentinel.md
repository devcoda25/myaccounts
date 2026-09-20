
## 2026-09-20 - [URL Validation Bypasses (SSRF & XSS)]
**Vulnerability:** URL validation relied on `.includes('evzone.com')` allowing SSRF via domains like `evzone.com.attacker.com`. The `URL` parser was also bypassed using `javascript:alert(1)//evzone.com`, which returns an empty hostname and bypasses strict protocol checks when extracting domains. Whitespace injection could also bypass initial URL parsing checks.
**Learning:** The `URL` constructor does not enforce HTTP/HTTPS by default, allowing payloads like `javascript:` which evaluate to empty hostnames but parse successfully. Domain validation must use strict equality or `.endsWith('.domain.com')`.
**Prevention:** Always strip whitespace (`/[\n\r\t]/g`), enforce a strict protocol allowlist (`['http:', 'https:']`) BEFORE evaluating the hostname, and use strict suffix matching for domain validation.
