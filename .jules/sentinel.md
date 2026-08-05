## 2024-05-24 - [CRITICAL] Fix URL validation bypass (SSRF/Open Redirect)
**Vulnerability:** URL validation and sanitization used `.includes('evzone.com')` and `.includes('evzone')` which allowed bypasses via malicious domains (e.g., `attacker-evzone.com` or `evzone.com.attacker.com`). Also missing protection against whitespace injection and javascript/data protocol bypasses.
**Learning:** `URL` parsing can accept whitespaces and unexpected protocols. Using `.includes` on hostnames is never safe for security controls.
**Prevention:** Always use strict equality (`===`) and strict suffix matching (`.endsWith`) for domain validation. Strip control characters before parsing, handle relative paths safely, and strictly allowlist protocols before evaluating hostnames.
