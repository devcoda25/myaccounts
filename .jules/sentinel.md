## 2024-04-04 - Fix URL Validation and Sanitization Bypasses
**Vulnerability:** URL validation using `.includes()` on the hostname allowed bypasses (e.g., `evzone.com.attacker.com`). URL sanitization failed silently when trying to modify the protocol of `javascript:` schemas, returning the original XSS payload.
**Learning:** `new URL()` silent failures for schema manipulation is a known browser/Node quirk, and `.includes()` is never safe for domain validation.
**Prevention:** Always use exact matching (`===`) or `.endsWith()` for domain validation. Always use an explicit allowlist for URL schemas (e.g., `http:`, `https:`) and reject any schemas that do not match rather than trying to mutate them.
