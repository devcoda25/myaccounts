## 2024-08-11 - [SSRF / Open Redirect in URL Validator]
**Vulnerability:** The `isValidUrl` and `sanitizeUrl` functions used `.includes('evzone.com')` to validate hostnames, allowing bypasses like `https://evzone.com.attacker.com` or `https://attacker.com/evzone.com`. Also, javascript payloads could parse with an empty hostname, bypassing the check.
**Learning:** Never use `.includes()` for hostname validation. Malicious users can embed the string in the path or subdomain. The URL constructor can also misinterpret protocols like `javascript:`.
**Prevention:** Use strict equality (`===`) and suffix matching (`.endsWith()`) for hostnames, and explicitly enforce protocol allowlists before checking hostnames. Always strip whitespace before parsing to prevent newline injection.
