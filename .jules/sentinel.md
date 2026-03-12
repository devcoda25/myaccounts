## 2024-03-12 - URL Validation Vulnerabilities
**Vulnerability:**
The `isValidUrl` and `sanitizeUrl` functions previously utilized `.includes('evzone.com')` for domain verification. This loose checking method introduced Open Redirect and Server-Side Request Forgery (SSRF) vulnerabilities, as an attacker could supply domains like `evzone.com.attacker.com` which would bypass the check. Additionally, `sanitizeUrl` was prone to Cross-Site Scripting (XSS) due to silent failure behavior when assigning `protocol` for `javascript:` URIs (e.g., `parsed.protocol = 'https:'` fails silently, leaving the URI intact).

**Learning:**
String checking methods like `.includes()` or `.indexOf()` must not be used for domain validation. Furthermore, the JavaScript `URL` API ignores assignments to `.protocol` for non-standard schemas, making it dangerous to attempt mutation rather than rejecting them outright.

**Prevention:**
Always use exact matching (`===`) or suffix validation (`.endsWith()`) when validating target domains. Always validate URIs against an allowlist of approved schemas (e.g., `http:`, `https:`) and explicitly reject unsupported ones rather than attempting to mutate them into safe formats.
