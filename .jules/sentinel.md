## 2024-05-24 - [SSRF/Open Redirect]
**Vulnerability:** URL validation in `isValidUrl` used `.includes('evzone.com')`, allowing bypasses via `attacker-evzone.com` or `evzone.com.attacker.com`. It also lacked proper whitespace stripping and safe relative path handling, breaking client-side routing.
**Learning:** `URL` constructor parsing needs strictly formatted URLs and relative paths cause exceptions. Domain validation must use strict equality or `.endsWith('.domain.com')` to safely match subdomains.
**Prevention:** Always strip whitespace before URL parsing. Handle relative paths explicitly before using `new URL()`. Use exact match and strict suffix matching instead of `.includes()` for domain validation.
