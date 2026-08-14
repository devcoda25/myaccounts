## 2024-08-14 - URL Validation SSRF and XSS Bypass
**Vulnerability:** The isValidUrl and sanitizeUrl utilities used .includes('evzone.com') allowing SSRF via attacker domains, failed to strip whitespace allowing bypasses, and sanitizeUrl didn't restrict protocols leading to XSS via javascript: URLs.
**Learning:** Using new URL() without strict protocol allowlisting and using .includes() for hostname validation allows trivial bypasses for both XSS and SSRF/Open Redirect vulnerabilities.
**Prevention:** Always enforce strict protocol allowlists (e.g., ['http:', 'https:']), handle safe relative paths explicitly, strip whitespace before parsing, and use strict equality or .endsWith() for domain validation.
