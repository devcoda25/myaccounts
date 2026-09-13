## 2026-09-13 - Prevent SSRF and Protocol Bypass in URL Validation
**Vulnerability:** Domain validation used `.includes('evzone.com')`, allowing bypasses via domains like `attacker-evzone.com`. URL sanitation lacked a protocol allowlist, allowing `javascript:` URIs.
**Learning:** Using `.includes()` for hostname validation in security boundaries is unsafe. The `URL` constructor parses `javascript:` payloads without throwing errors.
**Prevention:** Always use strict equality (`===`) and suffix matching (`.endsWith()`) for domains. Always strip whitespace and enforce strict protocol allowlists (`['https:', 'http:', 'mailto:', 'tel:']`) before evaluating URLs.
