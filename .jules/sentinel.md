## 2026-10-11 - URL Validation and Sanitization Bypass
**Vulnerability:** URL validation used `.includes('evzone.com')` allowing subdomains like `evzone.com.attacker.com`. `sanitizeUrl` allowed `javascript:` protocols, leading to XSS.
**Learning:** The `URL` constructor parsing is tolerant of whitespace and `javascript:` schemes. `.includes` on hostnames is insecure.
**Prevention:** Always explicitly strip whitespace with `url.replace(/[\n\r\t]/g, '').trim()`. Enforce strict protocol allowlists (`['http:', 'https:']`). Use exact matching or `.endsWith('.domain.com')` for domains.
