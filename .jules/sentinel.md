
## 2024-05-18 - Fix URL Validation and Sanitization Bypasses
**Vulnerability:** `isValidUrl` used insecure `.includes()` matching for domain verification allowing SSRF/Open Redirects (e.g. `evzone.com.attacker.com`). `sanitizeUrl` did not strictly check schemas and allowed `javascript:` schemas to persist because modifying `url.protocol` fails silently on special schemas.
**Learning:** URL sanitizers must explicitly validate the schema against a strict allowlist (`http:`, `https:`) and reject unapproved protocols instead of attempting mutation, as the JavaScript URL API will silently ignore assignments to `parsed.protocol` for schemas like `javascript:`. Domain validation must use exact matching or `.endsWith()` to prevent bypasses via subdomains.
**Prevention:** Always use strict protocol allowlists and exact/suffix matching for domain validation. Do not rely on `protocol` mutations to fix insecure schemas.
