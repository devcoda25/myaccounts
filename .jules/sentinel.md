## 2026-09-26 - Fix URL Validation SSRF/XSS Bypass
**Vulnerability:** URL validation used `.includes()` for domain matching, allowing bypasses (e.g., `attacker-evzone.com`). It also didn't explicitly strip whitespace or block `javascript:` protocols before hostname validation.
**Learning:** Always use strict equality (`===`) combined with strict suffix matching (`.endsWith()`) for subdomains. Always strip whitespace and enforce a strict protocol allowlist (`['http:', 'https:']`) before performing any URL parsing or hostname validation to prevent SSRF and XSS.
**Prevention:** Ensure all custom URL parsing logic explicitly checks protocols and uses strict domain matching rather than loose substring matches.
