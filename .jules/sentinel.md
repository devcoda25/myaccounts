## 2025-04-07 - [CRITICAL] Prevent Open Redirect / SSRF in Domain Validation
**Vulnerability:** `isValidUrl` used `.includes('evzone.com')` to validate domain names, which allows bypasses like `evzone.com.attacker.com`. Also, `sanitizeUrl` mutated protocols from `javascript:` to `https:` instead of rejecting them, which fails silently because the URL API doesn't allow changing certain protocols.
**Learning:** The URL API mutates protocols unpredictably for special schemas. Never use `.includes()` for domain validation, always use exact match or `.endsWith()`. Always reject unapproved protocols instead of mutating.
**Prevention:** Use `.endsWith('.domain.com') || === 'domain.com'` for domain checks. Reject non-HTTP(S) protocols outright.
