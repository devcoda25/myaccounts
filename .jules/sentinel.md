## 2024-04-26 - URL Sanitization Bypass via Protocol Mutation & Weak Domain Validation
**Vulnerability:** `sanitizeUrl` returned `javascript:` URLs unmodified because mutating `url.protocol` fails silently for special schemas. Domain validation used `.includes()`, allowing SSRF/Open Redirects via subdomains like `evzone.com.attacker.com`.
**Learning:** JavaScript `URL` API does not allow protocol mutation for `javascript:`. String `.includes()` is dangerous for domain verification.
**Prevention:** Always enforce an explicit protocol allowlist (`http:`, `https:`) and reject unapproved protocols. Always use exact matching (`===`) or `.endsWith()` for domain validation.
