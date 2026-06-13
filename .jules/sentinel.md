## 2024-05-20 - [URL Sanitization Vulnerability via `.includes()`]
**Vulnerability:** The application used `.includes('evzone.com')` to validate if a URL hostname is trusted. This pattern is vulnerable to Server-Side Request Forgery (SSRF) and Open Redirect bypasses, as it would match malicious domains like `evzone.com.attacker.com` or `my-evzone.com`.
**Learning:** Checking for substrings in domain validation allows attackers to craft domains that satisfy the check but point to unintended destinations.
**Prevention:** Always use strict equality (`===`) or exact suffix matching (`.endsWith('.domain.com')`) for domain validation. Ensure proper parsing with `new URL()` to correctly extract the hostname before checking.
