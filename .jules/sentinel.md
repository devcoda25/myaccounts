## 2026-09-25 - Prevent SSRF/Open Redirect Bypasses in URL Sanitization
**Vulnerability:** URL sanitization in `src/sanitizers/url.ts` used `.includes('evzone.com')` for hostname validation. This allowed an attacker to bypass domain checks using domains like `attacker-domain.com/evzone.com` or `evzone.com.attacker.com`.
**Learning:** Using `.includes()` on hostnames is insecure as it permits attacker-controlled domains to slip through if they simply incorporate the target string.
**Prevention:** Always use strict equality (`===`) or strict suffix matching (`.endsWith()` coupled with a leading dot or strict domain boundary) to validate hostnames, and additionally strip whitespace characters before parsing.
