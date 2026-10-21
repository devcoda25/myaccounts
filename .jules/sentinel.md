## 2026-10-21 - Fix URL validation and sanitization bypasses
**Vulnerability:** URL validation and sanitization used loose `.includes('evzone.com')` checks for hostnames, allowing domains like `attacker-evzone.com`. Furthermore, the sanitization function lacked strict protocol checking, permitting protocols like `javascript:`.
**Learning:** Loosely matched hostname methods like `.includes()` can be bypassed to cause SSRF or Open Redirects. The `URL` constructor parses `javascript:` without error, so protocol allowlists must always be enforced explicitly.
**Prevention:** Always use exact matching (`===`) or strict suffix matching (`.endsWith()`) for hostnames. Always enforce a strict protocol allowlist (`['http:', 'https:']`) before performing any URL validations.
