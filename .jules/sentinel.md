## 2026-09-10 - Prevent SSRF and XSS via strict URL validation
**Vulnerability:** URL sanitization utilities used `.includes('evzone.com')` for hostname validation, allowing SSRF bypasses via domains like `attacker-evzone.com`. Additionally, `sanitizeUrl` lacked a strict protocol allowlist, permitting XSS payloads via `javascript:` protocols.
**Learning:** Permissive `includes()` matching on hostnames fails to properly restrict boundaries. The `URL` constructor parses `javascript:` payloads without error and assigns empty hostnames, completely bypassing subdomain checks.
**Prevention:** Always enforce a strict protocol allowlist before evaluating hostnames. For hostname validation, use exact equality (`=== 'domain.com'`) or strict suffix matching (`.endsWith('.domain.com')`).
