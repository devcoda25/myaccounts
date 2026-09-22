## 2026-09-22 - URL Validation Bypass
**Vulnerability:** URLs could bypass SSRF/validation using .includes('domain.com') allowing attacker-domain.com and newline characters bypassing protocol parsing.
**Learning:** Never use .includes() for domain validation. Newlines in JS URL parser can cause protocol confusion.
**Prevention:** Always strip whitespace before URL parsing. Use strict equality or .endsWith('.domain.com') for hostnames.
