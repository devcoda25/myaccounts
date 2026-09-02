## 2026-09-02 - [CRITICAL] Fix SSRF and XSS in URL sanitizers
**Vulnerability:** URL validation used `.includes('evzone.com')` which allows SSRF bypasses via malicious domains (e.g., `attacker-evzone.com`). The sanitizer also failed to enforce a strict protocol allowlist, permitting `javascript:` URIs leading to XSS.
**Learning:** Never use `.includes()` for domain validation. Always use strict equality and exact suffix matching. Always enforce strict protocol allowlists to prevent dangerous URI schemes.
**Prevention:** Implement strict hostname matching (`===` and `.endsWith()`) and explicit protocol allowlists (`['https:', 'http:']`) before evaluating URLs.
