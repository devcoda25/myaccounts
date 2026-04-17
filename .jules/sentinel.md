## 2024-11-20 - Fix Open Redirect via weak domain validation
**Vulnerability:** URL validation and sanitization (`isValidUrl`, `sanitizeUrl`) in `src/sanitizers/url.ts` used `.includes('evzone.com')` and `.includes('evzone')` on hostnames. This allowed bypasses by using domains like `evzone.com.attacker.com` or `attacker.com/evzone.com`, leading to Server-Side Request Forgery (SSRF) and Open Redirect.
**Learning:** Checking for substrings in domain names is fundamentally insecure because subdomains or crafted domains can easily match.
**Prevention:** Always use strict exact matching (`===`) or `.endsWith('.domain.com')` (with the leading dot or strict parsing) when validating hostnames against an allowlist.
