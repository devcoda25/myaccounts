## 2026-09-30 - Insecure URL Validation (SSRF/Open Redirect)
**Vulnerability:** The `isValidUrl` and `sanitizeUrl` functions use loose `.includes('evzone.com')` string matching on the hostname and lack whitespace stripping, allowing attackers to bypass validation using domains like `evzone.com.attacker.com` or whitespace injection.
**Learning:** Using `.includes()` on hostnames is dangerous for security boundaries. Whitespace can trick parsers into misinterpreting the URL structure.
**Prevention:** Always strip whitespace before parsing, use strict equality (`===`) combined with strict suffix matching (`.endsWith()` for subdomains), and enforce protocol allowlists explicitly.
