## 2024-05-18 - [CRITICAL/HIGH] Fix Open Redirect and SSRF in URL sanitizers
**Vulnerability:** URL validation used `.includes('evzone.com')`, allowing bypasses via domains like `attacker-evzone.com` or `evzone.com.attacker.com`.
**Learning:** Never use `.includes()` for hostname validation. Malicious inputs can easily bypass this check.
**Prevention:** Use strict equality (`=== 'evzone.com'`) and suffix matching (`.endsWith('.evzone.com')`) for domain validation, enforce strict protocol allowlists, and strip whitespace characters to avoid bypasses.
