## 2023-11-20 - [CRITICAL] Fix URL validation bypass
**Vulnerability:** URL sanitization functions `isValidUrl` and `sanitizeUrl` used `includes()` to match hostnames, allowing partial matches like `attacker-evzone.com` and SSRF/Open Redirect vulnerabilities.
**Learning:** `includes()` or partial string matching on hostnames is insecure and allows easy bypasses.
**Prevention:** Use strict equality (`===`) for exact domains and strict suffix matching (`.endsWith('.domain.com')`) for subdomains, strip whitespace before parsing, safely handle relative paths, and enforce strict protocol allowlists.
