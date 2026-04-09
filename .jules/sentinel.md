
## 2024-04-09 - Fix URL Sanitization and Validation
**Vulnerability:** URL sanitization could be bypassed using `javascript:` schemas because `URL.protocol` assignment fails silently for special schemas, leading to potential XSS. Additionally, domain validation used `.includes('evzone.com')` which could be bypassed with domains like `evzone.com.attacker.com`, leading to potential SSRF/Open Redirects.
**Learning:** The JavaScript `URL` API silently ignores protocol mutation for certain special protocols (like `javascript:`). Using `.includes` for domain checking is fundamentally insecure and vulnerable to prefix/suffix spoofing attacks.
**Prevention:** Always enforce an explicit allowlist of safe protocols (e.g., `http:`, `https:`) before processing URLs, and reject unapproved protocols instead of mutating them. Use strict exact matching (`===`) or `.endsWith('.domain.com')` when validating trusted hostnames.
