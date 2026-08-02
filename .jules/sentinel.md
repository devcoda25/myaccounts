## 2024-05-18 - URL Validation SSRF/Open Redirect Bypass
**Vulnerability:** Weak URL validation allowed bypass via `attacker-evzone.com` and `evzone.com.attacker.com` because it used `.includes('evzone.com')`. It also missed protocol allowlists, allowing `javascript:` bypasses.
**Learning:** Always use strict equality and strict suffix matching (`endsWith('.domain.com')`) for subdomains, strip whitespace before parsing, and enforce strict protocol allowlists.
**Prevention:** Use standardized secure validation wrappers instead of raw `.includes()` for URL domains.
