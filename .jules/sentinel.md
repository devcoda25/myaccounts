## 2025-02-20 - Fix SSRF and Malicious Schema Vulnerabilities in URL Sanitizers
**Vulnerability:** The `isValidUrl` and `sanitizeUrl` functions used `.includes('evzone.com')` for domain validation (allowing `evzone.com.attacker.com`) and attempted to mutate the protocol without explicit allowlists, failing silently for malicious schemas like `javascript:`.
**Learning:** URL protocols cannot be safely mutated without an allowlist because modifying `url.protocol` fails silently on special schemas. Furthermore, `.includes()` is inherently vulnerable to subdomain bypasses during domain validation.
**Prevention:** Always use exact matching (`===`) or `.endsWith()` for domain validation and enforce explicit protocol allowlists (e.g., `http:`, `https:`) before processing URLs.
