## 2025-02-15 - URL Protocol Mutation Silently Fails for `javascript:` & Domain Validation bypass

**Vulnerability:**
The `sanitizeUrl` function in `src/sanitizers/url.ts` attempted to mutate `url.protocol` if it was not `https:`. However, when using the JavaScript `URL` API, modifying `url.protocol` fails silently for special schemas like `javascript:`. This means an attacker could provide a `javascript://evzone.com/%0Aalert(1)` URL and it bypassed sanitization, potentially leading to XSS if injected into `href` or `src`. Additionally, `isValidUrl` used `.includes('evzone.com')` for domain validation, which allows SSRF and Open Redirect bypasses (e.g., `attacker-evzone.com` or `evzone.com.attacker.com`).

**Learning:**
URL sanitizers must explicitly validate against an allowlist (e.g., `http:`, `https:`) and reject unapproved protocols completely instead of attempting mutation. When validating domain names, never use `.includes()`.

**Prevention:**
Always use exact matching (`===`) or `.endsWith()` for domain validation to prevent SSRF and Open Redirect vulnerabilities. Reject invalid URL schemes entirely.
