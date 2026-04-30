## 2024-05-24 - URL Sanitizer Bypasses
**Vulnerability:** The URL sanitizer `isValidUrl` used `.includes('evzone.com')` allowing bypass via `.evzone.com.attacker.com`. Additionally, `sanitizeUrl` attempted to upgrade HTTP to HTTPS but failed to explicitly block dangerous schemas like `javascript:`.
**Learning:** URL API `.protocol` mutation fails silently for special schemas. Never rely on `.includes` for domain validation.
**Prevention:** Always use strict `.endsWith` or exact match for domains. Always validate schemas against an explicit allowlist (e.g., `http:`, `https:`) and return safely if validation fails.
