## 2025-03-05 - 🛡️ Sentinel: Fix URL Sanitization Bypass

**Vulnerability:** XSS and Server-Side Request Forgery (SSRF) risk due to weak URL validation. The `isValidUrl` check used `.includes('evzone.com')` instead of exact matching or prefix matching, allowing malicious domains like `evzone.com.evil.com` to bypass checks. The `sanitizeUrl` function also failed to block dangerous protocols like `javascript:` and incorrectly rejected valid relative URLs.

**Learning:** When validating domain names, `.includes()` is extremely dangerous because it can match sub-strings anywhere in the hostname. Furthermore, when dealing with injected href/src paths, explicitly enforcing `http:` and `https:` is critical to block script execution via `javascript:` URIs.

**Prevention:** Always use exact matching (`===`) or strict suffix matching (`.endsWith('.domain.com')`) for hostnames. Ensure all user-provided URLs have their protocol verified before trusting them in an anchor tag or iframe.
