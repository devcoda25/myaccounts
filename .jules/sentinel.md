## 2026-09-21 - Fix URL validation SSRF bypass
**Vulnerability:** The `isValidUrl` and `sanitizeUrl` functions used `.includes('evzone.com')` for hostname validation, allowing SSRF/Open Redirect bypasses via attacker domains like `attacker-evzone.com`. It also didn't strip control characters before parsing.
**Learning:** `.includes()` is dangerous for domain validation. Newlines/tabs can also manipulate URL parsing if not stripped.
**Prevention:** Always use strict equality (`===`) for exact domain matches and strict suffix matching (`.endsWith('.domain.com')`) for subdomains. Strip whitespace characters before passing URLs to `new URL()`.
