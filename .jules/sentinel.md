## 2026-09-03 - [CRITICAL] Prevent SSRF and Open Redirect in URL validation
**Vulnerability:** The `isValidUrl` and `sanitizeUrl` functions use `.includes('evzone.com')` for hostname validation, allowing bypasses like `attacker-evzone.com`. They also improperly handle payloads like `javascript:alert(1)//evzone.com`.
**Learning:** Using `.includes()` is insufficient for domain validation. Safe relative URLs must be explicitly handled before parsing.
**Prevention:** Use strict equality combined with `.endsWith('.evzone.com')` for subdomains. Strip whitespace (`replace(/[\n\r\t]/g, '').trim()`) and enforce a protocol allowlist before domain validation.
