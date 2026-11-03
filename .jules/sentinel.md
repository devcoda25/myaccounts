## 2026-11-03 - Fix loose hostname validation (SSRF/Open Redirect)
**Vulnerability:** Loose URL matching with `.includes('domain.com')` allows bypasses (e.g. `domain.com.attacker.com` or `attacker-domain.com`). Missing whitespace sanitization allows newline/tab injection in URLs. URL parsing without strict protocol checks allows `javascript:` execution.
**Learning:** `.includes()` should never be used for hostname security checks. `new URL()` behavior is permissive.
**Prevention:** Always sanitize whitespace before parsing URLs. Always enforce a strict protocol allowlist. Always use exact matching (`===`) or strict suffix matching (`.endsWith()` with a preceding dot) for hostnames.
