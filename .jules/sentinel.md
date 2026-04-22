
## 2024-05-18 - URL Validation and Sanitization Bypass
**Vulnerability:** Weak URL validation (`.includes()`) allows Open Redirect/SSRF, and missing protocol allowlist in sanitization allows `javascript:` URLs (XSS).
**Learning:** Always use strict domain matching (`===` or `.endsWith()`) and explicit protocol allowlists rather than assuming non-HTTP URLs are safe or invalid.
**Prevention:** Use exact domain matching or strict regex. Allowlist `http:` and `https:` explicitly in sanitizers.
