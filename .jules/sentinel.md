## 2024-05-18 - [HIGH] Fix Open Redirect & SSRF Bypass in URL Validator
**Vulnerability:** URL validation using `.includes()` allowed domain impersonation (e.g., `evzone.com.attacker.com`).
**Learning:** Never use substring matching for domain validation. Parsing behavior ignores whitespace before the protocol.
**Prevention:** Always strip whitespace before parsing, explicitly handle safe relative routes, and use strict exact matching or Regex anchored with boundary markers for trusted domains.
