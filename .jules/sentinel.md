## 2024-05-15 - [Title]
**Vulnerability:** [What you found]
**Learning:** [Why it existed]
**Prevention:** [How to avoid next time]

## 2024-05-24 - Fix XSS and Open Redirect in URL sanitizers
**Vulnerability:** The `isValidUrl` and `sanitizeUrl` functions had vulnerabilities. `isValidUrl` used `.includes('evzone.com')` to check the hostname, which could be bypassed by an attacker using a subdomain of a malicious site (e.g., `https://evzone.com.attacker.com`). `sanitizeUrl` attempted to change non-HTTPS protocols to HTTPS, but modifying `URL.protocol` fails silently for special schemas like `javascript:`, allowing XSS payloads like `javascript:alert(1)` to pass through unchanged.
**Learning:** The JS `URL` API does not mutate special schemas like `javascript:` when `URL.protocol` is reassigned. Domain validation using `.includes()` is inherently insecure as it matches anywhere in the hostname string.
**Prevention:** Always use exact matching (`===`) or `.endsWith()` to validate hostnames against an allowlist. For protocol validation, explicitly validate against an allowlist (e.g., `['http:', 'https:']`) and reject unapproved protocols instead of attempting mutation.
