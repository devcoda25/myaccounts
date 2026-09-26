## 2026-09-26 - Fix URL validation bypass (SSRF/Open Redirect)
- **Vulnerability:** URL validation used `.includes('evzone.com')`, allowing bypasses via malicious domains like `attacker-evzone.com` or `evzone.com.attacker.com`. It also lacked protocol allowlisting before hostname validation, leading to potential XSS bypasses (e.g., `javascript:`), and lacked whitespace stripping.
- **Learning:** When using `new URL()` for validation, `.includes()` is insufficient for domain matching, and protocols must be explicitly allowlisted before hostname validation.
- **Prevention:** Always use strict equality (`===`) combined with strict suffix matching (`.endsWith()` for subdomains), enforce protocol allowlists (e.g., `['http:', 'https:']`), and strip whitespace before passing to `new URL()`.
