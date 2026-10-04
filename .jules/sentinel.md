## 2026-10-04 - URL Parsing Vulnerabilities and Bypass Techniques
**Vulnerability:** Weak hostname validation (using `includes('evzone.com')`) allows bypass via subdomains of malicious sites (e.g., `evzone.com.evil.com`). Also, the `URL` constructor in JavaScript tolerates trailing/leading whitespaces and can evaluate the `javascript:` protocol, allowing XSS bypasses.
**Learning:** Always use strict equality (`===`) or `endsWith` for hostname validation. Always strip whitespaces (`[\n\r\t]`) prior to parsing, and enforce strict protocol allowlists *before* trusting the hostname.
**Prevention:** Implement strict protocol allowlists (e.g., `['http:', 'https:']`), use `endsWith('.evzone.com')` for subdomains, and strip `\n\r\t` and trim URLs before passing them to the `URL` constructor.
